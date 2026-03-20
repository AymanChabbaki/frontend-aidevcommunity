import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Moon, Calendar } from 'lucide-react';
import api from '@/lib/api';

interface Submission {
  id: string;
  name: string;
  interests: string;
  dream: string;
  imageUrl: string;
  compliment: string;
  createdAt: string;
}

const EidGallery = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/eid/submissions');
        setSubmissions(res.data.submissions || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load submissions';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.interests.toLowerCase().includes(search.toLowerCase()) ||
      s.dream.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-100">
          <Moon className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eid Celebration Gallery</h1>
          <p className="text-sm text-gray-500">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name, interests or dream..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16 text-red-500">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          {search ? 'No submissions match your search.' : 'No submissions yet.'}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s) => (
            <Card
              key={s.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-emerald-100 group"
              onClick={() => setSelected(s)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                <img
                  src={s.imageUrl}
                  alt={`AI portrait of ${s.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">
                  <span className="font-medium text-emerald-600">Interests:</span> {s.interests}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1">
                  <span className="font-medium text-teal-600">Dream:</span> {s.dream}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-emerald-700">
                <Moon className="w-5 h-5" />
                {selected.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Portrait */}
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                <img
                  src={selected.imageUrl}
                  alt={`AI portrait of ${selected.name}`}
                  className="w-full object-contain max-h-80"
                />
              </div>

              {/* Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Interests</p>
                  <p className="text-sm text-gray-800">{selected.interests}</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Dream</p>
                  <p className="text-sm text-gray-800">{selected.dream}</p>
                </div>
              </div>

              {/* Compliment */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Eid Greeting (Darija)</p>
                <p className="text-sm text-gray-800 leading-relaxed">{selected.compliment}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                  Eid Celebration 2026
                </Badge>
                <span>{formatDate(selected.createdAt)}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EidGallery;
