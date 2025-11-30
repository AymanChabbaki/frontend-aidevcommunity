import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, MapPin, Search, Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { eventService } from '@/services/event.service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import jsPDF from 'jspdf';

const UserDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [qrDialog, setQrDialog] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyRegistrations();
      setRegistrations(response.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any; label: string }> = {
      CONFIRMED: { 
        variant: 'default', 
        icon: CheckCircle, 
        label: 'Confirmed' 
      },
      PENDING: { 
        variant: 'secondary', 
        icon: Clock, 
        label: 'Pending Approval' 
      },
      REJECTED: { 
        variant: 'destructive', 
        icon: XCircle, 
        label: 'Rejected' 
      },
      REGISTERED: { 
        variant: 'default', 
        icon: CheckCircle, 
        label: 'Registered' 
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const generateBadge = (registration: any) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [100, 150]
    });

    // Background
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 150, 100, 'F');

    // Header
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, 150, 25, 'F');

    // Title
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('EVENT BADGE', 75, 15, { align: 'center' });

    // Event title
    doc.setFontSize(14);
    doc.setTextColor(20, 184, 166);
    doc.setFont('helvetica', 'bold');
    const eventTitle = doc.splitTextToSize(registration.event.title, 110);
    doc.text(eventTitle, 30, 40);

    // Attendee name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166);
    const attendeeName = user?.displayName || user?.email || 'Guest';
    doc.text(attendeeName, 30, 55);

    // Event Date
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Date:', 30, 65);
    doc.setTextColor(30, 41, 59);
    doc.text(format(new Date(registration.event.startAt), 'PPP p'), 30, 72);

    // QR Code on the right
    const qrCanvas = document.createElement('canvas');
    const qrElement = document.createElement('div');
    qrElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"></svg>`;
    
    // Add QR as image
    const qrSize = 35;
    const qrX = 150 - qrSize - 10;
    const qrY = 35;
    
    // Draw QR code placeholder (you'd need to generate actual QR image)
    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(0.5);
    doc.rect(qrX, qrY, qrSize, qrSize);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Scan this badge at event check-in', 75, 90, { align: 'center' });

    doc.save(`${registration.event.title.replace(/[^a-z0-9]/gi, '_')}_badge.pdf`);
    toast.success('Badge downloaded successfully');
  };

  const handleViewQR = (registration: any) => {
    if (registration.status === 'CONFIRMED' || registration.status === 'REGISTERED') {
      setSelectedRegistration(registration);
      setQrDialog(true);
    } else {
      toast.error('QR code is only available for confirmed registrations');
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch = reg.event?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || reg.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'CONFIRMED' || r.status === 'REGISTERED').length,
    pending: registrations.filter(r => r.status === 'PENDING').length,
    rejected: registrations.filter(r => r.status === 'REJECTED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">My Registrations</h1>
          <p className="text-muted-foreground">
            Track your event registrations and approval status
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rejected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('ALL')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'CONFIRMED' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('CONFIRMED')}
                  >
                    Confirmed
                  </Button>
                  <Button
                    variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('PENDING')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filterStatus === 'REJECTED' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('REJECTED')}
                  >
                    Rejected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registrations Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Registrations</CardTitle>
              <CardDescription>
                {filteredRegistrations.length} registration{filteredRegistrations.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || filterStatus !== 'ALL'
                      ? 'Try adjusting your filters'
                      : 'Start by registering for events'}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{registration.event?.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {registration.event?.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {registration.event?.startAt
                                  ? format(new Date(registration.event.startAt), 'MMM dd, yyyy')
                                  : 'TBA'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {registration.event?.locationText || registration.event?.location || 'TBA'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(registration.status)}</TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(registration.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {(registration.status === 'CONFIRMED' || registration.status === 'REGISTERED') && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewQR(registration)}
                                    title="View QR Code"
                                  >
                                    View QR
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateBadge(registration)}
                                    title="Download Badge"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
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
        </motion.div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog} onOpenChange={setQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event QR Code</DialogTitle>
            <DialogDescription>
              Show this QR code at the event check-in
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={selectedRegistration.qrToken || selectedRegistration.id} size={250} />
              </div>
              <div className="text-center">
                <p className="font-semibold">{selectedRegistration.event?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedRegistration.event?.startAt), 'PPP p')}
                </p>
              </div>
              <Button onClick={() => generateBadge(selectedRegistration)} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Badge
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
