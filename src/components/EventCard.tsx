import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';

interface EventCardProps {
  id: string;
  title: string;
  titleFr?: string;
  titleAr?: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  registrations: number;
  image: string;
  category: string;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  titleFr,
  titleAr,
  description,
  date,
  location,
  capacity,
  registrations,
  image,
  category,
  isRegistered = false,
}) => {
  const { language, t } = useLanguage();
  
  const displayTitle = language === 'fr' ? titleFr : language === 'ar' ? titleAr : title;
  const isFull = registrations >= capacity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden shadow-card hover:shadow-glow transition-all">
        <div className="relative h-48 overflow-hidden">
          <img src={image} alt={displayTitle || title} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
              {category}
            </span>
          </div>
          {isFull && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full">
                Full
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{displayTitle || title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                {date && !isNaN(new Date(date).getTime()) 
                  ? format(new Date(date), 'PPP p')
                  : 'Date TBA'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>
                {registrations}/{capacity} {t.events.registered}
              </span>
            </div>
          </div>

          <Button asChild className="w-full gradient-primary" disabled={isFull || isRegistered}>
            <Link to={`/events/${id}`}>
              {isRegistered ? '✓ Registered' : isFull ? 'Full' : t.events.register}
            </Link>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};