const API_URL = import.meta.env.VITE_API_URL || "https://prok-professional-networking-t19l.onrender.com";

export const feedApi = {
  getFeed: async () => {
    const response = await fetch(`${API_URL}/feed`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getFeedByUser: async (userId: number) => {
    const response = await fetch(`${API_URL}/feed/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
}; 