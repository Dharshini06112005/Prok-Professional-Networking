const API_URL = import.meta.env.VITE_API_URL || "https://prok-professional-networking-t19l.onrender.com";

export interface PostListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  visibility?: string;
  tag?: string;
  sort?: string;
}

export interface PostListResponse {
  posts: any[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export const postsApi = {
  createPost: async (formData: FormData) => {
    const response = await fetch(`${API_URL}/api/posts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    return response.json();
  },

  getPosts: async (params: PostListParams = {}): Promise<PostListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.category) searchParams.append('category', params.category);
    if (params.visibility) searchParams.append('visibility', params.visibility);
    if (params.tag) searchParams.append('tag', params.tag);
    if (params.sort) searchParams.append('sort', params.sort);

    const response = await fetch(`${API_URL}/api/posts/?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getCategories: async (): Promise<{ categories: string[] }> => {
    const response = await fetch(`${API_URL}/api/posts/categories`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getPopularTags: async (): Promise<{ tags: string[] }> => {
    const response = await fetch(`${API_URL}/api/posts/popular-tags`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
}; 