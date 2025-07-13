import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from './api';

const PostCreate: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [allowComments, setAllowComments] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    if (!title.trim()) {
      setError('Title is required.');
      return false;
    }
    if (!content.trim()) {
      setError('Post content is required.');
      return false;
    }
    if (media) {
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4', 'video/webm'];
      if (!allowed.includes(media.type)) {
        setError('Only PNG, JPG, MP4, and WEBM files are allowed.');
        return false;
      }
      if (media.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('allow_comments', allowComments.toString());
      formData.append('is_public', isPublic.toString());
      if (media) formData.append('media', media);
      
      const result = await postsApi.createPost(formData);
      
      setSuccess(true);
      setTitle('');
      setContent('');
      setMedia(null);
      setMediaPreview(null);
      setAllowComments(true);
      setIsPublic(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Navigate to posts list after successful creation
      setTimeout(() => {
        navigate('/posts');
      }, 1500);
    } catch (err: any) {
      console.error('Post creation error:', err);
      setError(err.message || 'Failed to create post - please try again');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Post</h2>
          <div>
            <button
              type="button"
              className="mr-2 text-blue-600 font-semibold"
              onClick={e => e.preventDefault()}
            >
              Preview
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
              disabled={loading || success}
            >
              {loading ? 'Posting...' : success ? 'Posted!' : 'Post'}
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1 text-black">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 text-black bg-white"
            placeholder="Enter post title"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1 text-black">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 min-h-[200px] resize-y text-black bg-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Media</label>
          <div className="border-2 border-dashed rounded p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,video/mp4,video/webm"
              onChange={handleMediaChange}
              ref={fileInputRef}
              className="hidden"
              id="media-upload"
            />
            <label htmlFor="media-upload" className="cursor-pointer block">
              <span className="text-3xl text-blue-400">⬆️</span>
              <div>Drag and drop files here or click to upload</div>
              <div className="text-xs text-gray-500">Supports images and videos up to 10MB</div>
            </label>
            {mediaPreview && (
              <div className="mt-2">
                {media?.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded-lg mx-auto" />
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mb-4 flex gap-8">
          <div>
            <input
              type="checkbox"
              id="allow-comments"
              checked={allowComments}
              onChange={e => setAllowComments(e.target.checked)}
            />
            <label htmlFor="allow-comments" className="ml-2">Allow Comments</label>
          </div>
          <div>
            <input
              type="checkbox"
              id="public-post"
              checked={isPublic}
              onChange={e => setIsPublic(e.target.checked)}
            />
            <label htmlFor="public-post" className="ml-2">Public Post</label>
          </div>
        </div>
        {error && <div className="text-red-500 mb-2 animate-shake">{error}</div>}
        {/* Preview Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2 text-black">Preview</h3>
          <div className="border rounded p-4 bg-gray-50">
            <div className="font-bold text-lg mb-2 text-black">{title}</div>
            <div className="whitespace-pre-wrap text-black">{content}</div>
            {mediaPreview && (
              <div className="mt-2">
                {media?.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded-lg mx-auto" />
                )}
              </div>
            )}
            <div className="mt-2 text-xs text-black">
              {allowComments ? 'Comments allowed' : 'Comments disabled'} | {isPublic ? 'Public' : 'Private'}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostCreate; 