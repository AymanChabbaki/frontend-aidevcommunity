import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  FileText, 
  CheckCircle2, 
  Send, 
  Lock, 
  Sparkles, 
  FileCheck,
  Users,
  TrendingUp,
  AlertCircle,
  Rocket,
  Loader2
} from 'lucide-react';
import { formService } from '@/services/form.service';

interface FormField {
  id: string;
  type: string;
  label: string;
  labelFr?: string;
  labelAr?: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  titleFr?: string;
  titleAr?: string;
  description: string;
  descriptionFr?: string;
  descriptionAr?: string;
  fields: FormField[];
  createdAt: string;
  _count?: { responses: number };
}

const Forms = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submittedForms, setSubmittedForms] = useState<string[]>([]);
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserSubmissions();
    }
  }, [isAuthenticated]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formService.getAllForms();
      setForms(response.data || []);
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmissions = async () => {
    try {
      const submissions = await formService.getUserSubmissions();
      setSubmittedForms(submissions.data || []);
    } catch (error) {
      console.error('Error fetching user submissions:', error);
    }
  };

  const handleFormSelect = async (formId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to access forms');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    
    const hasSubmitted = submittedForms.includes(formId);
    
    if (hasSubmitted) {
      // Load existing submission
      try {
        const response = await formService.getUserSubmission(formId);
        if (response.data) {
          setFormValues(response.data.answers || {});
          setIsEditingSubmission(true);
        }
      } catch (error) {
        console.error('Error fetching user submission:', error);
        toast.error('Failed to load your submission');
        return;
      }
    } else {
      setFormValues({});
      setIsEditingSubmission(false);
    }
    
    setSelectedForm(formId);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, formId: string) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit forms');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    const form = forms.find(f => f.id === formId);
    if (!form) return;

    // Validate required fields
    const missingFields = form.fields
      .filter(field => {
        if (!field.required) return false;
        const value = formValues[field.id];
        // Check if value is empty, undefined, null, or empty array
        if (!value) return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        return false;
      })
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      await formService.submitForm(formId, formValues);
      
      // Update submitted forms list
      if (!submittedForms.includes(formId)) {
        setSubmittedForms(prev => [...prev, formId]);
      }
      
      toast.success(isEditingSubmission ? 'Form updated successfully!' : 'Form submitted successfully!');
      setSelectedForm(null);
      setFormValues({});
      setIsEditingSubmission(false);
      
      // Refresh forms to get updated response counts
      await fetchForms();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const totalForms = forms.length;
  const activeForms = forms.length; // All forms fetched are considered active
  const totalResponses = forms.reduce((sum, form) => sum + (form._count?.responses || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderField = (field: FormField) => {
    const displayLabel = language === 'fr' ? field.labelFr : language === 'ar' ? field.labelAr : field.label;
    const label = displayLabel || field.label;
    const placeholder = (field as any).placeholder || '';

    switch (field.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-base">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={placeholder}
              className="h-12"
              required={field.required}
            />
          </div>
        );

      case 'email':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-base">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type="email"
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={placeholder}
              className="h-12"
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-base">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={placeholder}
              rows={4}
              required={field.required}
            />
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            <Label className="text-base">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={formValues[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                  <Label htmlFor={`${field.id}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        // If field has options, render as checkbox group; otherwise single checkbox
        if (field.options && field.options.length > 0) {
          return (
            <div className="space-y-3">
              <Label className="text-base">
                {label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              <div className="space-y-2">
                {field.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${index}`}
                      checked={formValues[field.id]?.includes(option) || false}
                      onCheckedChange={(checked) => {
                        const currentValues = formValues[field.id] || [];
                        if (checked) {
                          handleFieldChange(field.id, [...currentValues, option]);
                        } else {
                          handleFieldChange(field.id, currentValues.filter((v: string) => v !== option));
                        }
                      }}
                    />
                    <Label htmlFor={`${field.id}-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={formValues[field.id] || false}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              />
              <Label htmlFor={field.id} className="cursor-pointer">
                {label} {field.required && <span className="text-red-500">*</span>}
              </Label>
            </div>
          );
        }

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id} className="text-base">
              {label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formValues[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder={placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 -mt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://res.cloudinary.com/dmznisgxq/image/upload/v1764465520/3fa4678d-fed4-461d-ad92-0dd76ac30826_kb2ybv.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20" />
        </div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            style={{ y: y1 }}
            className="absolute top-20 left-10 opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <FileText className="h-32 w-32 text-white" />
          </motion.div>
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-20 right-10 opacity-20"
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity }}
          >
            <FileCheck className="h-24 w-24 text-white" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
            animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 25, repeat: Infinity }}
          >
            <Sparkles className="h-96 w-96 text-white" />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 text-base px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Community Forms
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              Share Your
              <span className="block bg-gradient-to-r from-yellow-300 via-green-300 to-blue-300 bg-clip-text text-transparent">
                Feedback
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Help us improve by filling out our community forms
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
          >
            {[
              { icon: FileText, label: 'Total Forms', value: totalForms, color: 'from-blue-500 to-cyan-500' },
              { icon: Rocket, label: 'Active Forms', value: activeForms, color: 'from-purple-500 to-pink-500' },
              { icon: Users, label: 'Total Responses', value: totalResponses, color: 'from-orange-500 to-red-500' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 rounded-2xl p-6 border border-white/20"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Authentication Alert */}
      {!isAuthenticated && (
        <div className="container mx-auto px-4 max-w-4xl -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <Lock className="h-5 w-5 text-orange-500" />
              <AlertDescription className="text-base ml-2">
                <strong>Login required:</strong> Please{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-semibold underline hover:text-primary"
                >
                  sign in
                </button>{' '}
                to access and submit forms.
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      )}

      {/* Forms Section */}
      <div className="container mx-auto px-4 max-w-4xl py-16">
        {!selectedForm ? (
          <div className="space-y-8">
            {forms.map((form, index) => {
              const displayTitle = language === 'fr' ? form.titleFr : language === 'ar' ? form.titleAr : form.title;
              const displayDescription = language === 'fr' ? form.descriptionFr : language === 'ar' ? form.descriptionAr : form.description;
              const hasSubmitted = submittedForms.includes(form.id);

              return (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-8 shadow-xl border-2 hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                    {/* Gradient Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    
                    <div className="flex items-start gap-4 mb-6">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg"
                      >
                        <FileText className="h-6 w-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">
                            {displayTitle || form.title}
                          </h3>
                          {hasSubmitted && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Submitted
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {displayDescription || form.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileCheck className="h-4 w-4" />
                            {form.fields.length} fields
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {form._count?.responses || 0} responses
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleFormSelect(form.id)}
                      disabled={!isAuthenticated}
                      className="w-full gradient-accent h-12 text-base group"
                    >
                      {hasSubmitted ? (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Edit Submission
                        </>
                      ) : !isAuthenticated ? (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Login to Fill Form
                        </>
                      ) : (
                        <>
                          Fill Form
                          <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {(() => {
              const form = forms.find(f => f.id === selectedForm);
              if (!form) return null;

              const displayTitle = language === 'fr' ? form.titleFr : language === 'ar' ? form.titleAr : form.title;
              const displayDescription = language === 'fr' ? form.descriptionFr : language === 'ar' ? form.descriptionAr : form.description;

              return (
                <Card className="p-8 shadow-xl border-2">
                  <div className="mb-8">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedForm(null)}
                      className="mb-4"
                    >
                      ← Back to Forms
                    </Button>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{displayTitle || form.title}</h2>
                        <p className="text-muted-foreground">{displayDescription || form.description}</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSubmit(e, form.id)} className="space-y-6">
                    {form.fields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {renderField(field)}
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: form.fields.length * 0.1 }}
                      className="flex gap-4 pt-6"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedForm(null)}
                        className="flex-1 h-12"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 gradient-accent h-12 group"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {isEditingSubmission ? 'Updating...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            {isEditingSubmission ? 'Update Submission' : 'Submit Form'}
                            <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Card>
              );
            })()}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Forms;
