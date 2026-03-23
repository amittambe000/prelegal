import { NDAFormData } from './nda';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FieldConfidence {
  value: string | null;
  confidence: number;
}

export interface ChatResponse {
  message: string;
  extracted_fields: Record<string, FieldConfidence>;
  is_complete: boolean;
}

export interface GreetingResponse {
  greeting: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: Array<{ role: string; content: string }>;
}
