import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { podcastService } from '@/services/podcast.service';
import { ArrowLeft, Image as ImageIcon, Upload, Youtube, MessageSquare, Calendar, Loader2 } from 'lucide-react';

const AdminCreatePodcast = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    duration: '',
    publishedAt: new Date().toISOString().slice(0, 16),
    discordLink: '',
    status: 'published',
  });

  useEffect(() => {
    if (isEdit) {
      fetchPodcast();
    }
  }, [id]);

  const fetchPodcast = async () => {
    try {
      const podcast = await podcastService.getPodcastById(id!);
      setFormData({
        title: podcast.title,
        description: podcast.description,
        youtubeUrl: podcast.youtubeUrl || '',
        thumbnailUrl: podcast.thumbnailUrl || '',
        duration: podcast.duration?.toString() || '',
        publishedAt: new Date(podcast.publishedAt).toISOString().slice(0, 16),
        discordLink: podcast.discordLink || '',
        status: podcast.status,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch podcast',
        variant: 'destructive',
      });
      navigate('/admin/podcasts');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const response = await podcastService.uploadPodcastImage(file);
      if (response.success) {
        setFormData({ ...formData, thumbnailUrl: response.data.imageUrl });
        toast({
          title: 'Success',
          description: 'Thumbnail uploaded successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const extractYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    return videoId;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return null;
  };

  const handleYouTubeUrlChange = (url: string) => {
    setFormData({ ...formData, youtubeUrl: url });
    
    // Auto-fill thumbnail if not already set
    if (!formData.thumbnailUrl) {
      const thumbnail = getYouTubeThumbnail(url);
      if (thumbnail) {
        setFormData({ ...formData, youtubeUrl: url, thumbnailUrl: thumbnail });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Description is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.thumbnailUrl) {
      toast({
        title: 'Validation Error',
        description: 'Thumbnail is required. Please upload an image or provide a YouTube URL',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const podcastData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        publishedAt: new Date(formData.publishedAt).toISOString(),
      };

      if (isEdit) {
        await podcastService.updatePodcast(id!, podcastData);
        toast({
          title: 'Success',
          description: 'Podcast updated successfully',
        });
      } else {
        await podcastService.createPodcast(podcastData);
        toast({
          title: 'Success',
          description: 'Podcast created successfully',
        });
      }

      navigate('/admin/podcasts');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} podcast`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/podcasts')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Podcasts
          </Button>

          <h1 className="text-4xl font-bold mb-2">
            {isEdit ? 'Edit Podcast' : 'Create New Podcast'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update podcast information' : 'Add a new podcast episode'}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-3xl">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Podcast Information</CardTitle>
                <CardDescription>
                  Fill in the details for the podcast episode
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., AI in Healthcare: Future Perspectives"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this podcast episode is about..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                {/* YouTube URL */}
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl">YouTube URL</Label>
                  <div className="flex gap-2">
                    <Youtube className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      id="youtubeUrl"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.youtubeUrl}
                      onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add the full YouTube URL. Thumbnail will be auto-filled if not manually uploaded.
                  </p>
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <Label>Thumbnail Image *</Label>
                  <div className="flex items-start gap-4">
                    {formData.thumbnailUrl ? (
                      <div className="relative w-48 h-32 rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={formData.thumbnailUrl}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="w-48 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="mb-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a custom thumbnail (max 5MB) or use YouTube auto-generated thumbnail
                      </p>
                      {uploadingImage && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading to Cloudinary...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (in seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g., 3600 for 1 hour"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Enter duration in seconds (e.g., 3600 = 1 hour)
                  </p>
                </div>

                {/* Discord Link */}
                <div className="space-y-2">
                  <Label htmlFor="discordLink">Discord Discussion Link</Label>
                  <div className="flex gap-2">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      id="discordLink"
                      placeholder="https://discord.gg/..."
                      value={formData.discordLink}
                      onChange={(e) => setFormData({ ...formData, discordLink: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Link to Discord channel where users can discuss this episode
                  </p>
                </div>

                {/* Published Date */}
                <div className="space-y-2">
                  <Label htmlFor="publishedAt">Published Date & Time</Label>
                  <div className="flex gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <Button type="submit" disabled={loading || uploadingImage} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEdit ? 'Update Podcast' : 'Create Podcast'}</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/podcasts')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreatePodcast;
