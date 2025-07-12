import { useAuth } from '../../context/AuthContext';

// Helper to handle token expiry
async function handleTokenExpiry(response: Response) {
  if (response.status === 401) {
    try {
      const data = await response.json();
      if (data.msg && data.msg.includes('Token has expired')) {
        // Remove token and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    } catch (e) {
      // fallback: just logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }
}

// Enhanced error handling
async function handleApiResponse(response: Response) {
  await handleTokenExpiry(response);
  
  if (!response.ok) {
    let errorMessage = 'Network error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.msg || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}

// Network error detection
async function safeFetch(url: string, options: RequestInit = {}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network connection failed - please check your internet connection');
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

const API_URL = import.meta.env.VITE_API_URL || "https://prok-professional-networking-t19l.onrender.com";

export const profileApi = {
  getProfile: async () => {
    const response = await safeFetch(`${API_URL}/api/profile/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return handleApiResponse(response);
  },

  updateProfile: async (profileData: any) => {
    const response = await safeFetch(`${API_URL}/api/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    return handleApiResponse(response);
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await safeFetch(`${API_URL}/api/profile/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    return handleApiResponse(response);
  },
}; 