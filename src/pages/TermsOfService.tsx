import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';
import { FileText, AlertCircle, UserX, Scale, Shield, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';

const TermsOfService = () => {
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
              <Scale className="h-16 w-16 mx-auto mb-4 text-white" />
              <h1 className="text-5xl font-bold mb-4 text-white">Terms of Service</h1>
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
                  Welcome to AI Dev Community. By accessing or using our platform, you agree to be bound by these 
                  Terms of Service. Please read them carefully before using our services.
                </p>
              </Card>

              {/* Acceptance of Terms */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    By creating an account, accessing, or using the AI Dev Community platform, you acknowledge 
                    that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                  </p>
                  <p className="text-muted-foreground">
                    If you do not agree to these terms, you must not access or use our services.
                  </p>
                </Card>
              </div>

              {/* User Accounts */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">User Accounts</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Account Registration</h3>
                    <p className="text-muted-foreground">
                      You must provide accurate, complete, and current information during registration. 
                      You are responsible for maintaining the confidentiality of your account credentials.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Account Security</h3>
                    <p className="text-muted-foreground">
                      You are responsible for all activities that occur under your account. Notify us immediately 
                      of any unauthorized use or security breach.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Account Types</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>User:</strong> Access to events, polls, and community features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Staff:</strong> Additional permissions for event organization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span><strong>Admin:</strong> Full platform management capabilities</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>

              {/* User Conduct */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">User Conduct</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">You agree not to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">✗</span>
                      <span>Violate any applicable laws or regulations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">✗</span>
                      <span>Post false, misleading, or fraudulent content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">✗</span>
                      <span>Harass, abuse, or harm other users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">✗</span>
                      <span>Attempt to gain unauthorized access to any part of the platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">✗</span>
                      <span>Use the platform for commercial purposes without permission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">✗</span>
                      <span>Upload malicious code, viruses, or harmful content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">✗</span>
                      <span>Impersonate others or misrepresent your affiliation</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Events and Registrations */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Events and Registrations</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    When registering for events through our platform:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>You commit to attending events you register for</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>You must provide accurate information for event check-in</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Event organizers reserve the right to cancel or modify events</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>QR codes are unique to your registration and non-transferable</span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Intellectual Property */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Intellectual Property</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    All content on the AI Dev Community platform, including text, graphics, logos, and software, 
                    is the property of AI Dev Community or its licensors and is protected by copyright and other 
                    intellectual property laws.
                  </p>
                  <p className="text-muted-foreground">
                    You retain ownership of content you submit, but grant us a license to use, display, and 
                    distribute it on our platform.
                  </p>
                </Card>
              </div>

              {/* Termination */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <UserX className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Termination</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    We reserve the right to suspend or terminate your account at our discretion if you violate 
                    these Terms of Service or engage in conduct that we deem harmful to the platform or community.
                  </p>
                  <p className="text-muted-foreground">
                    You may delete your account at any time through your profile settings.
                  </p>
                </Card>
              </div>

              {/* Limitation of Liability */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Limitation of Liability</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    AI Dev Community is provided "as is" without warranties of any kind. We are not liable for 
                    any indirect, incidental, special, or consequential damages arising from your use of the platform.
                  </p>
                </Card>
              </div>

              {/* Changes to Terms */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Changes to Terms</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-muted-foreground">
                    We reserve the right to modify these Terms of Service at any time. We will notify users of 
                    significant changes via email or platform notification. Continued use of the platform after 
                    changes constitutes acceptance of the modified terms.
                  </p>
                </Card>
              </div>

              {/* Contact */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">Contact Us</h2>
                </div>
                <Card className="p-6">
                  <p className="text-muted-foreground mb-4">
                    If you have questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Email: <a href="mailto:legal@aidevclub.com" className="text-primary hover:underline">legal@aidevclub.com</a></p>
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

export default TermsOfService;
