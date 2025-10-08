import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import ClientDashboard from '@/components/dashboards/ClientDashboard';
import PatronDashboard from '@/components/dashboards/PatronDashboard';
import ArmadorDashboard from '@/components/dashboards/ArmadorDashboard';
import ServicesDashboard from '@/components/dashboards/ServicesDashboard';
import CollaboratorDashboard from '@/components/dashboards/CollaboratorDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import Marketplace from '@/components/marketplace/Marketplace';
import BookingSystem from '@/components/booking/BookingSystem';
import PatronBookingSystem from '@/components/booking/PatronBookingSystem';
import ServiceBookingSystem from '@/components/booking/ServiceBookingSystem';
import BoatDetailPage from '@/components/details/BoatDetailPage';
import PatronDetailPage from '@/components/details/PatronDetailPage';
import ServiceDetailPage from '@/components/details/ServiceDetailPage';
import BlogPage from '@/components/blog/BlogPage';
import BlogPostPage from '@/components/blog/BlogPostPage';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Heart, BookOpen, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Static pages from src/pages
import QuienesSomos from '@/pages/QuienesSomos';
import ComoFunciona from '@/pages/ComoFunciona';
import Contacto from '@/pages/Contacto';
import CentroDeAyuda from '@/pages/CentroDeAyuda';
import FAQ from '@/pages/FAQ';
import AltaArmador from '@/pages/AltaArmador';
import AltaPatron from '@/pages/AltaPatron';
import AltaServicio from '@/pages/AltaServicio';
import Colaboradores from '@/pages/Colaboradores';
import AvisoLegal from '@/pages/legal/AvisoLegal';
import PoliticaPrivacidad from '@/pages/legal/PoliticaPrivacidad';
import PoliticaCookies from '@/pages/legal/PoliticaCookies';
import TerminosCondiciones from '@/pages/legal/TerminosCondiciones';
import ResolucionConflictos from '@/pages/legal/ResolucionConflictos';

function AppShell({ children, currentUser, authLoading, language, setLanguage, isMenuOpen, setIsMenuOpen, onLogout }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div className="flex items-center space-x-4 cursor-pointer" whileHover={{ scale: 1.05 }} onClick={() => navigate('/') }>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚓</span>
              </div>
              <span className="text-slate-800 font-bold text-xl hidden sm:inline">Rent-boats.com</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" className={location.pathname === '/' ? 'bg-slate-100' : ''} onClick={() => navigate('/')}>Marketplace</Button>
              <Button variant="ghost" className={location.pathname.startsWith('/blog') ? 'bg-slate-100' : ''} onClick={() => navigate('/blog')}><BookOpen className="mr-2" size={16}/>Blog</Button>
              {currentUser && (
                <>
                  <Button variant="ghost" className={location.pathname === '/dashboard' ? 'bg-slate-100' : ''} onClick={() => navigate('/dashboard')}>Mi Dashboard</Button>
                  <Button size="icon" variant="ghost" className="text-slate-500 hover:text-red-500" onClick={() => navigate('/dashboard?tab=favorites')}><Heart className="h-4 w-4"/></Button>
                </>
              )}
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost"><Globe className="h-4 w-4"/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setLanguage('es')}>Español</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setLanguage('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setLanguage('de')}>Deutsch</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {authLoading ? (
                <div className="text-slate-500 text-sm">Cargando...</div>
              ) : currentUser ? (
                <>
                  <div className="text-slate-700 text-sm text-right">
                    <span className="font-semibold">{currentUser.name}</span>
                    <div className="text-xs text-slate-500 capitalize">{currentUser.role}</div>
                  </div>
                  <Button onClick={onLogout} size="sm" variant="destructive">Salir</Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/auth/login')}>Iniciar Sesión</Button>
                  <Button onClick={() => navigate('/auth/registro')}>Registrarse</Button>
                </>
              )}
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
              </Button>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-slate-200">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/'); setIsMenuOpen(false); }}>Marketplace</Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/blog'); setIsMenuOpen(false); }}><BookOpen className="mr-2" size={16}/>Blog</Button>
                {currentUser && (
                  <>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}>Mi Dashboard</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/dashboard?tab=favorites'); setIsMenuOpen(false); }}><Heart className="mr-2"/>Favoritos</Button>
                  </>
                )}
                <div className="border-t my-2" />
                <div className="p-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full justify-start" variant="outline"><Globe className="mr-2"/> {language.toUpperCase()}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem onSelect={() => { setLanguage('es'); setIsMenuOpen(false); }}>Español</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { setLanguage('en'); setIsMenuOpen(false); }}>English</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { setLanguage('de'); setIsMenuOpen(false); }}>Deutsch</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="border-t my-2" />
                {authLoading ? (
                  <div className="text-slate-500 text-sm px-3 py-2">Cargando...</div>
                ) : currentUser ? (
                  <div className="px-3 py-2">
                    <div className="text-slate-700 font-semibold">{currentUser.name}</div>
                    <div className="text-xs text-slate-500 capitalize mb-2">{currentUser.role}</div>
                    <Button className="w-full" onClick={onLogout} size="sm" variant="destructive">Salir</Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 p-2">
                    <Button variant="outline" onClick={() => { navigate('/auth/login'); setIsMenuOpen(false); }}>Iniciar Sesión</Button>
                    <Button onClick={() => { navigate('/auth/registro'); setIsMenuOpen(false); }}>Registrarse</Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer onViewChangePath={(path) => navigate(path)} />
    </div>
  );
}

function App() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [viewDetailItem, setViewDetailItem] = useState(null);
  const [bookingItem, setBookingItem] = useState(null);
  const [bookingPatron, setBookingPatron] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthChange = (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
      }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setCurrentUser(null);
      setIsLoadingProfile(false);
      return;
    }
    setIsLoadingProfile(true);
    try {
      let { data, error } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (error && error.code === 'PGRST116') {
        const { data: newUserProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: authUser.id, full_name: authUser.user_metadata?.full_name || authUser.email, role: authUser.user_metadata?.role || 'cliente', avatar_url: authUser.user_metadata?.avatar_url })
          .select()
          .single();
        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast({ variant: 'destructive', title: 'Error Crítico de Perfil', description: 'No se pudo crear tu perfil.' });
          setCurrentUser(null);
        } else {
          data = newUserProfile;
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
        toast({ variant: 'destructive', title: 'Error de Perfil', description: 'No se pudo cargar tu perfil.' });
        setCurrentUser(null);
      }
      if (data) {
        setCurrentUser({ id: data.id, name: data.full_name, role: data.role, ...data });
      }
    } catch (e) {
      console.error('Fetch profile failed:', e);
      toast({ variant: 'destructive', title: 'Error de Red', description: 'Fallo al conectar con el servidor.' });
      setCurrentUser(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [toast]);

  useEffect(() => { if (!authLoading) { fetchProfile(user); } }, [user, authLoading, fetchProfile]);

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setBookingItem(null);
    setBookingPatron(null);
    setBookingService(null);
    setViewDetailItem(null);
    setIsMenuOpen(false);
    toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión correctamente' });
  };

  const startBooking = (item) => { if (!user) { toast({ title: 'Inicio de sesión requerido', description: 'Debes iniciar sesión para reservar.' }); setShowLogin(true); return; } setBookingItem(item); };
  const startPatronBooking = (patron) => { if (!user) { toast({ title: 'Inicio de sesión requerido', description: 'Debes iniciar sesión para contratar un patrón.' }); setShowLogin(true); return; } setBookingPatron(patron); };
  const startServiceBooking = (service) => { if (!user) { toast({ title: 'Inicio de sesión requerido', description: 'Debes iniciar sesión para contratar un servicio.' }); setShowLogin(true); return; } setBookingService(service); };

  return (
    <BrowserRouter>
      <Helmet>
        <title>Rent-boats.com - Marketplace Náutico Premium</title>
        <meta name="description" content="El marketplace náutico más completo. Alquila barcos, contrata patrones y servicios premium." />
      </Helmet>

      <AppShell currentUser={currentUser} authLoading={authLoading} language={language} setLanguage={setLanguage} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} onLogout={handleLogout}>
        <Routes>
          {/* Home / Marketplace */}
          <Route path="/" element={<Marketplace onStartBooking={startBooking} onStartPatronBooking={startPatronBooking} onStartServiceBooking={startServiceBooking} onViewDetails={(item, type) => setViewDetailItem({ item, type })} user={currentUser} />} />

          {/* Booking flows */}
          <Route path="/booking" element={bookingItem ? <BookingSystem item={bookingItem} user={currentUser} onViewChange={() => {}} /> : <Navigate to="/" replace />} />
          <Route path="/booking/patron" element={bookingPatron ? <PatronBookingSystem patron={bookingPatron} user={currentUser} onViewChange={() => {}} /> : <Navigate to="/" replace />} />
          <Route path="/booking/servicio" element={bookingService ? <ServiceBookingSystem service={bookingService} user={currentUser} onViewChange={() => {}} /> : <Navigate to="/" replace />} />

          {/* Details */}
          <Route path="/barco/:id"
