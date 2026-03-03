import React, { useEffect, useState } from 'react';
import { X, Github, Linkedin, Twitter, MapPin, BookOpen, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface PublicUser {
  id: string;
  displayName: string;
  role: string;
  staffRole?: string | null;
  photoUrl?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  github?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  publicProfile: boolean;
  studyLevel?: string | null;
  studyProgram?: string | null;
  createdAt: string;
}

interface Props {
  userId: string;
  onClose: () => void;
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  STAFF: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  USER:  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function UserProfileModal({ userId, onClose }: Props) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/users/${userId}`)
      .then((res) => setUser(res.data.data))
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [userId]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const skills = Array.isArray(user?.skills) ? user!.skills : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header band */}
        <div className="h-20 bg-gradient-to-br from-indigo-500 to-purple-600" />

        <div className="px-5 pb-5">
          {/* Avatar overlapping band */}
          <div className="-mt-10 mb-3 flex items-end justify-between">
            <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-slate-900 shadow-lg">
              <AvatarImage src={user?.photoUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user?.displayName?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          )}

          {error && <p className="text-sm text-red-500 py-4">{error}</p>}

          {user && !loading && (
            <div className="space-y-3">
              {/* Name + role */}
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {user.displayName}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLOR[user.role] ?? ROLE_COLOR.USER}`}>
                    {user.role}
                  </span>
                  {user.staffRole && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">{user.staffRole}</span>
                  )}
                  {user.studyLevel && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <BookOpen className="w-3 h-3" />
                      {user.studyLevel.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}

              {/* Social links */}
              {(user.github || user.linkedin || user.twitter) && (
                <div className="flex gap-2 pt-1">
                  {user.github && (
                    <a href={`https://github.com/${user.github}`} target="_blank" rel="noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {user.twitter && (
                    <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noreferrer"
                      className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}

              {/* Joined */}
              <p className="text-xs text-slate-400 pt-1">
                Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
