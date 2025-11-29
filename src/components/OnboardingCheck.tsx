import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, X, ArrowRight, CheckCircle } from 'lucide-react';

export const OnboardingCheck = () => {
  const { isAuthenticated, user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const needsOnboarding = localStorage.getItem('needsOnboarding');
      if (needsOnboarding === 'true') {
        setShowPrompt(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleComplete = () => {
    localStorage.removeItem('needsOnboarding');
    setShowPrompt(false);
  };

  const [showForm, setShowForm] = useState(false);

  const handleOpenForm = () => {
    setShowForm(true);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={showForm ? "w-full max-w-4xl h-[90vh]" : "w-full max-w-lg"}
        >
          {showForm ? (
            <Card className="h-full shadow-2xl border-2 relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleComplete}
                className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background rounded-full p-2 shadow-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Embedded Google Form */}
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSdu_abXzvs4gCvMcGVI3BvOTdo4Sn_tCop03G0CrhUkmEHYJA/viewform?embedded=true"
                className="w-full h-full"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
              >
                Loading…
              </iframe>

              {/* Completed button at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-sm border-t">
                <Button
                  onClick={handleComplete}
                  className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  I've Completed the Form
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 shadow-2xl border-2 relative">
              {/* Close button */}
              <button
                onClick={handleComplete}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center mb-2">
                Welcome to AI Dev Community!
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                Complete your membership profile
              </p>

              {/* Alert */}
              <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <AlertDescription className="text-sm">
                  Please fill out the membership form to complete your registration and unlock all community features.
                </AlertDescription>
              </Alert>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleOpenForm}
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 group"
                >
                  Fill Membership Form
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  onClick={handleComplete}
                  variant="outline"
                  className="w-full h-12 text-base group"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  I've Already Completed It
                </Button>

                <button
                  onClick={handleComplete}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  I'll do this later
                </button>
              </div>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
