import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="gradient-primary py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Shield className="h-16 w-16 mx-auto mb-4 text-white" />
              <h1 className="text-5xl font-bold mb-4 text-white">Privacy Policy</h1>
              <p className="text-xl text-white/90">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Introduction */}
              <Card className="p-8">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  At AI Dev Community, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
                  disclose, and safeguard your information when you use our platform. Please read this policy carefully.
                </p>
              </Card>

              {/* Information Collection */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Information We Collect</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Personal Information</h3>
                    <p className="text-muted-foreground">
                      We collect information you provide directly, including name, email address, profile photo, 
                      bio, skills, and social media links when you create an account or update your profile.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Usage Data</h3>
                    <p className="text-muted-foreground">
                      We automatically collect information about your interactions with our platform, including 
                      events attended, polls participated in, and forms submitted.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Technical Data</h3>
                    <p className="text-muted-foreground">
                      We collect device information, IP addresses, browser type, and analytics data to improve 
                      our services and user experience.
                    </p>
                  </div>
                </Card>
              </div>

              {/* How We Use Information */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">How We Use Your Information</h2>
                </div>
                <Card className="p-6">
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>To provide, maintain, and improve our services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>To process event registrations and manage attendance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>To send notifications about events, polls, and community updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>To personalize your experience and provide relevant content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>To communicate with you about your account and respond to inquiries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>To analyze usage patterns and improve our platform</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Data Security */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Data Security</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational measures to protect your personal 
                    information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Encryption of data in transit and at rest</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Regular security assessments and updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Access controls and authentication mechanisms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Secure backup and recovery procedures</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Your Rights */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Your Rights</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">You have the right to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Access and receive a copy of your personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Correct inaccurate or incomplete information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Request deletion of your personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Object to processing of your personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Withdraw consent at any time</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Contact */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Contact Us</h2>
                </div>
                <Card className="p-6">
                  <p className="text-muted-foreground mb-4">
                    If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Email: <a href="mailto:privacy@aidevclub.com" className="text-primary hover:underline">privacy@aidevclub.com</a></p>
                    <p>Address: 123 Tech Street, Innovation Hub, City</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
