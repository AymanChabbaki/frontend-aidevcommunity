import React, { useState } from 'react';
import { Heart, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { blogService, Post } from '@/services/blog.service';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import CommentsSection from './CommentsSection';
import PostFormModal from './PostFormModal';

interface Props {
  post: Post;
  onDeleted: (id: string) => void;
  onUpdated: (post: Post) => void;
}

export default function PostCard({ post, onDeleted, onUpdated }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [toggling, setToggling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = user?.id === post.authorId;
  const canManage = isOwner || user?.role === 'ADMIN';

  async function handleLike() {
    if (!isAuthenticated || toggling) return;
    setToggling(true);
    // Optimistic
    setLiked((v) => !v);
    setLikeCount((c) => liked ? c - 1 : c + 1);
    try {
      const res = await blogService.toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount(res.count);
    } catch {
      // Revert
      setLiked((v) => !v);
      setLikeCount((c) => liked ? c + 1 : c - 1);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    await blogService.deletePost(post.id);
    onDeleted(post.id);
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.photoUrl || undefined} />
              <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-tight">
                {post.author.displayName}
              </p>
              <p className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                {post.updatedAt !== post.createdAt && ' · edited'}
              </p>
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={() => setEditing(true)}>
                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Image */}
        {post.imageUrl && !post.videoUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="w-full max-h-[480px] object-cover"
            loading="lazy"
          />
        )}

        {/* Video */}
        {post.videoUrl && (
          <video
            src={post.videoUrl}
            controls
            className="w-full max-h-[480px] bg-black"
            preload="metadata"
          />
        )}

        {/* Actions bar */}
        <div className="flex items-center gap-4 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              liked
                ? 'text-red-500'
                : 'text-slate-500 hover:text-red-400 disabled:opacity-50'
            }`}
          >
            <Heart
              className="w-4.5 h-4.5"
              fill={liked ? 'currentColor' : 'none'}
            />
            <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          </button>
        </div>

        {/* Comments */}
        <CommentsSection
          postId={post.id}
          commentCount={commentCount}
          onCountChange={setCommentCount}
        />
      </div>

      {/* Edit modal */}
      {editing && (
        <PostFormModal
          post={post}
          onClose={() => setEditing(false)}
          onSaved={(updated) => { onUpdated(updated); setEditing(false); }}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Delete post?</h3>
            <p className="text-sm text-slate-500 mt-1">This action cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
