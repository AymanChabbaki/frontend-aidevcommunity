import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OnboardingCheck } from "@/components/OnboardingCheck";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import PastEvents from "./pages/PastEvents";
import Members from "./pages/Members";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

// User Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Polls from "./pages/Polls";
import Forms from "./pages/Forms";
import UserDashboard from "./pages/UserDashboard";
import Quizzes from "./pages/Quizzes";
import QuizPlay from "./pages/QuizPlay";
import QuizLeaderboard from "./pages/QuizLeaderboard";
import Podcasts from "./pages/Podcasts";

// Staff Pages
import OrganizerEvents from "./pages/OrganizerEvents";
import QRScanner from "./pages/QRScanner";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import AdminHomeContent from "./pages/AdminHomeContent";
import AdminCreateEvent from "./pages/AdminCreateEvent";
import AdminCreatePoll from "./pages/AdminCreatePoll";
import AdminCreateForm from "./pages/AdminCreateForm";
import AdminManageEvents from "./pages/AdminManageEvents";
import AdminManagePolls from "./pages/AdminManagePolls";
import AdminManageForms from "./pages/AdminManageForms";
import AdminContactMessages from "./pages/AdminContactMessages";
import AdminApproveRegistrations from "./pages/AdminApproveRegistrations";
import SendMessage from "./pages/SendMessage";
import AdminManageQuizzes from "./pages/AdminManageQuizzes";
import AdminManagePodcasts from "./pages/AdminManagePodcasts";
import AdminCreatePodcast from "./pages/AdminCreatePodcast";

// Staff Pages (Dashboard)
import StaffDashboard from "./pages/StaffDashboard";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout wrapper for non-admin routes with Navbar
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
  </div>
);

// Layout wrapper for admin routes without Navbar
const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">{children}</div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <OnboardingCheck />
          <BrowserRouter>
            <Routes>
              {/* Public Routes with Navbar */}
              <Route path="/" element={<MainLayout><Index /></MainLayout>} />
              <Route path="/about" element={<MainLayout><About /></MainLayout>} />
              <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
              <Route path="/events/:id" element={<MainLayout><EventDetail /></MainLayout>} />
              <Route path="/past-events" element={<MainLayout><PastEvents /></MainLayout>} />
              <Route path="/members" element={<MainLayout><Members /></MainLayout>} />
              <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
              <Route path="/privacy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
              <Route path="/terms" element={<MainLayout><TermsOfService /></MainLayout>} />
              <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
              <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
              <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
              <Route path="/reset-password" element={<MainLayout><ResetPassword /></MainLayout>} />
              <Route path="/polls" element={<MainLayout><Polls /></MainLayout>} />
              <Route path="/podcasts" element={<MainLayout><Podcasts /></MainLayout>} />
              <Route path="/forms" element={<MainLayout><Forms /></MainLayout>} />

              {/* Quiz Routes */}
              <Route
                path="/quizzes"
                element={
                  <MainLayout>
                    <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}>
                      <Quizzes />
                    </ProtectedRoute>
                  </MainLayout>
                }
              />
              <Route
                path="/quizzes/:id/play"
                element={
                  <MainLayout>
                    <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}>
                      <QuizPlay />
                    </ProtectedRoute>
                  </MainLayout>
                }
              />
              <Route
                path="/quizzes/:id/leaderboard"
                element={
                  <MainLayout>
                    <ProtectedRoute allowedRoles={['USER', 'STAFF', 'ADMIN']}>
                      <QuizLeaderboard />
                    </ProtectedRoute>
                  </MainLayout>
                }
              />

              {/* User Dashboard Routes with Navbar */}
              <Route
                path="/dashboard"
                element={
                  <MainLayout>
                    <ProtectedRoute allowedRoles={['USER']}>
                      <Dashboard />
                    </ProtectedRoute>
                  </MainLayout>
                }
              />
              <Route
                path="/my-registrations"
                element={
                  <MainLayout>
                    <ProtectedRoute allowedRoles={['USER']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  </MainLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <MainLayout>
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  </MainLayout>
                }
              />
              <Route
                path="/notifications"
                element={
                  <MainLayout>
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  </MainLayout>
                }
              />

              {/* Staff Dashboard Routes - Nested */}
              <Route
                path="/staff/*"
                element={
                  <ProtectedRoute allowedRoles={['STAFF']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* QR Scanner - Keep separate as it's shared with admin */}
              <Route
                path="/organizer/qr-scanner"
                element={
                  <MainLayout>
                    <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                      <QRScanner />
                    </ProtectedRoute>
                  </MainLayout>
                }
              />

              {/* Admin Routes WITHOUT Navbar - uses sidebar */}
              <Route
                path="/admin/*"
                element={
                  <AdminLayout>
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminDashboard><AdminUsers /></AdminDashboard>} />
                        
                        {/* Event Management */}
                        <Route path="manage-events" element={<AdminDashboard><AdminManageEvents /></AdminDashboard>} />
                        <Route path="create-event" element={<AdminDashboard><AdminCreateEvent /></AdminDashboard>} />
                        
                        {/* Poll Management */}
                        <Route path="manage-polls" element={<AdminDashboard><AdminManagePolls /></AdminDashboard>} />
                        <Route path="create-poll" element={<AdminDashboard><AdminCreatePoll /></AdminDashboard>} />
                        
                        {/* Form Management */}
                        <Route path="manage-forms" element={<AdminDashboard><AdminManageForms /></AdminDashboard>} />
                        <Route path="create-form" element={<AdminDashboard><AdminCreateForm /></AdminDashboard>} />
                        
                        {/* Quiz Management */}
                        <Route path="manage-quizzes" element={<AdminDashboard><AdminManageQuizzes /></AdminDashboard>} />
                        
                        {/* Podcast Management */}
                        <Route path="podcasts" element={<AdminDashboard><AdminManagePodcasts /></AdminDashboard>} />
                        <Route path="podcasts/create" element={<AdminDashboard><AdminCreatePodcast /></AdminDashboard>} />
                        <Route path="podcasts/edit/:id" element={<AdminDashboard><AdminCreatePodcast /></AdminDashboard>} />
                        
                        <Route path="settings" element={<AdminDashboard><AdminSettings /></AdminDashboard>} />
                        <Route path="home-content" element={<AdminDashboard><AdminHomeContent /></AdminDashboard>} />
                        <Route path="contact-messages" element={<AdminDashboard><AdminContactMessages /></AdminDashboard>} />
                        <Route path="approve-registrations" element={<AdminDashboard><AdminApproveRegistrations /></AdminDashboard>} />
                        <Route path="send-message" element={<AdminDashboard><SendMessage /></AdminDashboard>} />
                      </Routes>
                    </ProtectedRoute>
                  </AdminLayout>
                }
              />

              {/* 404 */}
              <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;