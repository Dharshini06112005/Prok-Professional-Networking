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

// Network error detection with retry logic
async function safeFetch(url: string, options: RequestInit = {}, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // If response is ok or it's a client error (4xx), don't retry
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      // For server errors (5xx), retry
      if (response.status >= 500 && attempt < retries) {
        console.log(`Attempt ${attempt + 1} failed with status ${response.status}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        continue;
      }
      
      return response;
      
    } catch (error: any) {
      if (attempt === retries) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - please try again');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network connection failed - please check your internet connection');
        } else {
          throw new Error(`Network error: ${error.message}`);
        }
      }
      
      // Retry for network errors
      console.log(`Attempt ${attempt + 1} failed with error: ${error.message}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
    }
  }
  
  throw new Error('All retry attempts failed');
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
    }, 3); // 3 retries for profile updates
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
    }, 2); // 2 retries for image uploads
    return handleApiResponse(response);
  },
}; 