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

const API_URL = 'http://localhost:5000/api/profile/';

export const profileApi = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    await handleTokenExpiry(response);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    });
    await handleTokenExpiry(response);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  uploadProfileImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_URL}image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    await handleTokenExpiry(response);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
}; 