// API client for backend communication

interface FetchOptions extends RequestInit {
  data?: any;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { data, ...fetchOptions } = options;

  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`/api${endpoint}`, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  auth: {
    signup: (email: string, password: string) =>
      fetchAPI('/auth/signup', { method: 'POST', data: { email, password } }),

    signin: (email: string, password: string) =>
      fetchAPI('/auth/signin', { method: 'POST', data: { email, password } }),

    signout: () =>
      fetchAPI('/auth/signout', { method: 'POST' }),

    me: () =>
      fetchAPI('/auth/me'),
  },

  documents: {
    list: () =>
      fetchAPI('/documents'),

    create: (title: string, form_data: any) =>
      fetchAPI('/documents', { method: 'POST', data: { title, form_data } }),

    get: (id: string) =>
      fetchAPI(`/documents/${id}`),

    update: (id: string, data: { title?: string; form_data?: any }) =>
      fetchAPI(`/documents/${id}`, { method: 'PUT', data }),

    delete: (id: string) =>
      fetchAPI(`/documents/${id}`, { method: 'DELETE' }),
  },

  chat: {
    greeting: () =>
      fetchAPI('/chat/greeting'),

    sendMessage: (message: string, conversationHistory: Array<{ role: string; content: string }>) =>
      fetchAPI('/chat/message', {
        method: 'POST',
        data: { message, conversation_history: conversationHistory },
      }),
  },
};
