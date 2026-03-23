import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ChatMessage, ChatResponse } from '@/types/chat';
import { NDAFormData } from '@/types/nda';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearError: () => void;
}

export function useChat(
  formData: NDAFormData,
  onChange: (data: NDAFormData) => void
): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');

  // Fetch greeting on mount
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const response = await api.chat.greeting();
        const greetingMessage: ChatMessage = {
          role: 'assistant',
          content: response.greeting,
          timestamp: new Date().toISOString(),
        };
        setMessages([greetingMessage]);
      } catch (err) {
        console.error('Failed to fetch greeting:', err);
        // Use fallback greeting
        const fallbackMessage: ChatMessage = {
          role: 'assistant',
          content: 'Hi! I\'m here to help you create a Mutual NDA. Tell me about the two parties and the purpose of your agreement.',
          timestamp: new Date().toISOString(),
        };
        setMessages([fallbackMessage]);
      }
    };

    fetchGreeting();
  }, []);

  const processMessage = useCallback(
    async (userContent: string) => {
      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: userContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Build conversation history
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Call API
        const response: ChatResponse = await api.chat.sendMessage(userContent, history);

        // Add assistant response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Update form data with high-confidence extracted fields (confidence >= 0.8)
        const updates: Partial<NDAFormData> = {};
        for (const [fieldName, fieldData] of Object.entries(response.extracted_fields)) {
          if (fieldData.confidence >= 0.8 && fieldData.value) {
            updates[fieldName as keyof NDAFormData] = fieldData.value;
          }
        }

        if (Object.keys(updates).length > 0) {
          onChange({ ...formData, ...updates });
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to send message. Please try again.';
        setError(errorMessage);

        // Add error as system message
        const errorSystemMessage: ChatMessage = {
          role: 'assistant',
          content: `Error: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorSystemMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, formData, onChange]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;
      setLastUserMessage(content);
      await processMessage(content);
    },
    [isLoading, processMessage]
  );

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessage || isLoading) return;
    // Remove last error message if present
    setMessages((prev) => {
      const filtered = prev.filter(
        (msg, idx) => !(idx === prev.length - 1 && msg.content.startsWith('Error:'))
      );
      return filtered;
    });
    await processMessage(lastUserMessage);
  }, [lastUserMessage, isLoading, processMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    retryLastMessage,
    clearError,
  };
}
