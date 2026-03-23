export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Document {
  id: string;
  document_type: string;
  title: string;
  form_data: any;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  detail: string;
}
