const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth-error'));
      }
      let errMsg = `API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errMsg = errorData.detail || errorData.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  },
  
  post: async (endpoint: string, body?: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth-error'));
      }
      let errMsg = `API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errMsg = errorData.detail || errorData.error || errMsg;
        if (Array.isArray(errMsg)) errMsg = errMsg[0].msg; // Handle FastAPI validation errors
      } catch (e) {}
      throw new Error(errMsg);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  },

  postForm: async (endpoint: string, data: Record<string, string>) => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formBody = new URLSearchParams(data).toString();

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formBody,
    });
    
    if (!response.ok) {
      let errMsg = `API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errMsg = errorData.detail || errorData.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }
    return await response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth-error'));
      }
      let errMsg = `API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errMsg = errorData.detail || errorData.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }
    return await response.json();
  },

  put: async (endpoint: string, body?: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('auth-error'));
      }
      let errMsg = `API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errMsg = errorData.detail || errorData.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }
    return await response.json();
  }
};
