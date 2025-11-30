import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Calendar, MapPin, Users, User as UserIcon, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { eventService } from '@/services/event.service';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';

const EventDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isRegistered, setIsRegistered] = useState(false);
  const [badgeToken, setBadgeToken] = useState('');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id, isAuthenticated]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id!);
      const foundEvent = response.data;
      
      if (foundEvent) {
        // Map to expected format
        const mappedEvent = {
          ...foundEvent,
          image: foundEvent.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          registrations: foundEvent._count?.registrations || 0,
        };
        setEvent(mappedEvent);
        
        // Check if user is registered by fetching user's registrations
        if (isAuthenticated && user) {
          const registrationsRes = await eventService.getMyRegistrations();
          const registered = registrationsRes.data.some((r: any) => r.eventId === id);
          setIsRegistered(registered);
          if (registered) {
            const registration = registrationsRes.data.find((r: any) => r.eventId === id);
            setBadgeToken(registration?.id || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Card>
      </div>
    );
  }

  const displayTitle = language === 'fr' ? event.titleFr : language === 'ar' ? event.titleAr : event.title;
  const displayDescription = language === 'fr' ? event.descriptionFr : language === 'ar' ? event.descriptionAr : event.description;

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please create an account or login to register for events', {
        description: 'You need to be logged in to register for events',
        duration: 5000,
      });
      setTimeout(() => {
        navigate('/register');
      }, 1000);
      return;
    }

    // Check eligibility on frontend before sending request
    if (event.requiresApproval) {
      const eligibleLevels = event.eligibleLevels || [];
      const eligiblePrograms = event.eligiblePrograms || [];
      
      if (eligibleLevels.length > 0 || eligiblePrograms.length > 0) {
        const userLevel = user?.studyLevel;
        const userProgram = user?.studyProgram;
        
        let isEligible = true;
        if (eligibleLevels.length > 0) {
          isEligible = isEligible && userLevel && eligibleLevels.includes(userLevel);
        }
        if (eligiblePrograms.length > 0) {
          isEligible = isEligible && userProgram && eligiblePrograms.includes(userProgram);
        }
        
        if (!isEligible) {
          toast.error('You are not eligible for this event', {
            description: 'Please check the eligibility requirements below',
          });
          return;
        }
      }
    }

    try {
      const response = await eventService.registerForEvent(event.id);
      
      if (response.success) {
        setIsRegistered(true);
        setBadgeToken(response.data.id);
        toast.success('Successfully registered for the event!', {
          description: 'You will receive a confirmation email shortly',
        });
        
        // Refresh event data to update registration count
        fetchEvent();
      }
    } catch (error: any) {
      console.error('Error registering for event:', error);
      const errorMessage = error.response?.data?.error || 'Failed to register for event';
      toast.error(errorMessage);
    }
  };

  const generateBadge = () => {
    if (!user?.displayName && !user?.email) {
      toast.error('User information not available');
      return;
    }

    if (!badgeToken) {
      toast.error('Registration token not available');
      return;
    }

    // Wait a bit for QR code to render
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const pageWidth = 210;
        const pageHeight = 297;
        
        // White background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Header background (gradient effect using multiple rectangles)
        doc.setFillColor(20, 184, 166); // Primary teal
        doc.rect(0, 0, pageWidth, 50, 'F');
        
        // Header content
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('AI Dev Community', 105, 25, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Event Registration Badge', 105, 38, { align: 'center' });
        
        // Event Title
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        const eventTitle = displayTitle || event.title;
        const splitTitle = doc.splitTextToSize(eventTitle, 150);
        doc.text(splitTitle, 105, 75, { align: 'center' });
        
        // Attendee Name
        doc.setFontSize(16);
        doc.setTextColor(71, 85, 105); // Slate-600
        doc.setFont('helvetica', 'normal');
        doc.text('Attendee:', 30, 95);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 184, 166);
        const attendeeName = user.displayName || user.email || 'Guest';
        doc.text(attendeeName, 30, 105);
        
        // Event Date
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text('Date:', 30, 120);
        doc.setTextColor(30, 41, 59);
        doc.text(format(new Date(event.startAt), 'PPP p'), 30, 130);
        
        // Event Location
        doc.setTextColor(71, 85, 105);
        doc.text('Location:', 30, 145);
        doc.setTextColor(30, 41, 59);
        const splitLocation = doc.splitTextToSize(event.locationText || event.location || 'TBA', 150);
        doc.text(splitLocation, 30, 155);
        
        // Main content area - Event Details Card (draw border after content to calculate proper height)
        const contentHeight = 155 + (splitLocation.length * 5); // Calculate based on location text
        doc.setDrawColor(20, 184, 166);
        doc.setLineWidth(0.5);
        doc.roundedRect(20, 60, 170, contentHeight - 50, 3, 3, 'S');
        
        // QR Code section - with gap from border
        const qrElement = document.querySelector('.registration-qr svg');
        if (qrElement instanceof SVGElement) {
          try {
            // Convert SVG to canvas
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              const svgData = new XMLSerializer().serializeToString(qrElement);
              const img = new Image();
              const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(svgBlob);
              
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
                const qrDataUrl = canvas.toDataURL('image/png');
                doc.addImage(qrDataUrl, 'PNG', 75, contentHeight + 18, 60, 60);
                URL.revokeObjectURL(url);
                
                // Continue with rest of PDF generation
                finalizePDF(doc, badgeToken, event.id, contentHeight);
              };
              
              img.src = url;
              return; // Wait for image to load
            }
          } catch (error) {
            console.error('Error adding QR code to PDF:', error);
          }
        }
        
        // If QR code fails, continue without it
        finalizePDF(doc, badgeToken, event.id, contentHeight);
      } catch (error) {
        console.error('Error generating badge:', error);
        toast.error('Failed to generate badge');
      }
    }, 100);
  };

  const finalizePDF = (doc: jsPDF, token: string, eventId: string, contentHeight: number) => {
    const pageWidth = 210;
    const pageHeight = 297;
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.text('Scan for verification', 105, contentHeight + 88, { align: 'center' });
    doc.setFontSize(8);
    doc.text(`Token: ${token}`, 105, contentHeight + 94, { align: 'center' });
    
    // Footer section with contact info - fixed at bottom of page
    const footerY = pageHeight - 25;
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(0, footerY, pageWidth, 25, 'F');
    
    // Footer border
    doc.setDrawColor(20, 184, 166);
    doc.setLineWidth(0.3);
    doc.line(0, footerY, pageWidth, footerY);
    
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Us:', 105, footerY + 6, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Email: contactaidevcommunity@gmail.com', 105, footerY + 11, { align: 'center' });
    doc.text('Phone: +212 687830201', 105, footerY + 16, { align: 'center' });
    doc.text('Location: Faculty of Science Ben M\'sik, Casablanca, Morocco', 105, footerY + 21, { align: 'center' });
    
    doc.save(`badge-${eventId}.pdf`);
    toast.success('Badge downloaded successfully!');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="overflow-hidden shadow-card">
            <div className="relative h-96">
              <img
                src={event.image}
                alt={displayTitle || event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="inline-block px-4 py-2 bg-primary rounded-full text-sm font-bold mb-4">
                  {event.category}
                </span>
                <h1 className="text-4xl font-bold mb-2">{displayTitle || event.title}</h1>
                <p className="text-lg">{displayDescription || event.description}</p>
              </div>
            </div>

            <div className="p-8">
              {!isAuthenticated && (
                <Alert className="mb-6 border-primary/50 bg-primary/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Please create an account to register for this event.</strong>
                    <br />
                    You need to be logged in to register and get access to event tickets.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.events.date}</p>
                      <p className="font-medium">{format(new Date(event.startAt), 'PPP p')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.events.location}</p>
                      <p className="font-medium">{event.locationText || event.location || 'TBA'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.events.capacity}</p>
                      <p className="font-medium">
                        {event.registrations} / {event.capacity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t.events.speaker}</p>
                      <p className="font-medium">{event.speaker}</p>
                    </div>
                  </div>
                </div>
              </div>

              {event.requiresApproval && (event.eligibleLevels?.length > 0 || event.eligiblePrograms?.length > 0) && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Eligibility Requirements:</strong>
                    <div className="mt-2 space-y-1">
                      {event.eligibleLevels?.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Study Levels: </span>
                          <span className="text-sm">{event.eligibleLevels.join(', ')}</span>
                        </div>
                      )}
                      {event.eligiblePrograms?.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Study Programs: </span>
                          <span className="text-sm">{event.eligiblePrograms.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {isRegistered ? (
                <div className="space-y-4">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-6 text-center">
                    <p className="text-lg font-medium mb-4">✓ You're registered for this event!</p>
                    <div className="flex justify-center mb-4 registration-qr">
                      <QRCodeSVG value={badgeToken} size={200} />
                    </div>
                    <Button onClick={generateBadge} className="gradient-primary">
                      {t.events.getTicket}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleRegister}
                  className="w-full gradient-primary"
                  size="lg"
                  disabled={event.registrations >= event.capacity}
                >
                  {event.registrations >= event.capacity ? 'Event Full' : t.events.register}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EventDetail;