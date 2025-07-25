import React, { useEffect, useState } from 'react';
import PostCard from '../posts/PostCard';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('https://prok-professional-networking-t19l.onrender.com/api/feed/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch feed: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        
        // Add comprehensive safety checks
        if (!data) {
          throw new Error('No data received from server');
        }
        
        const postsArray = data.posts || [];
        setPosts(postsArray);
      } catch (err: any) {
        console.error('Feed fetch error:', err);
        setError(err.message || 'Failed to fetch feed');
        setPosts([]); // Set empty array to prevent map errors
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-6">
        {loading && <div className="text-center py-8 text-black">Loading feed...</div>}
        {error && <div className="text-center text-red-500 py-8">{error}</div>}
        {!loading && !error && (posts || []).length === 0 && (
          <div className="text-center text-black py-8">No posts found.</div>
        )}
        {(posts || []).map(post => (
          <PostCard key={post.id} post={post} onDelete={id => setPosts(prev => (prev || []).filter(p => p.id !== id))} />
        ))}
      </div>
    </div>
  );
};

export default Feed; 