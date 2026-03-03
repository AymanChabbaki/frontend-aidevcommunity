import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PenSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { blogService, Post } from '@/services/blog.service';
import PostCard from '@/components/PostCard';
import PostFormModal from '@/components/PostFormModal';
import { useAuth } from '@/context/AuthContext';

const LIMIT = 10;

export default function Blog() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [creating, setCreating] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(async (pageNum: number, replace = false) => {
    setLoading(true);
    try {
      const res = await blogService.getPosts(pageNum, LIMIT);
      setPosts((prev) => replace ? res.data : [...prev, ...res.data]);
      setTotal(res.total);
      setHasMore(pageNum * LIMIT < res.total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(1, true); }, [fetchPosts]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchPosts(next);
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, page, fetchPosts]);

  function onPostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
    setTotal((t) => t + 1);
    setCreating(false);
  }

  function onPostUpdated(updated: Post) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function onPostDeleted(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setTotal((t) => t - 1);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        {/* Page header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Community Blog</h1>
          <span className="text-sm text-slate-400">{total} posts</span>
        </div>

        {/* Create post prompt */}
        {isAuthenticated && (
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setCreating(true)}
          >
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.photoUrl || undefined} />
              <AvatarFallback>{user?.displayName?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-full px-4 py-2 select-none">
              What's on your mind, {user?.displayName?.split(' ')[0]}?
            </span>
            <Button size="sm" variant="ghost" className="gap-1.5 text-slate-500">
              <PenSquare className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Posts feed */}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={onPostDeleted}
            onUpdated={onPostUpdated}
          />
        ))}

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {/* End of feed */}
        {!loading && !hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-slate-400 py-4">You've reached the end </p>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-base">No posts yet. Be the first to share something!</p>
            {isAuthenticated && (
              <Button className="mt-4" onClick={() => setCreating(true)}>
                <PenSquare className="w-4 h-4 mr-2" /> Create Post
              </Button>
            )}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-4" />
      </div>

      {/* Create modal */}
      {creating && (
        <PostFormModal
          onClose={() => setCreating(false)}
          onSaved={onPostCreated}
        />
      )}
    </div>
  );
}
