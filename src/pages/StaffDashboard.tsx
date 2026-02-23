import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  QrCode, 
  FileText, 
  Users,
  Home,
  LogOut,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart3,
  User,
  TrendingUp,
  Activity,
  CheckCircle,
  Send,
  Trophy,
  Globe,
  Podcast
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { eventService } from '@/services/event.service';
import { pollService } from '@/services/poll.service';
import { formService } from '@/services/form.service';
import { collaborationService } from '@/services/collaboration.service';
import { toast } from 'sonner';
import OrganizerEvents from './OrganizerEvents';
import AdminManagePolls from './AdminManagePolls';
import AdminManageForms from './AdminManageForms';
import AdminManageQuizzes from './AdminManageQuizzes';
import AdminManagePodcasts from './AdminManagePodcasts';
import AdminCreatePodcast from './AdminCreatePodcast';
import QRScanner from './QRScanner';
import StaffProfile from './StaffProfile';
import StaffApproveRegistrations from './StaffApproveRegistrations';
import StaffCollaborations from './StaffCollaborations';
import SendMessage from './SendMessage';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    myEvents: 0,
    totalAttendees: 0,
    organizingCount: 0,
    collaboratingCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{
    eventGrowth: Array<{ month: string; events: number }>;
    eventStatus: Array<{ status: string; count: number }>;
    pollActivity: Array<{ month: string; polls: number; votes: number }>;
    formSubmissions: Array<{ month: string; submissions: number }>;
  }>({
    eventGrowth: [],
    eventStatus: [],
    pollActivity: [],
    formSubmissions: []
  });
  const [createEventDialog, setCreateEventDialog] = useState(false);
  const [createPollDialog, setCreatePollDialog] = useState(false);
  const [createFormDialog, setCreateFormDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    locationType: 'PHYSICAL',
    locationText: '',
    startAt: '',
    endAt: '',
    capacity: '',
    category: '',
    imageUrl: '',
    speaker: '',
    tags: '',
    requiresApproval: false,
    eligibleLevels: [] as string[],
    eligiblePrograms: [] as string[]
  });

  // Poll Form State
  const [pollFormData, setPollFormData] = useState({
    question: '',
    visibility: 'PUBLIC',
    startAt: '',
    endAt: ''
  });
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Form Builder State
  interface FormField {
    id: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
  }
  const [formBuilderData, setFormBuilderData] = useState({
    title: '',
    description: ''
  });
  const [formFields, setFormFields] = useState<FormField[]>([
    { id: 'field1', type: 'text', label: '', required: false, placeholder: '' }
  ]);
  const [editingOptions, setEditingOptions] = useState<{[key: string]: string}>({});

  const menuItems = [
    {
      title: 'Back to Website',
      icon: Globe,
      path: '/',
    },
    {
      title: 'Dashboard',
      icon: Home,
      path: '/staff/dashboard',
    },
    {
      title: 'Events',
      icon: Calendar,
      path: '/staff/events',
    },
    {
      title: 'QR Scanner',
      icon: QrCode,
      path: '/staff/qr-scanner',
    },
    {
      title: 'Polls',
      icon: BarChart3,
      path: '/staff/polls',
    },
    {
      title: 'Forms',
      icon: FileText,
      path: '/staff/forms',
    },
    {
      title: 'Quizzes',
      icon: Trophy,
      path: '/staff/manage-quizzes',
    },
    {
      title: 'Podcasts',
      icon: Podcast,
      path: '/staff/podcasts',
    },
    {
      title: 'Approve Registrations',
      icon: CheckCircle,
      path: '/staff/approve-registrations',
    },
    {
      title: 'Collaborations',
      icon: Users,
      path: '/staff/collaborations',
    },
    {
      title: 'Send Messages',
      icon: Send,
      path: '/staff/send-message',
    },
    {
      title: 'Profile',
      icon: User,
      path: '/staff/profile',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch all data
        const [eventsResponse, pollsResponse, formsResponse, collaborationsResponse] = await Promise.all([
          eventService.getAllEvents(),
          pollService.getAllPolls(),
          formService.getAllForms(),
          collaborationService.getMyCollaborations()
        ]);
        
        const allEventsData = eventsResponse.data || [];
        const allPollsData = pollsResponse.data || [];
        const allForms = formsResponse.data || [];
        const collaborations = collaborationsResponse.data?.data || [];
        
        // Check and update event status based on dates
        const now = new Date();
        const allEvents = allEventsData.map((event: any) => {
          // Don't change CANCELLED status
          if (event.status === 'CANCELLED') {
            return event;
          }
          
          const startDate = new Date(event.startAt);
          const endDate = new Date(event.endAt);
          
          let newStatus = event.status;
          if (now < startDate) {
            newStatus = 'UPCOMING';
          } else if (now >= startDate && now < endDate) {
            newStatus = 'ONGOING';
          } else if (now >= endDate) {
            newStatus = 'COMPLETED';
          }
          
          return { ...event, status: newStatus };
        });
        
        // Check if polls have expired and update status
        const allPolls = allPollsData.map((poll: any) => {
          const endDate = new Date(poll.endAt);
          // If current date is past end date and status is still ACTIVE, mark as CLOSED
          if (endDate < now && poll.status === 'ACTIVE') {
            return { ...poll, status: 'CLOSED' };
          }
          return poll;
        });
        
        // Filter events created by this staff member
        const myEvents = allEvents.filter((event: any) => event.organizerId === user?.id);
        const totalAttendees = myEvents.reduce((sum: number, event: any) => 
          sum + (event._count?.registrations || 0), 0
        );
        
        // Count organizing and collaborating events
        const organizingCount = myEvents.length;
        const collaboratingCount = collaborations.filter((collab: any) => collab.status === 'ACCEPTED').length;

        // Calculate chart data for last 6 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Event growth data
        const eventGrowthData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const eventsInMonth = myEvents.filter((event: any) => {
            const createdAt = new Date(event.createdAt);
            return createdAt >= monthDate && createdAt <= monthEnd;
          }).length;
          eventGrowthData.push({
            month: monthNames[monthDate.getMonth()],
            events: eventsInMonth
          });
        }

        // Event status distribution
        const eventStatusData = [
          { status: 'Upcoming', count: myEvents.filter((e: any) => e.status === 'UPCOMING').length },
          { status: 'Ongoing', count: myEvents.filter((e: any) => e.status === 'ONGOING').length },
          { status: 'Completed', count: myEvents.filter((e: any) => e.status === 'COMPLETED').length },
          { status: 'Cancelled', count: myEvents.filter((e: any) => e.status === 'CANCELLED').length }
        ];

        // Poll activity data (polls created by staff)
        const myPolls = allPolls.filter((poll: any) => poll.creatorId === user?.id);
        const pollActivityData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const pollsInMonth = myPolls.filter((poll: any) => {
            const createdAt = new Date(poll.createdAt);
            return createdAt >= monthDate && createdAt <= monthEnd;
          }).length;
          const votesInMonth = myPolls.reduce((sum: number, poll: any) => {
            const createdAt = new Date(poll.createdAt);
            if (createdAt >= monthDate && createdAt <= monthEnd) {
              return sum + (poll._count?.votes || 0);
            }
            return sum;
          }, 0);
          pollActivityData.push({
            month: monthNames[monthDate.getMonth()],
            polls: pollsInMonth,
            votes: votesInMonth
          });
        }

        // Form submissions data (forms created by staff)
        const myForms = allForms.filter((form: any) => form.createdById === user?.id);
        const formSubmissionsData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const submissionsInMonth = myForms.reduce((sum: number, form: any) => {
            return sum + (form._count?.responses || 0);
          }, 0);
          formSubmissionsData.push({
            month: monthNames[monthDate.getMonth()],
            submissions: submissionsInMonth
          });
        }

        // Update chart data
        setChartData({
          eventGrowth: eventGrowthData,
          eventStatus: eventStatusData,
          pollActivity: pollActivityData,
          formSubmissions: formSubmissionsData
        });

        setStats({
          myEvents: myEvents.length,
          totalAttendees,
          organizingCount,
          collaboratingCount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({ myEvents: 0, totalAttendees: 0, organizingCount: 0, collaboratingCount: 0 });
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname === '/staff/dashboard') {
      fetchStats();
    }
  }, [location.pathname, user?.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const response = await eventService.uploadEventImage(file);
      if (response.success) {
        setEventFormData({ ...eventFormData, imageUrl: response.data.imageUrl });
        toast.success('Image uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const staffCards = [
    {
      title: 'Manage Events',
      description: 'Create and organize community events',
      icon: Calendar,
      link: '/staff/events',
      color: 'text-green-500'
    },
    {
      title: 'QR Scanner',
      description: 'Check-in attendees at events',
      icon: QrCode,
      link: '/staff/qr-scanner',
      color: 'text-blue-500'
    },
    {
      title: 'Manage Polls',
      description: 'Create and manage polls',
      icon: BarChart3,
      link: '/staff/polls',
      color: 'text-purple-500'
    },
    {
      title: 'Manage Forms',
      description: 'Create and manage forms',
      icon: FileText,
      link: '/staff/forms',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <aside
        className={cn(
          'hidden lg:flex bg-gray-900 text-white transition-all duration-300 flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="logo" 
                className="h-8 w-8 rounded" 
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2314b8a6" width="100" height="100"/><text x="50" y="50" font-size="60" text-anchor="middle" dy=".3em" fill="white">AI</text></svg>';
                }}
              />
              <span className="font-semibold">Staff Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-white hover:bg-gray-800"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            {user?.photoUrl ? (
              <img 
                src={user.photoUrl.startsWith('http') ? user.photoUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.photoUrl}`}
                alt={user.displayName}
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={cn(
              "h-10 w-10 rounded-full bg-primary flex items-center justify-center font-semibold",
              user?.photoUrl && "hidden"
            )}>
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              'w-full text-gray-300 hover:bg-gray-800 hover:text-white justify-start',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="logo" 
            className="h-8 w-8 rounded" 
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2314b8a6" width="100" height="100"/><text x="50" y="50" font-size="60" text-anchor="middle" dy=".3em" fill="white">AI</text></svg>';
            }}
          />
          <span className="font-semibold">Staff Panel</span>
        </div>
        <Link to="/staff/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {user?.photoUrl ? (
            <img 
              src={user.photoUrl.startsWith('http') ? user.photoUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${user.photoUrl}`}
              alt={user.displayName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-primary"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-semibold ring-2 ring-primary">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="p-4 lg:p-8">
          <Routes>
            <Route path="/dashboard" element={
              <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.displayName}!
                </h1>
                <p className="text-muted-foreground">
                  Staff Dashboard - Organize and manage events
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Organizing</CardTitle>
                    <Calendar className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.organizingCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Events I'm organizing</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Collaborating</CardTitle>
                    <Users className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.collaboratingCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Events I'm collaborating on</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.totalAttendees}
                    </div>
                    <p className="text-xs text-muted-foreground">Across all my events</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quick Scan</CardTitle>
                    <QrCode className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <Link to="/organizer/qr-scanner">
                      <Button className="w-full mt-2">Open Scanner</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Create Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCreateEventDialog(true)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Create Event</CardTitle>
                      <Calendar className="h-8 w-8 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Event
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCreatePollDialog(true)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Create Poll</CardTitle>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Poll
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCreateFormDialog(true)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Create Form</CardTitle>
                      <FileText className="h-8 w-8 text-indigo-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Form
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Charts */}
              <div className="mb-6 space-y-6">
                {/* Event Growth Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>My Event Growth</CardTitle>
                        <CardDescription>Events created over the last 6 months</CardDescription>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.eventGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="events" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Event Status and Poll Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Status Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>My Event Status</CardTitle>
                      <CardDescription>Events by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.eventStatus}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Poll Activity Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Poll Activity</CardTitle>
                      <CardDescription>Polls and votes over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData.pollActivity}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="polls" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
                          <Area type="monotone" dataKey="votes" stackId="1" stroke="#ec4899" fill="#ec4899" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Form Submissions Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Form Submissions</CardTitle>
                        <CardDescription>Form responses over the last 6 months</CardDescription>
                      </div>
                      <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.formSubmissions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="submissions" stroke="#f59e0b" fill="#f59e0b" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {staffCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link key={card.title} to={card.link}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Icon className={`h-8 w-8 ${card.color}`} />
                          </div>
                          <CardTitle className="mt-4">{card.title}</CardTitle>
                          <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            Open
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </>
            } />
            <Route path="/events" element={<OrganizerEvents onCreateEvent={() => setCreateEventDialog(true)} />} />
            <Route path="/polls" element={<AdminManagePolls onCreatePoll={() => setCreatePollDialog(true)} />} />
            <Route path="/forms" element={<AdminManageForms onCreateForm={() => setCreateFormDialog(true)} />} />
            <Route path="/manage-quizzes" element={<AdminManageQuizzes />} />
            <Route path="/podcasts" element={<AdminManagePodcasts />} />
            <Route path="/podcasts/create" element={<AdminCreatePodcast />} />
            <Route path="/podcasts/edit/:id" element={<AdminCreatePodcast />} />
            <Route path="/qr-scanner" element={<QRScanner />} />
            <Route path="/approve-registrations" element={<StaffApproveRegistrations />} />
            <Route path="/collaborations" element={<StaffCollaborations />} />
            <Route path="/send-message" element={<SendMessage />} />
            <Route path="/profile" element={<StaffProfile />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-10">
        <div className="flex">
          {/* Scrollable menu items */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center py-2 px-2 min-w-max">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[70px]',
                      active
                        ? 'text-primary'
                        : 'text-gray-400'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs whitespace-nowrap">{item.title.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Fixed logout button */}
          <div className="border-l border-gray-800 flex items-center">
            <button
              onClick={logout}
              className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-gray-400 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Create Event Dialog */}
      <Dialog open={createEventDialog} onOpenChange={setCreateEventDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Fill in the details to create a new event</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                rows={4}
                placeholder="Describe your event"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locationType">Location Type *</Label>
                <Select
                  value={eventFormData.locationType}
                  onValueChange={(value) => setEventFormData({ ...eventFormData, locationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHYSICAL">Physical</SelectItem>
                    <SelectItem value="VIRTUAL">Virtual</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationText">Location Details *</Label>
                <Input
                  id="locationText"
                  value={eventFormData.locationText}
                  onChange={(e) => setEventFormData({ ...eventFormData, locationText: e.target.value })}
                  placeholder="Room A, Zoom link, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startAt">Start Date & Time *</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={eventFormData.startAt}
                  onChange={(e) => setEventFormData({ ...eventFormData, startAt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endAt">End Date & Time *</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={eventFormData.endAt}
                  onChange={(e) => setEventFormData({ ...eventFormData, endAt: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={eventFormData.capacity}
                  onChange={(e) => setEventFormData({ ...eventFormData, capacity: e.target.value })}
                  placeholder="Maximum attendees"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={eventFormData.category}
                  onValueChange={(value) => setEventFormData({ ...eventFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker/Organizer</Label>
                <Input
                  id="speaker"
                  value={eventFormData.speaker}
                  onChange={(e) => setEventFormData({ ...eventFormData, speaker: e.target.value })}
                  placeholder="Speaker name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={eventFormData.tags}
                  onChange={(e) => setEventFormData({ ...eventFormData, tags: e.target.value })}
                  placeholder="AI, Workshop, Beginner"
                />
              </div>
            </div>

            {/* Event Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="eventImage">Event Image</Label>
              <Input
                id="eventImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              {eventFormData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={eventFormData.imageUrl}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {uploadingImage ? 'Uploading image...' : 'Upload an event image (Max 5MB)'}
              </p>
            </div>

            {/* Eligibility & Approval Section */}
            <div className="border rounded-lg p-4 space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Eligibility & Approval</h3>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requiresApproval"
                  checked={eventFormData.requiresApproval}
                  onCheckedChange={(checked) => setEventFormData({ 
                    ...eventFormData, 
                    requiresApproval: checked as boolean,
                    eligibleLevels: checked ? eventFormData.eligibleLevels : [],
                    eligiblePrograms: checked ? eventFormData.eligiblePrograms : []
                  })}
                />
                <Label htmlFor="requiresApproval" className="cursor-pointer">
                  Require approval for registrations
                </Label>
              </div>

              {eventFormData.requiresApproval && (
                <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    Select which study levels and programs are eligible to register for this event.
                  </p>

                  {/* Eligible Study Levels */}
                  <div className="space-y-2">
                    <Label>Eligible Study Levels</Label>
                    <div className="flex flex-wrap gap-2">
                      {['BACHELOR', 'MASTER', 'DOCTORATE'].map((level) => (
                        <Badge
                          key={level}
                          variant={eventFormData.eligibleLevels.includes(level) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newLevels = eventFormData.eligibleLevels.includes(level)
                              ? eventFormData.eligibleLevels.filter((l: string) => l !== level)
                              : [...eventFormData.eligibleLevels, level];
                            setEventFormData({ ...eventFormData, eligibleLevels: newLevels });
                          }}
                        >
                          {level === 'BACHELOR' ? 'Bachelor' : level === 'MASTER' ? 'Master' : 'Doctorate'}
                          {eventFormData.eligibleLevels.includes(level) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Eligible Study Programs */}
                  <div className="space-y-2">
                    <Label>Eligible Study Programs</Label>
                    <div className="flex flex-wrap gap-2">
                      {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'M1', 'M2', 'Y1', 'Y2', 'Y3', 'Y4'].map((program) => (
                        <Badge
                          key={program}
                          variant={eventFormData.eligiblePrograms.includes(program) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const newPrograms = eventFormData.eligiblePrograms.includes(program)
                              ? eventFormData.eligiblePrograms.filter((p: string) => p !== program)
                              : [...eventFormData.eligiblePrograms, program];
                            setEventFormData({ ...eventFormData, eligiblePrograms: newPrograms });
                          }}
                        >
                          {program}
                          {eventFormData.eligiblePrograms.includes(program) && (
                            <X className="ml-1 h-3 w-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {eventFormData.eligibleLevels.length === 0 && eventFormData.eligiblePrograms.length === 0 && (
                    <p className="text-sm text-amber-600">
                      ⚠️ No eligibility criteria selected. All users will be eligible.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateEventDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!eventFormData.title || !eventFormData.description || !eventFormData.startAt || 
                  !eventFormData.endAt || !eventFormData.locationText || !eventFormData.capacity || !eventFormData.category) {
                toast.error('Please fill in all required fields');
                return;
              }

              try {
                setSubmitting(true);
                
                await eventService.createEvent({
                  title: eventFormData.title,
                  description: eventFormData.description,
                  locationType: eventFormData.locationType,
                  locationText: eventFormData.locationText,
                  startAt: new Date(eventFormData.startAt).toISOString(),
                  endAt: new Date(eventFormData.endAt).toISOString(),
                  capacity: parseInt(eventFormData.capacity),
                  category: eventFormData.category,
                  imageUrl: eventFormData.imageUrl || undefined,
                  speaker: eventFormData.speaker || undefined,
                  tags: eventFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
                  requiresApproval: eventFormData.requiresApproval,
                  eligibleLevels: eventFormData.requiresApproval ? eventFormData.eligibleLevels : undefined,
                  eligiblePrograms: eventFormData.requiresApproval ? eventFormData.eligiblePrograms : undefined
                });
                toast.success('Event created successfully');
                setCreateEventDialog(false);
                setEventFormData({
                  title: '',
                  description: '',
                  locationType: 'PHYSICAL',
                  locationText: '',
                  startAt: '',
                  endAt: '',
                  capacity: '',
                  category: '',
                  imageUrl: '',
                  speaker: '',
                  tags: '',
                  requiresApproval: false,
                  eligibleLevels: [],
                  eligiblePrograms: []
                });
                // Refresh events if on events page
                if (location.pathname === '/staff/events') {
                  window.location.reload();
                }
              } catch (error: any) {
                toast.error(error.response?.data?.error || 'Failed to create event');
              } finally {
                setSubmitting(false);
              }
            }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Poll Dialog */}
      <Dialog open={createPollDialog} onOpenChange={setCreatePollDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Poll</DialogTitle>
            <DialogDescription>Create a new poll for community engagement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poll-question">Question *</Label>
              <Input
                id="poll-question"
                value={pollFormData.question}
                onChange={(e) => setPollFormData({ ...pollFormData, question: e.target.value })}
                placeholder="Enter your poll question"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poll-visibility">Visibility</Label>
              <Select
                value={pollFormData.visibility}
                onValueChange={(value) => setPollFormData({ ...pollFormData, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poll-start">Start Date & Time</Label>
                <Input
                  id="poll-start"
                  type="datetime-local"
                  value={pollFormData.startAt}
                  onChange={(e) => setPollFormData({ ...pollFormData, startAt: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poll-end">End Date & Time</Label>
                <Input
                  id="poll-end"
                  type="datetime-local"
                  value={pollFormData.endAt}
                  onChange={(e) => setPollFormData({ ...pollFormData, endAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options (minimum 2)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setPollOptions(pollOptions.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePollDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!pollFormData.question) {
                toast.error('Please enter a poll question');
                return;
              }

              const nonEmptyOptions = pollOptions.filter(opt => opt.trim() !== '');
              if (nonEmptyOptions.length < 2) {
                toast.error('Please provide at least 2 options');
                return;
              }

              try {
                setSubmitting(true);
                await pollService.createPoll({
                  question: pollFormData.question,
                  options: nonEmptyOptions.map((text, index) => ({ id: index + 1, text })),
                  visibility: pollFormData.visibility,
                  startAt: pollFormData.startAt ? new Date(pollFormData.startAt).toISOString() : undefined,
                  endAt: pollFormData.endAt ? new Date(pollFormData.endAt).toISOString() : undefined,
                });
                toast.success('Poll created successfully');
                setCreatePollDialog(false);
                setPollFormData({ question: '', visibility: 'PUBLIC', startAt: '', endAt: '' });
                setPollOptions(['', '']);
                // Navigate to polls page and force refresh
                navigate('/staff/polls', { state: { refresh: Date.now() } });
              } catch (error: any) {
                console.error('Poll creation error:', error);
                toast.error(error.response?.data?.error || 'Failed to create poll');
              } finally {
                setSubmitting(false);
              }
            }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Poll'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Form Dialog */}
      <Dialog open={createFormDialog} onOpenChange={setCreateFormDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>Create a custom form for collecting information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form-title">Form Title *</Label>
              <Input
                id="form-title"
                value={formBuilderData.title}
                onChange={(e) => setFormBuilderData({ ...formBuilderData, title: e.target.value })}
                placeholder="Enter form title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                value={formBuilderData.description}
                onChange={(e) => setFormBuilderData({ ...formBuilderData, description: e.target.value })}
                rows={3}
                placeholder="Describe the purpose of this form"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Form Fields</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormFields([...formFields, {
                      id: `field${formFields.length + 1}`,
                      type: 'text',
                      label: '',
                      required: false,
                      placeholder: '',
                      options: []
                    }]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>

              {formFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <Label className="text-sm font-medium">Field {index + 1}</Label>
                      {formFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormFields(formFields.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => {
                            const newFields = [...formFields];
                            newFields[index] = { 
                              ...newFields[index], 
                              type: value,
                              options: (value === 'select' || value === 'checkbox') ? [''] : []
                            };
                            setFormFields(newFields);
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Field Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => {
                            const newFields = [...formFields];
                            newFields[index] = { ...newFields[index], label: e.target.value };
                            setFormFields(newFields);
                          }}
                          placeholder="Enter label"
                          className="h-9"
                        />
                      </div>
                    </div>

                    {!['checkbox'].includes(field.type) && (
                      <div className="space-y-1">
                        <Label className="text-xs">Placeholder Text (Optional)</Label>
                        <Input
                          value={field.placeholder || ''}
                          onChange={(e) => {
                            const newFields = [...formFields];
                            newFields[index] = { ...newFields[index], placeholder: e.target.value };
                            setFormFields(newFields);
                          }}
                          placeholder="Enter placeholder text"
                          className="h-9"
                        />
                      </div>
                    )}

                    {(field.type === 'select' || field.type === 'checkbox') && (
                      <div className="space-y-2">
                        <Label className="text-xs">Options</Label>
                        <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                          {(field.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newFields = [...formFields];
                                  const newOptions = [...(field.options || [])];
                                  newOptions[optIndex] = e.target.value;
                                  newFields[index] = { ...newFields[index], options: newOptions };
                                  setFormFields(newFields);
                                }}
                                placeholder={`Option ${optIndex + 1}`}
                                className="h-9"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newFields = [...formFields];
                                  const newOptions = (field.options || []).filter((_, i) => i !== optIndex);
                                  newFields[index] = { ...newFields[index], options: newOptions };
                                  setFormFields(newFields);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              const newFields = [...formFields];
                              const newOptions = [...(field.options || []), ''];
                              newFields[index] = { ...newFields[index], options: newOptions };
                              setFormFields(newFields);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) => {
                          const newFields = [...formFields];
                          newFields[index] = { ...newFields[index], required: checked as boolean };
                          setFormFields(newFields);
                        }}
                      />
                      <Label htmlFor={`required-${field.id}`} className="text-sm font-medium cursor-pointer">
                        Required field
                      </Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFormDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!formBuilderData.title.trim()) {
                toast.error('Please enter a form title');
                return;
              }

              const hasEmptyLabels = formFields.some(field => !field.label.trim());
              if (hasEmptyLabels) {
                toast.error('All fields must have labels');
                return;
              }

              // Validate select and checkbox fields have at least one non-empty option
              for (const field of formFields) {
                if (field.type === 'select' || field.type === 'checkbox') {
                  const validOptions = (field.options || []).filter(opt => opt.trim() !== '');
                  if (validOptions.length === 0) {
                    toast.error(`${field.type === 'select' ? 'Select' : 'Checkbox'} field "${field.label}" must have at least one option`);
                    return;
                  }
                }
              }

              try {
                setSubmitting(true);
                const formPayload = {
                  title: formBuilderData.title.trim(),
                  description: formBuilderData.description.trim(),
                  fields: formFields.map(field => {
                    const baseField: any = {
                      id: field.id,
                      type: field.type,
                      label: field.label.trim(),
                      required: field.required
                    };
                    
                    if (field.placeholder && field.placeholder.trim()) {
                      baseField.placeholder = field.placeholder.trim();
                    }
                    
                    if (field.options && field.options.length > 0) {
                      const validOptions = field.options.filter(opt => opt.trim() !== '').map(opt => opt.trim());
                      if (validOptions.length > 0) {
                        baseField.options = validOptions;
                      }
                    }
                    
                    return baseField;
                  })
                };

                await formService.createForm(formPayload);
                toast.success('Form created successfully');
                setCreateFormDialog(false);
                setFormBuilderData({ title: '', description: '' });
                setFormFields([{ id: 'field1', type: 'text', label: '', required: false, placeholder: '', options: [] }]);
                setEditingOptions({});
                // Navigate to forms page and force refresh
                navigate('/staff/forms', { state: { refresh: Date.now() } });
              } catch (error: any) {
                console.error('Form creation error:', error);
                toast.error(error.response?.data?.error || 'Failed to create form');
              } finally {
                setSubmitting(false);
              }
            }} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDashboard;
