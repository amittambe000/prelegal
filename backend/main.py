"""FastAPI main application."""
import json
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import get_db, init_db
from .models import User, Document
from .schemas import (
    UserCreate, UserLogin, UserResponse,
    DocumentCreate, DocumentUpdate, DocumentResponse,
    MessageResponse, ChatRequest, ChatResponse, GreetingResponse, FieldConfidence
)
from .auth import hash_password, verify_password, create_jwt_token, get_current_user
from .ai import extract_fields_from_conversation, generate_followup_message, get_greeting, MutualNDAFields


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(title="Prelegal API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/api/chat/greeting", response_model=GreetingResponse)
def get_chat_greeting():
    """Get AI greeting for chat interface."""
    greeting = get_greeting()
    return {"greeting": greeting}


@app.post("/api/chat/message", response_model=ChatResponse)
def chat_message(request: ChatRequest):
    """Process chat message and extract NDA fields."""
    # Build full conversation including current message
    messages = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
    messages.append({"role": "user", "content": request.message})

    # Extract fields using AI
    extracted_fields, confidence_scores = extract_fields_from_conversation(messages)

    # Generate response based on what's missing/uncertain
    all_field_names = list(MutualNDAFields.model_fields.keys())
    response_message = generate_followup_message(extracted_fields, confidence_scores, all_field_names)

    # Build response with field confidence
    fields_with_confidence = {
        k: FieldConfidence(value=v, confidence=confidence_scores.get(k, 0.0))
        for k, v in extracted_fields.items()
    }

    # Check if all fields are complete
    is_complete = all(name in extracted_fields and extracted_fields[name] for name in all_field_names)

    return ChatResponse(
        message=response_message,
        extracted_fields=fields_with_confidence,
        is_complete=is_complete
    )


@app.post("/api/auth/signup", response_model=UserResponse)
def signup(user_data: UserCreate, response: Response, db: Session = Depends(get_db)):
    """Create a new user account."""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user_data.password)

    new_user = User(
        id=user_id,
        email=user_data.email,
        hashed_password=hashed_pw
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_jwt_token(user_id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax"
    )

    return new_user


@app.post("/api/auth/signin", response_model=UserResponse)
def signin(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Sign in to an existing account."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_jwt_token(user.id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax"
    )

    return user


@app.post("/api/auth/signout", response_model=MessageResponse)
def signout(response: Response):
    """Sign out and clear authentication cookie."""
    response.delete_cookie(key="access_token")
    return {"message": "Signed out successfully"}


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current authenticated user."""
    return current_user


@app.get("/api/documents", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all documents for the current user."""
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()

    return [
        DocumentResponse(
            id=doc.id,
            document_type=doc.document_type,
            title=doc.title,
            form_data=json.loads(doc.data),
            created_at=doc.created_at,
            updated_at=doc.updated_at
        )
        for doc in documents
    ]


@app.post("/api/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    document_data: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new document."""
    doc_id = str(uuid.uuid4())

    new_doc = Document(
        id=doc_id,
        user_id=current_user.id,
        title=document_data.title,
        data=json.dumps(document_data.form_data)
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    return DocumentResponse(
        id=new_doc.id,
        document_type=new_doc.document_type,
        title=new_doc.title,
        form_data=json.loads(new_doc.data),
        created_at=new_doc.created_at,
        updated_at=new_doc.updated_at
    )


@app.get("/api/documents/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific document."""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    return DocumentResponse(
        id=document.id,
        document_type=document.document_type,
        title=document.title,
        form_data=json.loads(document.data),
        created_at=document.created_at,
        updated_at=document.updated_at
    )


@app.put("/api/documents/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: str,
    update_data: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a document."""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    if update_data.title is not None:
        document.title = update_data.title
    if update_data.form_data is not None:
        document.data = json.dumps(update_data.form_data)

    db.commit()
    db.refresh(document)

    return DocumentResponse(
        id=document.id,
        document_type=document.document_type,
        title=document.title,
        form_data=json.loads(document.data),
        created_at=document.created_at,
        updated_at=document.updated_at
    )


@app.delete("/api/documents/{document_id}", response_model=MessageResponse)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document."""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}


app.mount("/", StaticFiles(directory="static", html=True), name="static")
