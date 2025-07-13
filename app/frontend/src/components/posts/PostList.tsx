import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import FilterBar from './FilterBar';
import SkeletonLoader from './SkeletonLoader';
import useDebounce from '../../hooks/useDebounce';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { postsApi } from './api';

const PAGE_SIZE = 10;

export interface PostListRef {
  refresh: () => void;
}

const PostList = forwardRef<PostListRef>((props, ref) => {
  const navigate = useNavigate();
  
  // Filter/sort state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [visibility, setVisibility] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState('created_at');

  // Data state
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Debounced filter/search
  const debouncedSearch = useDebounce(search, 500);
  const debouncedCategory = useDebounce(category, 500);
  const debouncedVisibility = useDebounce(visibility, 500);
  const debouncedTag = useDebounce(tag, 500);
  const debouncedSort = useDebounce(sort, 500);

  // Fetch categories and tags on mount
  useEffect(() => {
    postsApi.getCategories()
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Failed to fetch categories:', err));
    postsApi.getPopularTags()
      .then(data => setTags(data.tags || []))
      .catch(err => console.error('Failed to fetch tags:', err));
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.getPosts({
        page: reset ? 1 : page,
        per_page: PAGE_SIZE,
        search: debouncedSearch,
        category: debouncedCategory,
        visibility: debouncedVisibility,
        tag: debouncedTag,
        sort: debouncedSort,
      });
      
      // Add comprehensive safety checks
      if (!data) {
        throw new Error('No data received from server');
      }
      
      const postsArray = data.posts || [];
      const hasMorePosts = postsArray.length === PAGE_SIZE;
      
      if (reset) {
        setPosts(postsArray);
      } else {
        setPosts(prev => [...prev, ...postsArray]);
      }
      setHasMore(hasMorePosts);
    } catch (err: any) {
      console.error('Posts fetch error:', err);
      setError(err.message || 'Failed to load posts');
      // Set empty arrays to prevent map errors
      if (reset) {
        setPosts([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [page, debouncedSearch, debouncedCategory, debouncedVisibility, debouncedTag, debouncedSort]);

  // Refresh function
  const refresh = useCallback(() => {
    setPage(1);
    fetchPosts(true);
  }, [fetchPosts]);

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refresh
  }), [refresh]);

  // Reset and refetch on filter/sort change
  useEffect(() => {
    setPage(1);
    fetchPosts(true);
    // eslint-disable-next-line
  }, [debouncedSearch, debouncedCategory, debouncedVisibility, debouncedTag, debouncedSort]);

  // Fetch more on page change
  useEffect(() => {
    if (page === 1) return;
    fetchPosts();
    // eslint-disable-next-line
  }, [page]);

  // Infinite scroll
  const loadMoreRef = useInfiniteScroll({
    hasMore: hasMore && !loading,
    loading,
    onLoadMore: () => setPage(p => p + 1),
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Posts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/posts/create')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Create Post
          </button>
          <button
            onClick={refresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        tag={tag}
        onTagChange={setTag}
        tags={tags}
        sort={sort}
        onSortChange={setSort}
      />
      <div className="space-y-4 min-h-[300px]">
        {initialLoad && <SkeletonLoader count={3} />}
        {error && <div className="text-red-500 text-center">{error}</div>}
        {!loading && !error && (posts || []).length === 0 && (
          <div className="text-center text-gray-500 py-8">No posts found.</div>
        )}
        {(posts || []).map(post => (
          <div key={post.id} onClick={e => {
            // Prevent navigation if delete button is clicked
            if ((e.target as HTMLElement).closest('button')) return;
            navigate(`/posts/${post.id}`);
          }} style={{ cursor: 'pointer' }}>
            <PostCard post={post} onDelete={id => setPosts(prev => (prev || []).filter(p => p.id !== id))} />
          </div>
        ))}
        {/* Infinite scroll loader */}
        <div ref={loadMoreRef} />
        {loading && !initialLoad && <SkeletonLoader count={2} />}
      </div>
    </div>
  );
});

PostList.displayName = 'PostList';

export default PostList; 