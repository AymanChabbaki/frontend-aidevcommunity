import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { podcastService, Podcast, PodcastSubject } from '@/services/podcast.service';
import { Podcast as PodcastIcon, Plus, Pencil, Trash2, Eye, Calendar, ExternalLink, ArrowLeft, Search, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';

const AdminManagePodcasts = () => {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [podcastToDelete, setPodcastToDelete] = useState<string | null>(null);
  const [podcastSubjects, setPodcastSubjects] = useState<PodcastSubject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);

  useEffect(() => {
    fetchPodcasts();
    fetchPodcastSubjects();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const data = await podcastService.getAllPodcasts();
      setPodcasts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch podcasts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPodcastSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const data = await podcastService.getAllPodcastSubjects();
      setPodcastSubjects(data || []);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch suggested topics', variant: 'destructive' });
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleApproveSubject = async (id: string) => {
    try {
      await podcastService.updatePodcastSubjectStatus(id, 'approved');
      toast({ title: 'Approved', description: 'Topic approved for voting' });
      fetchPodcastSubjects();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to approve topic', variant: 'destructive' });
    }
  };

  const handleRejectSubject = async (id: string) => {
    try {
      await podcastService.updatePodcastSubjectStatus(id, 'rejected');
      toast({ title: 'Rejected', description: 'Topic marked as rejected' });
      fetchPodcastSubjects();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to reject topic', variant: 'destructive' });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this suggested topic? This cannot be undone.')) return;
    try {
      await podcastService.deletePodcastSubject(id);
      toast({ title: 'Deleted', description: 'Topic deleted' });
      fetchPodcastSubjects();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.message || 'Failed to delete topic', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!podcastToDelete) return;

    try {
      await podcastService.deletePodcast(podcastToDelete);
      toast({
        title: 'Success',
        description: 'Podcast deleted successfully',
      });
      fetchPodcasts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete podcast',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setPodcastToDelete(null);
    }
  };

  const filteredPodcasts = podcasts.filter((podcast) =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Podcasts</h1>
              <p className="text-muted-foreground">Create and manage podcast episodes</p>
            </div>
            <Button onClick={() => navigate('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Podcast
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Podcasts</CardTitle>
              <PodcastIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{podcasts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {podcasts.filter((p) => p.status === 'published').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {podcasts.reduce((acc, p) => acc + p.views, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Podcast Topics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Suggested Podcast Topics</CardTitle>
            <CardDescription>Manage community-submitted ideas and votes</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectsLoading ? (
              <div className="text-center py-6">Loading...</div>
            ) : podcastSubjects.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No suggested topics</div>
            ) : (
              <div className="space-y-2">
                {podcastSubjects.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      {s.description && <div className="text-sm text-muted-foreground">{s.description}</div>}
                      <div className="text-xs text-muted-foreground mt-1">Votes: {s.votes} • Status: {s.status}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleApproveSubject(s.id)} disabled={s.status === 'approved'}>
                        <CheckCircle className="h-4 w-4 mr-2" />Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectSubject(s.id)} disabled={s.status === 'rejected'}>
                        <X className="h-4 w-4 mr-2" />Reject
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteSubject(s.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search podcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Podcasts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Podcasts</CardTitle>
            <CardDescription>
              {filteredPodcasts.length} {filteredPodcasts.length === 1 ? 'podcast' : 'podcasts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredPodcasts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No podcasts match your search' : 'No podcasts created yet'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thumbnail</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPodcasts.map((podcast) => (
                      <TableRow key={podcast.id}>
                        <TableCell>
                          <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                            {podcast.thumbnailUrl ? (
                              <img
                                src={podcast.thumbnailUrl}
                                alt={podcast.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <PodcastIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{podcast.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {podcast.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(podcast.publishedAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>{podcast.views}</TableCell>
                        <TableCell>
                          <Badge variant={podcast.status === 'published' ? 'default' : 'secondary'}>
                            {podcast.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {podcast.youtubeUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a href={podcast.youtubeUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/podcasts/edit/${podcast.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPodcastToDelete(podcast.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the podcast.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminManagePodcasts;
