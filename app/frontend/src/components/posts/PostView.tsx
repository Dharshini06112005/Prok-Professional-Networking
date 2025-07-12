import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { postsApi } from './api';

const getMediaUrl = (media_url: string) => {
  if (!media_url) return '';
  if (media_url.startsWith('http')) return media_url;
  return `https://prok-professional-networking-t19l.onrender.com${media_url}`;
};

const PostView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://prok-professional-networking-t19l.onrender.com/api/posts/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch post');
        const data = await res.json();
        setPost(data.post || data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!post) return <div className="text-center py-8">Post not found.</div>;

  const mediaSrc = getMediaUrl(post.media_url);
  const isImage = post.media_type && post.media_type.startsWith('image/');
  const isVideo = post.media_type && post.media_type.startsWith('video/');

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <div className="font-bold text-2xl mb-2">{post.title}</div>
      <div className="mb-2 text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }} />
      {mediaSrc && isImage && (
        <img
          src={mediaSrc}
          alt="Post Media"
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', background: '#f3f4f6' }}
          className="my-4"
        />
      )}
      {mediaSrc && isVideo && (
        <video
          src={mediaSrc}
          controls
          style={{ width: '100%', maxHeight: '400px', borderRadius: '8px', background: '#f3f4f6' }}
          className="my-4"
        />
      )}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
        <span>By {post.user?.name || post.user_email}</span>
        {post.category && <span>| {post.category}</span>}
        {post.tags && post.tags.length > 0 && (
          <span>| {post.tags.map((tag: string) => `#${tag}`).join(' ')}</span>
        )}
        <span>| {post.is_public ? 'Public' : 'Private'}</span>
        <span>| {post.allow_comments ? 'Comments allowed' : 'Comments disabled'}</span>
        <span>| {post.likes} Likes</span>
        <span>| {post.comments_count ?? 0} Comments</span>
        <span>| {post.views} Views</span>
      </div>
    </div>
  );
};

export default PostView; 