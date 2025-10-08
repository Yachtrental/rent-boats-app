import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Heart, FileText, Sailboat, User as UserIcon, Anchor, Trash2, Star, Edit } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import ChangePasswordForm from '@/components/dashboards/forms/ChangePasswordForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import BoatDetailCard from '@/components/marketplace/BoatDetailCard';
import DocumentsManager from '@/components/dashboards/common/DocumentsManager';
import EditClientProfileForm from '@/components/dashboards/forms/EditClientProfileForm';
import BookingDetailModal from '@/components/dashboards/common/BookingDetailModal';

const ClientDashboard = ({ user, onViewChange }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState({ boats: [], patrons: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    const profilePromise = supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    const bookingsPromise = supabase
      .from('bookings')
      .select('*, boat:boats(*, boat_images(image_url, is_main), port:ports(name), cancellation_policy, deposit), patron:profiles!patron_id(*), booking_items(*, service:services(*), extra:extras(*))')
      .eq('client_id', currentUser.id)
      .order('created_at', { ascending: false });
    const favPromise = supabase
      .from('favorites')
      .select(`
        id,
        boat:boats(*, boat_images(image_url, is_main), port:ports(name, location:locations(name))),
        patron:profiles!patron_id(*, profile_ports(ports(name, location:locations(name)))),
        service:services(*, service_ports(ports(name, location:locations(name))))
      `)
      .eq('user_id', currentUser.id);

    const [{ data: profileData, error: profileError }, { data: bookingsData, error: bookingsError }, { data: favData, error: favError }] = await Promise.all([profilePromise, bookingsPromise, favPromise]);

    if (profileError) console.error('Error fetching profile:', profileError);
    else setCurrentUser(profileData);

    if (bookingsError) console.error('Error fetching bookings:', bookingsError);
    else setBookings(bookingsData || []);

    if (favError) console.error('Error fetching favorites:', favError);
    else {
      setFavorites({
        boats: favData.map(f => f.boat).filter(Boolean),
        patrons: favData.map(f => f.patron).filter(Boolean),
        services: favData.map(f => f.service).filter(Boolean),
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const handleToggleFavorite = async (item, type) => {
    const { error } = await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq(`${type}_id`, item.id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo quitar de favoritos." });
    } else {
      setFavorites(prev => ({ ...prev, [`${type}s`]: prev[`${type}s`].filter(i => i.id !== item.id) }));
      toast({ title: "Eliminado de favoritos" });
    }
  };

  const handlePayment = () => {
    toast({
      title: "🚧 ¡Función en desarrollo!",
      description: "El sistema de pago se implementará próximamente. ¡Gracias por tu paciencia!",
    });
  };

  const getRequiredDocsForUser = (user) => {
    if (!user) return [];
    return [
      { id: 'id_card', name: 'DNI/Pasaporte' },
      { id: 'patron_license', name: 'Licencia de Navegante (si aplica)' },
    ];
  };

  const renderBookings = () => (
    <div className="space-y-6">
      {bookings.length > 0 ? bookings.map(booking => (
        <motion.div key={booking.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row gap-6">
            {(booking.boat || booking.booking_items?.[0]?.service) && (
              <img src={booking.boat?.boat_images?.[0]?.image_url || booking.booking_items?.[0]?.service?.image_url || 'https://placehold.co/600x400/e2e8f0/94a3b8/png?text=Reserva'} alt={booking.boat?.name || booking.booking_items?.[0]?.service?.name} className="w-full md:w-48 h-40 object-cover rounded-lg" />
            )}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{booking.boat?.name || booking.booking_items?.[0]?.service?.name || booking.selected_slot_name || 'Reserva'}</h3>
                  <p className="text-slate-500 text-sm">{booking.selected_slot_name}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'pending_payment' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {booking.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="border-t border-slate-100 my-3"></div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center"><Calendar size={16} className="mr-2 text-blue-500"/> <span>{new Date(booking.start_date).toLocaleDateString()}</span></div>
                <div className="flex items-center"><UserIcon size={16} className="mr-2 text-blue-500"/> <span>{booking.guests} invitados</span></div>
                {booking.patron && <div className="flex items-center col-span-2"><UserIcon size={16} className="mr-2 text-blue-500"/> <span>Patrón: {booking.patron.full_name}</span></div>}
              </div>
              <div className="flex justify-between items-end mt-4">
                <Button variant="outline" onClick={() => setSelectedBooking(booking)}>Ver Detalles</Button>
                <span className="text-2xl font-bold text-slate-800">€{booking.total_price}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )) : <p className="text-center text-slate-500 py-8">Aún no tienes ninguna reserva.</p>}
    </div>
  );

  const renderFavorites = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><Sailboat className="mr-3 text-blue-500"/>Embarcaciones Favoritas</h3>
        {favorites.boats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.boats.map(boat => <BoatDetailCard key={boat.id} boat={boat} onStartBooking={() => onViewChange('booking', boat)} isFavorite={true} onToggleFavorite={() => handleToggleFavorite(boat, 'boat')} onViewDetails={() => onViewChange('boatDetail', boat)} />)}
          </div>
        ) : <p className="text-center text-slate-500 py-8">No tienes embarcaciones favoritas.</p>}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><UserIcon className="mr-3 text-yellow-500"/>Patrones Favoritos</h3>
        {favorites.patrons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.patrons.map(patron => {
              const lowestPrice = patron.price_per_day || 150;
              const patronPorts = patron.profile_ports?.map(pp => pp.ports.name).join(', ') || 'Ubicación no especificada';
              return (
                <motion.div key={patron.id} className="bg-white shadow-md rounded-2xl p-5 border border-slate-200 hover:shadow-xl transition-all group text-center flex flex-col relative" whileHover={{ y: -5 }}>
                  <Button size="icon" variant="ghost" className="absolute top-4 right-4 bg-slate-100/50 text-slate-600 hover:bg-slate-200/70" onClick={() => handleToggleFavorite(patron, 'patron')}>
                    <Trash2 className="text-red-500" size={20} />
                  </Button>
                  <img src={patron.avatar_url || `https://ui-avatars.com/api/?name=${patron.full_name}&background=e2e8f0&color=334155`} alt={patron.full_name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-200" />
                  <h3 className="text-xl font-bold text-slate-800">{patron.full_name}</h3>
                  <div className="flex justify-center items-center text-yellow-500 my-2"><Star size={16} className="mr-1" /><span>{patron.rating || 'N/A'}</span></div>
                  <p className="text-slate-600 text-sm mb-4 truncate">{patronPorts}</p>
                  <div className="flex justify-between items-center w-full mt-auto pt-4 border-t border-slate-100">
                    <div><span className="text-slate-500 text-sm">Desde </span><span className="text-lg font-bold text-slate-800">€{lowestPrice}</span></div>
                    <Button onClick={() => onViewChange('patronBooking', patron)}>Contratar</Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : <p className="text-center text-slate-500 py-8">No tienes patrones favoritos.</p>}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><Anchor className="mr-3 text-sky-500"/>Servicios Favoritos</h3>
        {favorites.services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.services.map(service => (
              <motion.div key={service.id} className="bg-white shadow-md rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all group relative" whileHover={{ y: -5 }}>
                <Button size="icon" variant="ghost" className="absolute top-4 right-4 bg-black/30 text-white hover:bg-black/50" onClick={() => handleToggleFavorite(service, 'service')}>
                  <Trash2 className="text-red-500" size={20} />
                </Button>
                <div className="relative h-40"><img src={service.image_url || 'https://placehold.co/600x400/e2e8f0/94a3b8/png?text=Servicio'} alt={service.name} className="w-full h-full object-cover" /></div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-800">{service.name}</h3>
                  <p className="text-slate-500 text-sm truncate">{service.service_ports?.map(sp => sp.ports.name).join(', ')}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-slate-800">€{service.price}</span>
                    <Button variant="outline" onClick={() => onViewChange('serviceDetail', service)}>Ver</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : <p className="text-center text-slate-500 py-8">No tienes servicios favoritos.</p>}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800">Mi Perfil</h3>
        <Button variant="outline" onClick={() => setEditingProfile(true)}><Edit size={16} className="mr-2"/> Editar Perfil</Button>
      </div>
      <div className="flex items-center space-x-6">
        <img src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${currentUser.full_name}&background=e2e8f0&color=334155`} alt={currentUser.full_name} className="w-24 h-24 rounded-full border-4 border-slate-200" />
        <div className="space-y-2">
          <p><span className="font-semibold">Nombre:</span> {currentUser.full_name}</p>
          <p><span className="font-semibold">Email:</span> {currentUser.email}</p>
          <p><span className="font-semibold">Teléfono:</span> {currentUser.phone || 'No especificado'}</p>
          <p><span className="font-semibold">Rol:</span> <span className="capitalize">{currentUser.role}</span></p>
        </div>
      </div>
      <div className="mt-8">
        <Button onClick={() => setShowPasswordForm(true)}>Cambiar Contraseña</Button>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <DocumentsManager user={currentUser} requiredDocs={getRequiredDocsForUser(currentUser)} />
  );

  const renderContent = () => {
    if (loading) return <div className="text-center text-slate-500 py-10">Cargando...</div>;
    switch (activeTab) {
      case 'bookings': return renderBookings();
      case 'favorites': return renderFavorites();
      case 'profile': return renderProfile();
      case 'documents': return renderDocuments();
      default: return null;
    }
  };

  const tabs = [
    { id: 'bookings', label: 'Mis Reservas', icon: Calendar },
    { id: 'favorites', label: 'Mis Favoritos', icon: Heart },
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'documents', label: 'Documentos', icon: FileText },
  ];

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Panel de Cliente</h1>
            <p className="text-xl text-slate-600">Gestiona tus reservas, favoritos y configuración.</p>
          </motion.div>

          <div className="flex justify-center mb-8">
            <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200 flex flex-wrap gap-2 justify-center">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === tab.id ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <tab.icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {renderContent()}
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {selectedBooking && <BookingDetailModal booking={selectedBooking} user={currentUser} onClose={() => setSelectedBooking(null)} onPayment={handlePayment} />}
        {showPasswordForm && <ChangePasswordForm onClose={() => setShowPasswordForm(false)} onSave={() => setShowPasswordForm(false)} />}
        {editingProfile && <EditClientProfileForm user={currentUser} onClose={() => setEditingProfile(false)} onSave={() => { setEditingProfile(false); fetchDashboardData(); }} />}
      </AnimatePresence>
    </>
  );
};

export default ClientDashboard;