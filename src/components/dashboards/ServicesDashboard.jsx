import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, DollarSign, Calendar, Edit, Trash2, FileText, Lock, Package, History, Check, X, MapPin, AlertTriangle, Percent, User, Briefcase, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import DocumentsManager from '@/components/dashboards/common/DocumentsManager';
import ChangePasswordForm from '@/components/dashboards/forms/ChangePasswordForm';
import ExtrasManager from '@/components/dashboards/common/ExtrasManager';
import EditServiceForm from '@/components/dashboards/forms/EditServiceForm';
import EditServiceProviderProfileForm from '@/components/dashboards/forms/EditServiceProviderProfileForm';
import BookingDetailModal from '@/components/dashboards/common/BookingDetailModal';
import AvailabilityManager from '@/components/dashboards/common/AvailabilityManager';

const ServicesDashboard = ({ user }) => {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingService, setEditingService] = useState(null);
  const [managingExtrasForService, setManagingExtrasForService] = useState(null);
  const [managingAvailabilityForService, setManagingAvailabilityForService] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const profilePromise = supabase.from('profiles').select('*').eq('id', user.id).single();
    const servicesPromise = supabase.from('services').select('*').eq('provider_id', user.id);
    
    const [{ data: profileData, error: profileError }, { data: servicesData, error: servicesError }] = await Promise.all([profilePromise, servicesPromise]);

    if (profileError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo recargar tu perfil." });
    } else {
      setCurrentUser(profileData);
    }

    if (servicesError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar tus servicios." });
      setLoading(false);
      return;
    }
    setServices(servicesData || []);

    const serviceIds = (servicesData || []).map(s => s.id);
    if (serviceIds.length > 0) {
      const { data: bookingItemsData, error: bookingsError } = await supabase
        .from('booking_items')
        .select(`
          *,
          booking:bookings!inner(
            *,
            client:profiles!client_id(full_name, phone, email),
            boat:boats(name, deposit),
            patron:profiles!patron_id(full_name),
            booking_service_confirmations(*)
          ),
          service:services!inner(provider_id, provider:profiles(*)),
          extra:extras(*)
        `)
        .in('service_id', serviceIds)
        .eq('service.provider_id', user.id)
        .order('created_at', { referencedTable: 'bookings', ascending: false });

      if (bookingsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las contrataciones." });
      } else {
        const allBookings = {};
        bookingItemsData.forEach(item => {
          if (!allBookings[item.booking.id]) {
            allBookings[item.booking.id] = {
              ...item.booking,
              booking_items: []
            };
          }
          allBookings[item.booking.id].booking_items.push(item);
        });
        setBookings(Object.values(allBookings));

        const completedBookings = (bookingItemsData || []).filter(b => b.booking.status === 'completed');
        const totalEarnings = completedBookings.reduce((acc, b) => acc + (b.price * b.quantity), 0);
        const totalCommission = totalEarnings * (profileData?.commission_rate || 0.15);
        const averageRating = (servicesData || []).length > 0 ? (servicesData || []).reduce((acc, s) => acc + (s.rating || 0), 0) / (servicesData || []).filter(s => s.rating).length : 0;
        
        setStats({
          totalServices: (servicesData || []).length,
          totalEarnings: totalEarnings - totalCommission,
          pendingBookings: Object.values(allBookings).filter(b => b.status === 'pending_approval').length,
          averageRating: isNaN(averageRating) ? 0 : averageRating.toFixed(1)
        });
      }
    } else {
      setBookings([]);
      setStats({ totalServices: 0, totalEarnings: 0, pendingBookings: 0, averageRating: 0 });
    }
    setLoading(false);
  }, [user?.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBookingConfirmation = async (bookingId, accept) => {
    const { error } = await supabase.rpc('confirm_booking_participant', {
      p_booking_id: bookingId,
      p_user_id: user.id,
      p_is_accepted: accept
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Éxito", description: `Reserva ${accept ? 'aceptada' : 'rechazada'}.` });
      fetchData();
      setSelectedBooking(null);
    }
  };

  const handleDeleteService = async (serviceId) => {
    const { error } = await supabase.from('services').delete().eq('id', serviceId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el servicio." });
    } else {
      toast({ title: "Éxito", description: "Servicio eliminado." });
      fetchData();
    }
  };

  const requiredDocs = [
    { id: 'id_card', name: 'DNI/Pasaporte del representante' },
    { id: 'company_license', name: 'Licencia de Actividad' },
    { id: 'company_insurance', name: 'Póliza de Seguro de la Empresa' },
    { id: 'fiscal_registration', name: 'Registro Fiscal' },
  ];

  const renderOverviewTab = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Mis Servicios" value={stats.totalServices} icon={Briefcase} />
          <StatCard title="Ingresos Netos" value={`€${stats.totalEarnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} />
          <StatCard title="Contrataciones Pendientes" value={stats.pendingBookings} icon={Calendar} />
          <StatCard title="Valoración Media" value={stats.averageRating} icon={Star} />
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Mis Servicios</h2>
            <Button onClick={() => setEditingService({ provider_id: user.id })} className="bg-gradient-to-r from-blue-500 to-sky-500 text-white flex items-center space-x-2"><Plus size={20} /><span>Añadir Servicio</span></Button>
          </div>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0"><img className="w-full h-full object-cover" alt={service.name} src={service.image_url || 'https://placehold.co/300x300/e2e8f0/94a3b8/png?text=Servicio'} /></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">{service.name}</h3>
                    <p className="text-slate-600 text-sm">{service.type}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <BookingStatusBadge status={service.status} />
                      {service.status === 'rejected' && service.rejection_reason && (
                        <div className="flex items-center text-red-600 text-xs gap-1">
                          <AlertTriangle size={14} />
                          <span>{service.rejection_reason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">€{service.price}</div>
                    <span className="text-slate-500 text-sm">/{service.pricing_model?.replace('per_', '') || 'unidad'}</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2 mt-4">
                  <Button onClick={() => setManagingAvailabilityForService(service)} size="sm" variant="outline"><Calendar size={16} className="mr-1" />Disponibilidad</Button>
                  <Button onClick={() => setManagingExtrasForService(service)} size="sm" variant="outline"><Package size={16} className="mr-1" />Gestionar Extras</Button>
                  <Button onClick={() => setEditingService(service)} size="sm" variant="outline"><Edit size={16} /> Editar</Button>
                  <Button onClick={() => handleDeleteService(service.id)} size="sm" variant="destructive"><Trash2 size={16} /> Eliminar</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderBookingsTab = () => {
    const filteredBookings = bookings.filter(b => {
      if (bookingFilter === 'all') return true;
      return b.status === bookingFilter;
    });

    return (
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Historial de Contrataciones</h2>
          <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            <BookingFilterButton active={bookingFilter} filter="all" setFilter={setBookingFilter}>Todos</BookingFilterButton>
            <BookingFilterButton active={bookingFilter} filter="pending_approval" setFilter={setBookingFilter}>Pendientes</BookingFilterButton>
            <BookingFilterButton active={bookingFilter} filter="confirmed" setFilter={setBookingFilter}>Confirmados</BookingFilterButton>
            <BookingFilterButton active={bookingFilter} filter="completed" setFilter={setBookingFilter}>Completados</BookingFilterButton>
            <BookingFilterButton active={bookingFilter} filter="cancelled" setFilter={setBookingFilter}>Cancelados</BookingFilterButton>
          </div>
        </div>
        <div className="space-y-4">
          {filteredBookings.length > 0 ? filteredBookings.map(booking => <BookingHistoryCard key={booking.id} booking={booking} user={currentUser} onSelect={() => setSelectedBooking(booking)} />) : <p className="text-slate-500 text-center py-8">No hay contrataciones en esta categoría.</p>}
        </div>
      </div>
    );
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Perfil de Empresa</h2>
          <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
            <User className="mr-2 h-4 w-4" /> Editar Perfil
          </Button>
        </div>
        <div className="max-w-md space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Percent size={20} className="text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-700">Mi Tasa de Comisión</h3>
            </div>
            <p className="text-4xl font-bold text-blue-600 mt-2">{((currentUser.commission_rate || 0.15) * 100).toFixed(0)}%</p>
            <p className="text-sm text-slate-500 mt-1">Esta es la comisión que se aplica a cada uno de tus servicios completados.</p>
          </div>
          <div className="border-t pt-6">
            <Button variant="outline" className="w-full justify-start" onClick={() => setShowChangePassword(true)}>
              <Lock className="mr-2 h-4 w-4" /> Cambiar Contraseña
            </Button>
            <p className="text-sm text-slate-500 mt-2">Actualiza tu contraseña de acceso de forma segura.</p>
          </div>
        </div>
      </div>
      <AvailabilityManager providerId={user.id} providerType="servicios" />
    </div>
  );

  if (loading) {
    return <div className="text-center text-slate-500 py-10">Cargando tu panel...</div>;
  }

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Panel de Servicios</h1>
            <p className="text-slate-600">Gestiona tus servicios náuticos y maximiza tu alcance</p>
          </motion.div>
          {currentUser.status === 'pending' && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg" role="alert">
              <p className="font-bold">Perfil pendiente de aprobación</p>
              <p>Tu perfil está siendo revisado por nuestros administradores. Recibirás una notificación cuando sea aprobado.</p>
            </div>
          )}
          {currentUser.status === 'rejected' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
              <p className="font-bold">Perfil rechazado</p>
              <p>Motivo: {currentUser.rejection_reason || 'Sin motivo especificado.'}</p>
              <p>Por favor, revisa tu documentation y perfil y contacta con soporte si tienes dudas.</p>
            </div>
          )}
          <div className="bg-white shadow-md rounded-2xl p-2 mb-8 border border-slate-200 overflow-x-auto">
            <div className="flex space-x-1 sm:space-x-2 min-w-max">
              <TabButton id="overview" activeTab={activeTab} setActiveTab={setActiveTab} icon={Star}>Resumen</TabButton>
              <TabButton id="bookings" activeTab={activeTab} setActiveTab={setActiveTab} icon={History}>Contrataciones</TabButton>
              <TabButton id="profile" activeTab={activeTab} setActiveTab={setActiveTab} icon={User}>Perfil y Cuenta</TabButton>
              <TabButton id="documents" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText}>Documentación</TabButton>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'bookings' && renderBookingsTab()}
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'documents' && <DocumentsManager user={user} requiredDocs={requiredDocs} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {selectedBooking && <BookingDetailModal booking={selectedBooking} user={currentUser} onClose={() => setSelectedBooking(null)} onConfirm={handleBookingConfirmation} />}
        {isEditingProfile && (
          <EditServiceProviderProfileForm
            user={currentUser}
            onClose={() => setIsEditingProfile(false)}
            onSave={() => {
              fetchData();
              setIsEditingProfile(false);
            }}
          />
        )}
        {editingService && <EditServiceForm service={editingService} users={[user]} onClose={() => setEditingService(null)} onSave={() => { fetchData(); setEditingService(null); }} />}
        {showChangePassword && <ChangePasswordForm onClose={() => setShowChangePassword(false)} onSave={() => setShowChangePassword(false)} />}
        {managingExtrasForService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setManagingExtrasForService(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-50 rounded-2xl w-full max-w-4xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Extras para {managingExtrasForService.name}</h2>
                <p className="text-slate-500 mb-6">Añade y configura los extras disponibles para este servicio.</p>
                <ExtrasManager providerId={managingExtrasForService.id} providerType="service" userRole="servicios" />
              </div>
            </motion.div>
          </motion.div>
        )}
        {managingAvailabilityForService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setManagingAvailabilityForService(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-50 rounded-2xl w-full max-w-5xl border border-slate-200 shadow-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-slate-800">Disponibilidad para {managingAvailabilityForService.name}</h2>
              </div>
              <div className="p-6 overflow-y-auto">
                <AvailabilityManager providerId={managingAvailabilityForService.id} providerType="service" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <Icon className="text-blue-500" size={32} />
    </div>
  </div>
);

const TabButton = ({ id, activeTab, setActiveTab, icon: Icon, children }) => (
  <Button onClick={() => setActiveTab(id)} variant={activeTab === id ? 'secondary' : 'ghost'} className={`flex-1 text-xs sm:text-sm ${activeTab === id ? 'bg-blue-500 text-white shadow' : 'text-slate-600'}`}>
    <Icon className="mr-2" size={16}/> {children}
  </Button>
);

const BookingStatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    pending_payment: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-slate-100 text-slate-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const statusText = {
    active: 'Activo',
    pending: 'Pendiente Revisión',
    rejected: 'Rechazado',
    pending_approval: 'Pendiente Aprobación',
    pending_payment: 'Pendiente de Pago',
    confirmed: 'Confirmado',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>{statusText[status] || status}</span>;
};

const BookingFilterButton = ({ active, filter, setFilter, children }) => (
  <Button
    variant={active === filter ? 'default' : 'ghost'}
    size="sm"
    onClick={() => setFilter(filter)}
    className={`text-xs sm:text-sm whitespace-nowrap ${active === filter ? 'bg-blue-500 text-white' : 'text-slate-600'}`}
  >
    {children}
  </Button>
);

const BookingHistoryCard = ({ booking, user, onSelect }) => {
  const serviceItems = booking.booking_items.filter(item => item.service?.provider_id === user.id);
  const totalProviderPrice = serviceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const commission = totalProviderPrice * (user.commission_rate || 0.15);
  const netIncome = totalProviderPrice - commission;

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800">Reserva #{booking.id}</h3>
          <p className="text-sm text-slate-500">Servicios: {serviceItems.map(i => i.name).join(', ')}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
            <div className="flex items-center"><User size={14} className="mr-1.5 text-blue-500" /> {booking.client.full_name}</div>
            <div className="flex items-center"><MapPin size={14} className="mr-1.5 text-blue-500" /> {booking.location}</div>
            <div className="flex items-center"><Calendar size={14} className="mr-1.5 text-blue-500" /> {new Date(booking.start_date).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-slate-500">Ingreso Neto</p>
          <p className="text-xl font-bold text-green-600">€{netIncome.toFixed(2)}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-slate-500 mb-1">Estado</p>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>
      <div className="border-t border-slate-200 mt-4 pt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={onSelect}>Ver Detalles</Button>
      </div>
    </div>
  );
};

export default ServicesDashboard;