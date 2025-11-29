import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { eventService } from '@/services/event.service';
import { pollService } from '@/services/poll.service';

const AdminDashboard = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    systemStatus: 'operational'
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard',
    },
    {
      title: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Events',
      icon: Calendar,
      path: '/admin/manage-events',
    },
    {
      title: 'Polls',
      icon: BarChart3,
      path: '/admin/manage-polls',
    },
    {
      title: 'Forms',
      icon: FileText,
      path: '/admin/manage-forms',
    },
    {
      title: 'Home Content',
      icon: Home,
      path: '/admin/home-content',
    },
    {
      title: 'Contact Messages',
      icon: Mail,
      path: '/admin/contact-messages',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await adminService.getAllUsers();
        const totalUsers = usersResponse.data?.length || 0;

        // Fetch events
        const eventsResponse = await eventService.getAllEvents();
        const activeEvents = eventsResponse.data?.filter((event: any) => 
          event.status === 'UPCOMING' || event.status === 'ONGOING'
        ).length || 0;

        // Fetch stats if available
        try {
          const statsResponse = await adminService.getStats();
          setStats({
            totalUsers,
            activeEvents,
            totalRegistrations: statsResponse.data?.totalRegistrations || 0,
            systemStatus: 'operational'
          });
        } catch {
          // If stats endpoint doesn't exist, use fetched data
          setStats({
            totalUsers,
            activeEvents,
            totalRegistrations: 0,
            systemStatus: 'operational'
          });
        }
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        // Set default stats on error
        setStats({
          totalUsers: 0,
          activeEvents: 0,
          totalRegistrations: 0,
          systemStatus: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname === '/admin/dashboard') {
      fetchStats();
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-gray-900 text-white transition-all duration-300 flex flex-col',
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
              <span className="font-semibold">Admin Panel</span>
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
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-semibold">
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Dashboard Overview - Only show on main dashboard route */}
          {location.pathname === '/admin/dashboard' && (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user?.displayName}!
                </h1>
                <p className="text-muted-foreground">
                  Manage your community from here
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.totalUsers}
                    </div>
                    <p className="text-xs text-muted-foreground">All registered users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.activeEvents}
                    </div>
                    <p className="text-xs text-muted-foreground">Upcoming & ongoing</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : stats.totalRegistrations}
                    </div>
                    <p className="text-xs text-muted-foreground">Event registrations</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                    <p className="text-xs text-muted-foreground">All systems running</p>
                  </CardContent>
                </Card>
              </div>

              {/* Create Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/create-event')}>
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

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/create-poll')}>
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

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/create-form')}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Create Form</CardTitle>
                      <FileText className="h-8 w-8 text-purple-500" />
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

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link to="/admin/users">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/create-event')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/create-poll')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Create Poll
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {loading ? 'Loading...' : 'No recent activity to display'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Child content for nested routes */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
