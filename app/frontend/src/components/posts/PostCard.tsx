import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface PostCardProps {
  post: {
    id: number;
    title: string;
    content: string;
    media_url?: string;
    media_type?: string;
    created_at: string;
    user: { name: string; email: string };
    allow_comments: boolean;
    is_public: boolean;
    likes: number;
    comments_count: number;
    views: number;
    category?: string;
    tags?: string[];
  };
}

// Helper to get absolute media URL
const getMediaUrl = (media_url: string) => {
  if (!media_url) return '';
  if (media_url.startsWith('http')) return media_url;
  return `https://prok-professional-networking-t19l.onrender.com${media_url}`;
};

const PostCard: React.FC<PostCardProps & { onDelete?: (id: number) => void }> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [mediaVisible, setMediaVisible] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);

  // Determine media type based on URL and media_type
  useEffect(() => {
    if (!post.media_url) return;
    const url = post.media_url.toLowerCase();
    const mediaType = post.media_type?.toLowerCase() || '';
    const isImageFile = url.includes('.jpg') || url.includes('.jpeg') || 
                       url.includes('.png') || url.includes('.gif') || 
                       url.includes('.webp') || url.includes('.svg') ||
                       mediaType.startsWith('image/');
    const isVideoFile = url.includes('.mp4') || url.includes('.webm') || 
                       url.includes('.avi') || url.includes('.mov') ||
                       mediaType.startsWith('video/');
    setIsImage(isImageFile);
    setIsVideo(isVideoFile);
  }, [post.media_url, post.media_type]);

  useEffect(() => {
    if (!post.media_url) return;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setMediaVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (mediaRef.current) observer.observe(mediaRef.current);
    return () => observer.disconnect();
  }, [post.media_url]);

  const mediaSrc = getMediaUrl(post.media_url || '');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`https://prok-professional-networking-t19l.onrender.com/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok && onDelete) onDelete(post.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg text-black">{post.title}</div>
        <div className="text-xs text-black">{new Date(post.created_at).toLocaleString()}</div>
        {user && user.email === post.user?.email && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
      <div className="mb-2 text-black" dangerouslySetInnerHTML={{ __html: post.content }} />
      {/* Media Display */}
      {mediaSrc && isImage && (
        <div className="my-2">
          <img
            src={mediaSrc}
            alt="Post Media"
            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', background: '#f3f4f6' }}
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
            }}
          />
        </div>
      )}
      {mediaSrc && isVideo && (
        <div className="my-2">
          <video
            src={mediaSrc}
            controls
            style={{ width: '100%', maxHeight: '300px', borderRadius: '8px', background: '#f3f4f6' }}
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-black mt-2">
        <span>By {post.user.name}</span>
        {post.category && <span>| {post.category}</span>}
        {post.tags && post.tags.length > 0 && (
          <span>| {post.tags.map(tag => `#${tag}`).join(' ')}</span>
        )}
        <span>| {post.is_public ? 'Public' : 'Private'}</span>
        <span>| {post.allow_comments ? 'Comments allowed' : 'Comments disabled'}</span>
        <span>| {post.likes} Likes</span>
        <span>| {post.comments_count} Comments</span>
        <span>| {post.views} Views</span>
        {mediaSrc && (
          <span>| {isImage ? '📷 Image' : isVideo ? '🎥 Video' : '📎 Media'}</span>
        )}
      </div>
    </div>
  );
};

export default PostCard; 