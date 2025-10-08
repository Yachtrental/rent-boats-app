
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function App() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('marketplace');
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
    const handleAuthChange = (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetPassword(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      subscription.unsubscribe();
    };
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
          .insert({
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || authUser.email,
            role: authUser.user_metadata?.role || 'cliente',
            avatar_url: authUser.user_metadata?.avatar_url,
          })
          .select()
          .single();
        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast({ variant: "destructive", title: "Error Crítico de Perfil", description: "No se pudo crear tu perfil." });
          setCurrentUser(null);
        } else {
          data = newUserProfile;
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
        toast({ variant: "destructive", title: "Error de Perfil", description: "No se pudo cargar tu perfil." });
        setCurrentUser(null);
      }

      if (data) {
        setCurrentUser({
          id: data.id,
          name: data.full_name,
          role: data.role,
          ...data,
        });
      }
    } catch (e) {
      console.error('Fetch profile failed:', e);
      toast({ variant: "destructive", title: "Error de Red", description: "Fallo al conectar con el servidor." });
      setCurrentUser(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchProfile(user);
    }
  }, [user, authLoading, fetchProfile]);

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setCurrentView('marketplace');
    setBookingItem(null);
    setBookingPatron(null);
    setBookingService(null);
    setViewDetailItem(null);
    setIsMenuOpen(false);
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente" });
  };

  const handleStartBooking = (item) => {
    if (!user) {
      toast({ title: "Inicio de sesión requerido", description: "Debes iniciar sesión para reservar." });
      setShowLogin(true);
      return;
    }
    setBookingItem(item);
    setCurrentView('booking');
  };

  const handleStartPatronBooking = (patron) => {
    if (!user) {
      toast({ title: "Inicio de sesión requerido", description: "Debes iniciar sesión para contratar un patrón." });
      setShowLogin(true);
      return;
    }
    setBookingPatron(patron);
    setCurrentView('patronBooking');
  };
  
  const handleStartServiceBooking = (service) => {
    if (!user) {
      toast({ title: "Inicio de sesión requerido", description: "Debes iniciar sesión para contratar un servicio." });
      setShowLogin(true);
      return;
    }
    setBookingService(service);
    setCurrentView('serviceBooking');
  };

  const handleViewDetails = (item, type) => {
    setViewDetailItem({ item, type });
    setCurrentView(`${type}Detail`);
  };

  const handleViewChange = (view, data) => {
    if (view === 'booking') setBookingItem(data);
    if (view === 'patronBooking') setBookingPatron(data);
    if (view === 'serviceBooking') setBookingService(data);
    if (view === 'blogPost') setViewDetailItem({ item: data, type: 'blogPost' });
    if (view === 'marketplace' || view === 'blog') setViewDetailItem(null);
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const renderDashboard = () => {
    if (isLoadingProfile || authLoading) return <div className="text-center text-slate-500 py-10">Cargando perfil...</div>;
    if (!currentUser) return <div className="text-center text-slate-500 py-10">No se pudo cargar el perfil. Intenta iniciar sesión de nuevo.</div>;
    switch (currentUser.role) {
      case 'cliente': return <ClientDashboard user={currentUser} onViewChange={handleViewChange} />;
      case 'patron': return <PatronDashboard user={currentUser} onViewChange={handleViewChange} />;
      case 'armador': return <ArmadorDashboard user={currentUser} onViewChange={handleViewChange} />;
      case 'servicios': return <ServicesDashboard user={currentUser} onViewChange={handleViewChange} />;
      case 'colaborador': return <CollaboratorDashboard user={currentUser} onViewChange={handleViewChange} />;
      case 'admin': return <AdminDashboard user={currentUser} onViewChange={handleViewChange} />;
      default: return <div className="text-center text-slate-500 py-10">Rol de usuario no reconocido.</div>;
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'marketplace': return <Marketplace onStartBooking={handleStartBooking} onStartPatronBooking={handleStartPatronBooking} onStartServiceBooking={handleStartServiceBooking} onViewDetails={handleViewDetails} user={currentUser} />;
      case 'booking': return <BookingSystem user={currentUser} item={bookingItem} onViewChange={setCurrentView} />;
      case 'patronBooking': return <PatronBookingSystem user={currentUser} patron={bookingPatron} onViewChange={setCurrentView} />;
      case 'serviceBooking': return <ServiceBookingSystem user={currentUser} service={bookingService} onViewChange={setCurrentView} />;
      case 'dashboard': return renderDashboard();
      case 'boatDetail': return <BoatDetailPage item={viewDetailItem.item} user={currentUser} onStartBooking={handleStartBooking} onBack={() => setCurrentView('marketplace')} />;
      case 'patronDetail': return <PatronDetailPage item={viewDetailItem.item} user={currentUser} onStartPatronBooking={handleStartPatronBooking} onBack={() => setCurrentView('marketplace')} />;
      case 'serviceDetail': return <ServiceDetailPage item={viewDetailItem.item} user={currentUser} onStartServiceBooking={handleStartServiceBooking} onBack={() => setCurrentView('marketplace')} />;
      case 'blog': return <BlogPage onViewChange={handleViewChange} />;
      case 'blogPost': return <BlogPostPage post={viewDetailItem.item} onBack={() => setCurrentView('blog')} />;
      default: return <Marketplace onStartBooking={handleStartBooking} onStartPatronBooking={handleStartPatronBooking} onStartServiceBooking={handleStartServiceBooking} onViewDetails={handleViewDetails} user={currentUser} />;
    }
  };

  const NavLink = ({ view, children }) => (
    <Button variant="ghost" onClick={() => handleViewChange(view)} className={`w-full justify-start ${currentView === view ? 'bg-slate-100' : ''}`}>
      {children}
    </Button>
  );

  return (
    <>
      <Helmet>
        <title>Rent-boats.com - Marketplace Náutico Premium</title>
        <meta name="description" content="El marketplace náutico más completo. Alquila barcos, contrata patrones y servicios premium." />
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <motion.div className="flex items-center space-x-4 cursor-pointer" onClick={() => handleViewChange('marketplace')} whileHover={{ scale: 1.05 }}>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">⚓</span>
                </div>
                <span className="text-slate-800 font-bold text-xl hidden sm:inline">Rent-boats.com</span>
              </motion.div>

              <div className="hidden md:flex items-center space-x-2">
                <Button variant="ghost" onClick={() => handleViewChange('marketplace')} className={currentView === 'marketplace' ? 'bg-slate-100' : ''}>Marketplace</Button>
                <Button variant="ghost" onClick={() => handleViewChange('blog')} className={currentView.startsWith('blog') ? 'bg-slate-100' : ''}><BookOpen size={16} className="mr-2" />Blog</Button>
                {currentUser && (
                  <>
                    <Button variant="ghost" onClick={() => handleViewChange('dashboard')} className={currentView === 'dashboard' ? 'bg-slate-100' : ''}>Mi Dashboard</Button>
                    <Button variant="ghost" size="icon" onClick={() => handleViewChange('dashboard', { initialTab: 'favorites' })} className="text-slate-500 hover:text-red-500"><Heart /></Button>
                  </>
                )}
              </div>

              <div className="hidden md:flex items-center space-x-3">
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Globe />
                    </Button>
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
                    <Button onClick={handleLogout} variant="destructive" size="sm">Salir</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => setShowLogin(true)}>Iniciar Sesión</Button>
                    <Button onClick={() => setShowRegister(true)}>Registrarse</Button>
                  </>
                )}
              </div>

              <div className="md:hidden">
                <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-slate-200"
              >
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                  <NavLink view="marketplace">Marketplace</NavLink>
                  <NavLink view="blog"><BookOpen size={16} className="mr-2" />Blog</NavLink>
                  {currentUser && (
                    <>
                      <NavLink view="dashboard">Mi Dashboard</NavLink>
                      <NavLink view="dashboard" data={{ initialTab: 'favorites' }}><Heart className="mr-2" />Favoritos</NavLink>
                    </>
                  )}
                  <div className="border-t my-2" />
                  <div className="p-2">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Globe className="mr-2"/> {language.toUpperCase()}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuItem onSelect={() => {setLanguage('es'); setIsMenuOpen(false);}}>Español</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {setLanguage('en'); setIsMenuOpen(false);}}>English</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {setLanguage('de'); setIsMenuOpen(false);}}>Deutsch</DropdownMenuItem>
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
                      <Button onClick={handleLogout} variant="destructive" size="sm" className="w-full">Salir</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 p-2">
                      <Button variant="outline" onClick={() => { setShowLogin(true); setIsMenuOpen(false); }}>Iniciar Sesión</Button>
                      <Button onClick={() => { setShowRegister(true); setIsMenuOpen(false); }}>Registrarse</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <motion.div key={currentView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer onViewChange={handleViewChange} />

        <AnimatePresence>
          {showLogin && <LoginForm onClose={() => setShowLogin(false)} onLoginSuccess={() => { setShowLogin(false); setCurrentView('dashboard'); }} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />}
        </AnimatePresence>

        <AnimatePresence>
          {showRegister && <RegisterForm onClose={() => setShowRegister(false)} onRegisterSuccess={() => { setShowRegister(false); toast({ title: "¡Revisa tu email!", description: "Hemos enviado un enlace de confirmación." }); }} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />}
        </AnimatePresence>

        <AnimatePresence>
          {showResetPassword && <ResetPasswordForm onClose={() => setShowResetPassword(false)} onResetSuccess={() => { setShowResetPassword(false); setShowLogin(true); }} />}
        </AnimatePresence>

        <Toaster />
      </div>
    </>
  );
}
export default App;
