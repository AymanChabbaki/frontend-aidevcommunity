import React, { useEffect, useRef, useState } from 'react';
import { X, Image, Video, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { blogService, Post } from '@/services/blog.service';

interface Props {
  post?: Post | null;
  onClose: () => void;
  onSaved: (post: Post) => void;
}

export default function PostFormModal({ post, onClose, onSaved }: Props) {
  const [content, setContent] = useState(post?.content ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post?.imageUrl ?? null);
  const [videoPreview, setVideoPreview] = useState<string | null>(post?.videoUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
    setRemoveImage(false);
  }

  function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setVideoFile(f);
    setVideoPreview(URL.createObjectURL(f));
    setRemoveVideo(false);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (imageRef.current) imageRef.current.value = '';
  }

  function clearVideo() {
    setVideoFile(null);
    setVideoPreview(null);
    setRemoveVideo(true);
    if (videoRef.current) videoRef.current.value = '';
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { setError('Post content cannot be empty.'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('content', content.trim());
      if (imageFile) fd.append('image', imageFile);
      if (videoFile) fd.append('video', videoFile);
      if (removeImage) fd.append('removeImage', 'true');
      if (removeVideo) fd.append('removeVideo', 'true');

      const saved = post
        ? await blogService.updatePost(post.id, fd)
        : await blogService.createPost(fd);
      onSaved(saved);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg flex flex-col gap-4 p-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {post ? 'Edit Post' : 'Create Post'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="min-h-[120px] resize-none text-base"
          autoFocus
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden">
            <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-black/60 rounded-full text-white p-0.5 hover:bg-black/80"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Video preview */}
        {videoPreview && (
          <div className="relative rounded-xl overflow-hidden bg-black">
            <video src={videoPreview} controls className="w-full max-h-64" />
            <button
              type="button"
              onClick={clearVideo}
              className="absolute top-2 right-2 bg-black/60 rounded-full text-white p-0.5 hover:bg-black/80"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Media buttons + submit */}
        <div className="flex items-center gap-2 pt-1">
          <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
          <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={pickVideo} />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => imageRef.current?.click()}
            className="gap-1.5"
            disabled={!!videoFile || !!videoPreview}
          >
            <Image className="w-4 h-4" /> Photo
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => videoRef.current?.click()}
            className="gap-1.5"
            disabled={!!imageFile || !!imagePreview}
          >
            <Video className="w-4 h-4" /> Video
          </Button>

          <Button type="submit" className="ml-auto" disabled={loading || !content.trim()}>
            {loading ? 'Saving…' : post ? 'Save changes' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
