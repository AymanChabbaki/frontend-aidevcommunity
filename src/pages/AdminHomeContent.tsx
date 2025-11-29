import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { useToast } from '../hooks/use-toast';
import { homeContentService, HomeContent } from '../services/home-content.service';
import { eventService, Event } from '../services/event.service';
import { Loader2, Save, RotateCw, Home, BarChart3 } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function AdminHomeContent() {
  const [content, setContent] = useState<Partial<HomeContent>>({
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: 'Get Started',
    heroCtaLink: '/events',
    featuredEventIds: [],
    showPastEvents: true,
    statsEnabled: true,
    totalEvents: 0,
    totalMembers: 0,
    activeProjects: 0
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contentData, eventsData] = await Promise.all([
        homeContentService.getHomeContent(),
        eventService.getAllEvents()
      ]);
      setContent(contentData);
      setEvents(Array.isArray(eventsData) ? eventsData : eventsData?.data || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load home content'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setInitializing(true);
      const result = await homeContentService.initializeHomeContent();
      setContent(result.content);
      toast({
        title: 'Success',
        description: 'Home content initialized with default values'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to initialize home content'
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await homeContentService.updateHomeContent(content);
      setContent(updated);
      toast({
        title: 'Success',
        description: 'Home content updated successfully'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update home content'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeaturedEvent = (eventId: string) => {
    const currentIds = content.featuredEventIds || [];
    const isSelected = currentIds.includes(eventId);
    
    if (isSelected) {
      setContent({
        ...content,
        featuredEventIds: currentIds.filter(id => id !== eventId)
      });
    } else {
      if (currentIds.length >= 3) {
        toast({
          variant: 'destructive',
          title: 'Limit Reached',
          description: 'You can only feature up to 3 events'
        });
        return;
      }
      setContent({
        ...content,
        featuredEventIds: [...currentIds, eventId]
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8" />
            Home Page Content
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage the hero section, featured events, and statistics on the home page
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleInitialize}
            disabled={initializing}
          >
            {initializing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <RotateCw className="h-4 w-4 mr-2" />
                Initialize
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>
              Main headline and call-to-action on the home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input
                id="heroTitle"
                value={content.heroTitle}
                onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                placeholder="Welcome to AI Dev Community"
              />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Textarea
                id="heroSubtitle"
                value={content.heroSubtitle}
                onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                placeholder="Join us in exploring the future of artificial intelligence..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heroCtaText">Button Text</Label>
                <Input
                  id="heroCtaText"
                  value={content.heroCtaText}
                  onChange={(e) => setContent({ ...content, heroCtaText: e.target.value })}
                  placeholder="Get Started"
                />
              </div>
              <div>
                <Label htmlFor="heroCtaLink">Button Link</Label>
                <Input
                  id="heroCtaLink"
                  value={content.heroCtaLink}
                  onChange={(e) => setContent({ ...content, heroCtaLink: e.target.value })}
                  placeholder="/events"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Events */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Events</CardTitle>
            <CardDescription>
              Select up to 3 events to feature in the hero image grid (select upcoming events)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events
                .filter(event => new Date(event.startAt) > new Date())
                .map((event) => {
                  const isSelected = (content.featuredEventIds || []).includes(event.id);
                  return (
                    <div
                      key={event.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleFeaturedEvent(event.id)}
                    >
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-32 object-cover rounded-md mb-3"
                        />
                      )}
                      <h4 className="font-semibold mb-1 line-clamp-1">{event.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant={event.status === 'UPCOMING' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                        {isSelected && (
                          <Badge variant="outline" className="bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            {events.filter(e => new Date(e.startAt) > new Date()).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No upcoming events available. Create events first to feature them.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>
              Control what sections are shown on the home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showPastEvents">Show Past Events Gallery</Label>
                <p className="text-sm text-muted-foreground">
                  Display a section with past events on the home page
                </p>
              </div>
              <Switch
                id="showPastEvents"
                checked={content.showPastEvents}
                onCheckedChange={(checked) =>
                  setContent({ ...content, showPastEvents: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="statsEnabled">Show Statistics</Label>
                <p className="text-sm text-muted-foreground">
                  Display community statistics (events, members, projects)
                </p>
              </div>
              <Switch
                id="statsEnabled"
                checked={content.statsEnabled}
                onCheckedChange={(checked) =>
                  setContent({ ...content, statsEnabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Community Statistics
            </CardTitle>
            <CardDescription>
              Update the statistics displayed on the home page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="totalEvents">Total Events</Label>
                <Input
                  id="totalEvents"
                  type="number"
                  value={content.totalEvents}
                  onChange={(e) =>
                    setContent({ ...content, totalEvents: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="totalMembers">Total Members</Label>
                <Input
                  id="totalMembers"
                  type="number"
                  value={content.totalMembers}
                  onChange={(e) =>
                    setContent({ ...content, totalMembers: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="activeProjects">Active Projects</Label>
                <Input
                  id="activeProjects"
                  type="number"
                  value={content.activeProjects}
                  onChange={(e) =>
                    setContent({ ...content, activeProjects: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
