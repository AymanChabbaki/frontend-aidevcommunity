import React, { useEffect, useState } from 'react';
import { Trash2, Send, MessageCircle, Heart, CornerDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { blogService, Comment } from '@/services/blog.service';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import UserProfileModal from './UserProfileModal';

interface Props {
  postId: string;
  commentCount: number;
  onCountChange: (n: number) => void;
}

// ─── Single comment row ──────────────────────────────────────────────────────
interface CommentRowProps {
  comment: Comment;
  isReply?: boolean;
  onDelete: (id: string) => void;
  onLikeToggle: (id: string) => void;
  onReplyClick?: (commentId: string, displayName: string) => void;
  onProfileClick: (userId: string) => void;
  currentUserId?: string;
  currentUserRole?: string;
  isAuthenticated: boolean;
}

function CommentRow({
  comment: c,
  isReply = false,
  onDelete,
  onLikeToggle,
  onReplyClick,
  onProfileClick,
  currentUserId,
  currentUserRole,
  isAuthenticated,
}: CommentRowProps) {
  return (
    <div className={`flex gap-2.5 ${isReply ? 'ml-9 mt-1.5' : ''}`}>
      <Avatar
        className="w-7 h-7 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
        onClick={() => onProfileClick(c.user.id)}
      >
        <AvatarImage src={c.user.photoUrl || undefined} />
        <AvatarFallback className="text-xs">{c.user.displayName[0]}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm">
          <div className="flex justify-between items-start gap-2">
            <span
              className="font-medium text-slate-800 dark:text-slate-200 cursor-pointer hover:underline"
              onClick={() => onProfileClick(c.user.id)}
            >
              {c.user.displayName}
            </span>
            <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
              {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
            </span>
          </div>
          {isReply && (
            <span className="text-xs text-indigo-400 flex items-center gap-0.5 mb-0.5">
              <CornerDownRight className="w-3 h-3" /> reply
            </span>
          )}
          <p className="mt-0.5 text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">{c.content}</p>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 px-1 mt-0.5">
          <button
            onClick={() => onLikeToggle(c.id)}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1 text-xs transition-colors ${
              c.likedByMe ? 'text-red-500 hover:text-red-400' : 'text-slate-400 hover:text-red-400'
            } disabled:opacity-40`}
          >
            <Heart className={`w-3.5 h-3.5 ${c.likedByMe ? 'fill-current' : ''}`} />
            {(c._count?.likes ?? 0) > 0 && <span>{c._count.likes}</span>}
          </button>

          {!isReply && onReplyClick && (
            <button
              onClick={() => onReplyClick(c.id, c.user.displayName)}
              disabled={!isAuthenticated}
              className="text-xs text-slate-400 hover:text-indigo-500 transition-colors disabled:opacity-40"
            >
              Reply
            </button>
          )}

          {(currentUserId === c.userId || currentUserRole === 'ADMIN') && (
            <button
              onClick={() => onDelete(c.id)}
              className="text-slate-300 hover:text-red-500 transition-colors ml-auto"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function CommentsSection({ postId, commentCount, onCountChange }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    blogService.getComments(postId).then((c) => {
      setComments(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [open, postId]);

  async function submit() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const comment = await blogService.addComment(postId, text.trim());
      setComments((prev) => [...prev, { ...comment, replies: [] }]);
      onCountChange(commentCount + 1);
      setText('');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReply() {
    if (!replyText.trim() || !replyingTo || replySubmitting) return;
    setReplySubmitting(true);
    try {
      const reply = await blogService.addComment(postId, replyText.trim(), replyingTo.id);
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyingTo.id
            ? { ...c, replies: [...(c.replies ?? []), reply], _count: { ...c._count, replies: (c._count?.replies ?? 0) + 1 } }
            : c
        )
      );
      onCountChange(commentCount + 1);
      setReplyText('');
      setReplyingTo(null);
    } finally {
      setReplySubmitting(false);
    }
  }

  async function remove(id: string) {
    await blogService.deleteComment(id);
    const isTop = comments.some((c) => c.id === id);
    const updated = isTop
      ? comments.filter((c) => c.id !== id)
      : comments.map((c) => ({ ...c, replies: (c.replies ?? []).filter((r) => r.id !== id) }));
    setComments(updated);
    const total = updated.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);
    onCountChange(total);
  }

  async function toggleLike(commentId: string) {
    if (!isAuthenticated) return;
    const flip = (c: Comment): Comment =>
      c.id !== commentId
        ? c
        : { ...c, likedByMe: !c.likedByMe, _count: { ...c._count, likes: (c._count?.likes ?? 0) + (c.likedByMe ? -1 : 1) } };

    setComments((prev) => prev.map((c) => ({ ...flip(c), replies: (c.replies ?? []).map(flip) })));
    try {
      await blogService.toggleCommentLike(commentId);
    } catch {
      setComments((prev) => prev.map((c) => ({ ...flip(c), replies: (c.replies ?? []).map(flip) })));
    }
  }

  return (
    <div className="border-t border-slate-100 dark:border-slate-800 mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-4 py-2 w-full text-left"
      >
        <MessageCircle className="w-4 h-4" />
        {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {loading && <p className="text-xs text-slate-400">Loading…</p>}

          {comments.map((c) => (
            <div key={c.id}>
              <CommentRow
                comment={c}
                onDelete={remove}
                onLikeToggle={toggleLike}
                onReplyClick={(id, name) => { setReplyingTo({ id, name }); setReplyText(''); }}
                onProfileClick={setProfileUserId}
                currentUserId={user?.id}
                currentUserRole={user?.role}
                isAuthenticated={isAuthenticated}
              />

              {(c.replies ?? []).map((r) => (
                <CommentRow
                  key={r.id}
                  comment={r}
                  isReply
                  onDelete={remove}
                  onLikeToggle={toggleLike}
                  onProfileClick={setProfileUserId}
                  currentUserId={user?.id}
                  currentUserRole={user?.role}
                  isAuthenticated={isAuthenticated}
                />
              ))}

              {replyingTo?.id === c.id && (
                <div className="ml-9 mt-1.5 flex gap-2 items-end">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarImage src={user?.photoUrl || undefined} />
                    <AvatarFallback className="text-xs">{user?.displayName?.[0] ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-indigo-500">Replying to {replyingTo.name}</p>
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${replyingTo.name}…`}
                      className="min-h-[50px] resize-none text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitReply();
                        if (e.key === 'Escape') setReplyingTo(null);
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" onClick={submitReply} disabled={replySubmitting || !replyText.trim()}>
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)} className="text-xs px-2">✕</Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAuthenticated ? (
            <div className="flex gap-2 items-end pt-1">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={user?.photoUrl || undefined} />
                <AvatarFallback className="text-xs">{user?.displayName?.[0] ?? 'U'}</AvatarFallback>
              </Avatar>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment…"
                className="min-h-[60px] resize-none text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(); }}
              />
              <Button size="sm" onClick={submit} disabled={submitting || !text.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Log in to comment.</p>
          )}
        </div>
      )}

      {profileUserId && (
        <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </div>
  );
}
