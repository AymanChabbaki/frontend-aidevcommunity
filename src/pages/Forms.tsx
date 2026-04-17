import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
import { useNavigate, useParams } from 'react-router-dom';
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
  Loader2,
  Share2,
  Copy,
  ChevronRight,
  ClipboardCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { formService } from '@/services/form.service';
import { cn } from '@/lib/utils';

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
  const { id } = useParams();
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormData[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(id || null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [submittedForms, setSubmittedForms] = useState<string[]>([]);
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (id) {
      setSelectedForm(id);
      if (isAuthenticated) {
        checkAndLoadSubmission(id);
      }
    } else {
      setSelectedForm(null);
    }
  }, [id, isAuthenticated]);

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

  const checkAndLoadSubmission = async (formId: string) => {
    try {
      const submissions = await formService.getUserSubmissions();
      const submissionList = submissions.data || [];
      setSubmittedForms(submissionList);
      
      if (submissionList.includes(formId)) {
        const response = await formService.getUserSubmission(formId);
        if (response.data) {
          setFormValues(response.data.answers || {});
          setIsEditingSubmission(true);
        }
      } else {
        setFormValues({});
        setIsEditingSubmission(false);
      }
    } catch (error) {
      console.error('Error loading submission status:', error);
    }
  };

  const handleFormSelect = (formId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to access forms');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    navigate(`/forms/${formId}`);
  };

  const handleShare = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/forms/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(formId);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
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
      navigate('/forms');
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

    const labelElement = (
      <Label htmlFor={field.id} className="text-lg font-semibold text-slate-200 mb-3 block">
        {label} {field.required && <span className="text-primary">*</span>}
      </Label>
    );

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div className="space-y-3">
            {labelElement}
            <div className="relative group/input">
              <Input
                id={field.id}
                type={field.type}
                value={formValues[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={placeholder}
                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-white placeholder:text-slate-600"
                required={field.required}
              />
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover/input:opacity-100 pointer-events-none transition-opacity" />
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-3">
            {labelElement}
            <div className="relative group/input">
              <Textarea
                id={field.id}
                value={formValues[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={placeholder}
                rows={5}
                className="bg-white/5 border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 text-white placeholder:text-slate-600 resize-none"
                required={field.required}
              />
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover/input:opacity-100 pointer-events-none transition-opacity" />
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-4">
            {labelElement}
            <RadioGroup
              value={formValues[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              className="grid gap-3"
            >
              {field.options?.map((option, index) => (
                <Label
                  key={index}
                  htmlFor={`${field.id}-${index}`}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer",
                    formValues[field.id] === option 
                      ? "bg-primary/10 border-primary/50 text-white shadow-lg shadow-primary/5" 
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  <RadioGroupItem value={option} id={`${field.id}-${index}`} className="border-white/20 text-primary" />
                  <span className="font-medium">{option}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        if (field.options && field.options.length > 0) {
          return (
            <div className="space-y-4">
              {labelElement}
              <div className="grid gap-3">
                {field.options.map((option, index) => {
                  const isChecked = formValues[field.id]?.includes(option) || false;
                  return (
                    <Label
                      key={index}
                      htmlFor={`${field.id}-${index}`}
                      className={cn(
                        "flex items-center space-x-3 p-4 rounded-2xl border transition-all cursor-pointer",
                        isChecked 
                          ? "bg-primary/10 border-primary/50 text-white shadow-lg shadow-primary/5" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      <Checkbox
                        id={`${field.id}-${index}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentValues = formValues[field.id] || [];
                          if (checked) {
                            handleFieldChange(field.id, [...currentValues, option]);
                          } else {
                            handleFieldChange(field.id, currentValues.filter((v: string) => v !== option));
                          }
                        }}
                        className="border-white/20 data-[state=checked]:bg-primary"
                      />
                      <span className="font-medium">{option}</span>
                    </Label>
                  );
                })}
              </div>
            </div>
          );
        } else {
          const isChecked = formValues[field.id] || false;
          return (
            <Label
              htmlFor={field.id}
              className={cn(
                "flex items-center space-x-3 p-5 rounded-2xl border transition-all cursor-pointer",
                isChecked 
                  ? "bg-primary/10 border-primary/50 text-white shadow-lg shadow-primary/5" 
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              )}
            >
              <Checkbox
                id={field.id}
                checked={isChecked}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
                className="border-white/20 data-[state=checked]:bg-primary"
              />
              <span className="text-lg font-semibold">{label}</span>
            </Label>
          );
        }

      case 'select':
        return (
          <div className="space-y-3">
            {labelElement}
            <Select
              value={formValues[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-white">
                <SelectValue placeholder={placeholder || "Choose an option"} />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-white backdrop-blur-3xl">
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option} className="focus:bg-primary/20 focus:text-white">
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
    <div className="min-h-screen bg-[#030712] text-white selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 text-primary shadow-2xl"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium tracking-wide">AI DEV COMMUNITY PORTAL</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
              VOICE YOUR 
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent block">
                INNOVATION
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Help us shape the future of our tech ecosystem through collective feedback and visionary insights.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: 'Total Forms', value: totalForms, icon: FileText },
                { label: 'Responses', value: totalResponses, icon: Users },
                { label: 'Active Tasks', value: activeForms, icon: Rocket },
                { label: 'Categories', value: 3, icon: Layers },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 text-center group hover:bg-white/10 transition-all cursor-default"
                >
                  <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative z-10 pb-32">
        <div className="container mx-auto px-4">
          {!selectedForm ? (
            <div className="max-w-6xl mx-auto">
              {/* Filter / Header */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-1 w-1 bg-gradient-to-b from-primary to-transparent rounded-full" />
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Available Forms</h2>
                    <p className="text-slate-500">Explore and contribute to our active projects</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant="secondary" className="px-4 py-2 bg-white/5 hover:bg-white/10 border-white/10 transition-colors cursor-pointer">All Forms</Badge>
                  <Badge variant="outline" className="px-4 py-2 border-white/10 hover:border-primary/50 transition-colors cursor-pointer">Archived</Badge>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {forms.map((form, index) => {
                    const displayTitle = language === 'fr' ? form.titleFr : language === 'ar' ? form.titleAr : form.title;
                    const hasSubmitted = submittedForms.includes(form.id);

                    return (
                      <motion.div
                        key={form.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        layout
                      >
                        <Card 
                          className="group relative h-full bg-white/5 border-white/10 backdrop-blur-2xl overflow-hidden hover:bg-white/[0.08] hover:border-primary/30 transition-all duration-500 cursor-pointer"
                          onClick={() => handleFormSelect(form.id)}
                        >
                          {/* Top Highlight */}
                          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="p-8 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-white transition-all"
                                  onClick={(e) => handleShare(e, form.id)}
                                >
                                  {copiedId === form.id ? <ClipboardCheck className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>

                            <div className="mt-auto">
                              <div className="flex items-center gap-2 mb-2">
                                {hasSubmitted && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Submitted
                                  </div>
                                )}
                                <div className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-wider">
                                  Official
                                </div>
                              </div>
                              
                              <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
                                {displayTitle || form.title}
                              </h3>
                              
                              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5" />
                                  {form._count?.responses || 0}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Layers className="h-3.5 w-3.5" />
                                  {form.fields.length} Fields
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  Active
                                </span>
                              </div>
                            </div>

                            {/* Hover Arrow */}
                            <div className="absolute bottom-8 right-8 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                              <ChevronRight className="h-6 w-6" />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {(() => {
                const form = forms.find(f => f.id === selectedForm);
                if (!form) return null;

                const displayTitle = language === 'fr' ? form.titleFr : language === 'ar' ? form.titleAr : form.title;
                const displayDescription = language === 'fr' ? form.descriptionFr : language === 'ar' ? form.descriptionAr : form.description;

                return (
                  <Card className="relative bg-white/5 border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
                    {/* Header accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent" />
                    
                    <div className="p-8 md:p-12">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex items-start gap-4">
                          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                            <FileText className="h-8 w-8" />
                          </div>
                          <div>
                            <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-white">
                              {displayTitle || form.title}
                            </h2>
                            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                              {displayDescription || form.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => navigate('/forms')}
                          className="self-start md:self-center text-slate-400 hover:text-white hover:bg-white/5 gap-2 px-6"
                        >
                          Cancel Process
                        </Button>
                      </div>

                      <div className="mb-10 h-[1px] bg-white/10" />

                      <form onSubmit={(e) => handleSubmit(e, form.id)} className="space-y-10">
                        {form.fields.map((field, index) => (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                          >
                            {renderField(field)}
                          </motion.div>
                        ))}

                        <div className="pt-10 flex flex-col md:flex-row gap-4">
                          <Button
                            type="submit"
                            className="flex-1 gradient-primary h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all rounded-2xl gap-3"
                            disabled={submitting}
                          >
                            {submitting ? (
                              <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                              <>
                                {isEditingSubmission ? 'Update My Response' : 'Finalize Submission'}
                                <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </Card>
                );
              })()}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Forms;
