import React, { useEffect, useState } from 'react';
import { Trash2, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { blogService, Comment } from '@/services/blog.service';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  postId: string;
  commentCount: number;
  onCountChange: (n: number) => void;
}

export default function CommentsSection({ postId, commentCount, onCountChange }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      setComments((prev) => [...prev, comment]);
      onCountChange(commentCount + 1);
      setText('');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    await blogService.deleteComment(id);
    const updated = comments.filter((c) => c.id !== id);
    setComments(updated);
    onCountChange(updated.length);
  }

  return (
    <div className="border-t border-slate-100 dark:border-slate-800 mt-2">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-4 py-2 w-full text-left"
      >
        <MessageCircle className="w-4 h-4" />
        {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Comment list */}
          {loading && <p className="text-xs text-slate-400">Loading…</p>}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={c.user.photoUrl || undefined} />
                <AvatarFallback className="text-xs">{c.user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{c.user.displayName}</span>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.content}</p>
              </div>
              {(user?.id === c.userId || user?.role === 'ADMIN') && (
                <button
                  onClick={() => remove(c.id)}
                  className="text-slate-300 hover:text-red-500 mt-1"
                  title="Delete comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Input */}
          {isAuthenticated ? (
            <div className="flex gap-2 items-end">
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage src={user?.photoUrl || undefined} />
                <AvatarFallback className="text-xs">{user?.displayName?.[0] ?? 'U'}</AvatarFallback>
              </Avatar>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment…"
                className="min-h-[60px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit();
                }}
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
    </div>
  );
}
