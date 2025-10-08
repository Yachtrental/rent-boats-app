import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Star, DollarSign, User, FileText, Check, X, Lock, Package, History, AlertTriangle, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import EditPatronProfileForm from '@/components/dashboards/forms/EditPatronProfileForm';
import DocumentsManager from '@/components/dashboards/common/DocumentsManager';
import ChangePasswordForm from '@/components/dashboards/forms/ChangePasswordForm';
import ExtrasManager from '@/components/dashboards/common/ExtrasManager';
import BookingDetailModal from '@/components/dashboards/common/BookingDetailModal';
import AvailabilityManager from '@/components/dashboards/common/AvailabilityManager';

const PatronDashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState('overview');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { toast } = useToast();

  const getPatronFee = (booking) => {
    const patronItem = booking.booking_items?.find(i => i.item_type === 'patron');
    return patronItem?.price || 0;
  };

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);

    const profilePromise = supabase
      .from('profiles')
      .select('*, profile_ports(ports(name, location:locations(name)))')
      .eq('id', user.id)
      .single();

    const bookingsPromise = supabase
      .from('bookings')
      .select(`*, client:profiles!client_id(full_name), boat:boats(name, port:ports(name), deposit), booking_items(*, service:services(*, provider:profiles(*)), extra:extras(*)), booking_service_confirmations(*)`)
      .eq('patron_id', user.id);

    const [{ data: profileData, error: profileError }, { data: bookingsData, error: bookingsError }] = await Promise.all([profilePromise, bookingsPromise]);

    if (profileError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo recargar tu perfil." });
    } else {
      setCurrentUser(profileData);
    }

    if (bookingsError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar tus servicios." });
    } else {
      setBookings(bookingsData || []);
    }

    if (!profileError && !bookingsError) {
      const completedBookings = (bookingsData || []).filter(b => b.status === 'completed');
      const totalEarnings = completedBookings.reduce((acc, b) => acc + getPatronFee(b), 0);
      const totalCommission = totalEarnings * (profileData?.commission_rate || 0.15);
      
      setStats({
        totalBookings: (bookingsData || []).length,
        totalEarnings: totalEarnings - totalCommission,
        averageRating: profileData?.rating || 'N/A',
        completedTrips: completedBookings.length
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

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

  const requiredDocs = [
    { id: 'patron_license', name: 'Licencia de Navegante (PER, PY, etc.)' },
    { id: 'rc_insurance', name: 'Seguro de Responsabilidad Profesional' },
    { id: 'medical_cert', name: 'Certificado Médico Náutico' },
  ];

  const renderOverviewTab = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Servicios Totales" value={stats.totalBookings} icon={Calendar} />
        <StatCard title="Ingresos Netos" value={`€${stats.totalEarnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} />
        <StatCard title="Valoración Media" value={stats.averageRating} icon={Star} />
        <StatCard title="Viajes Completados" value={stats.completedTrips} icon={User} />
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Próximos Servicios</h2>
        {bookings.length > 0 ? bookings.map((booking) => {
          const fee = getPatronFee(booking);
          const netIncome = fee - (fee * (currentUser?.commission_rate || 0.15));

          return (
            <div key={booking.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{booking.boat?.name || 'Servicio independiente'}</h3>
                  <p className="text-sm text-slate-600 flex items-center"><MapPin size={14} className="mr-2"/>{booking.boat?.port?.name || booking.location || 'Ubicación no especificada'}</p>
                  <p className="text-sm text-slate-600 flex items-center"><Calendar size={14} className="mr-2"/>{new Date(booking.start_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-md font-semibold text-green-700">Neto: €{netIncome.toFixed(2)}</p>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>
              <div className="border-t border-slate-200 mt-4 pt-4 flex justify-end">
                 <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>Ver Detalles</Button>
              </div>
            </div>
          );
        }) : <p className="text-slate-500 text-center py-4">No tienes próximos servicios.</p>}
      </div>
    </>
  );

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Mi Perfil de Patrón</h2>
          <Button onClick={() => setIsEditingProfile(true)} variant="outline">Editar Perfil</Button>
        </div>
        <div className="max-w-md space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Percent size={20} className="text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-700">Mi Tasa de Comisión</h3>
            </div>
            <p className="text-4xl font-bold text-blue-600 mt-2">{((currentUser?.commission_rate || 0.15) * 100).toFixed(0)}%</p>
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
      <AvailabilityManager providerId={user.id} providerType="patron" />
    </div>
  );

  const renderExtrasTab = () => (
    <ExtrasManager providerId={user.id} providerType="patron" userRole="patron" />
  );

  if (loading) {
    return <div className="text-center text-slate-500 py-10">Cargando tu panel...</div>;
  }

  return (
    <>
      <div className="min-h-screen p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Panel del Patrón</h1>
            <p className="text-slate-600">Gestiona tu disponibilidad y servicios de navegación</p>
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
              <p>Por favor, revisa tu documentación y perfil y contacta con soporte si tienes dudas.</p>
            </div>
          )}
          <div className="bg-white shadow-md rounded-2xl p-2 mb-8 border border-slate-200">
            <div className="flex space-x-2">
              <TabButton id="overview" activeTab={activeTab} setActiveTab={setActiveTab} icon={User}>Resumen</TabButton>
              <TabButton id="profile" activeTab={activeTab} setActiveTab={setActiveTab} icon={User}>Perfil y Cuenta</TabButton>
              <TabButton id="extras" activeTab={activeTab} setActiveTab={setActiveTab} icon={Package}>Mis Extras</TabButton>
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
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'extras' && renderExtrasTab()}
              {activeTab === 'documents' && <DocumentsManager user={user} requiredDocs={requiredDocs} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {selectedBooking && <BookingDetailModal booking={selectedBooking} user={currentUser} onClose={() => setSelectedBooking(null)} onConfirm={handleBookingConfirmation} />}
        {isEditingProfile && (
          <EditPatronProfileForm
            user={currentUser}
            onClose={() => setIsEditingProfile(false)}
            onSave={() => {
              fetchData();
              setIsEditingProfile(false);
            }}
          />
        )}
        {showChangePassword && <ChangePasswordForm onClose={() => setShowChangePassword(false)} onSave={() => setShowChangePassword(false)} />}
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
  <Button onClick={() => setActiveTab(id)} variant={activeTab === id ? 'secondary' : 'ghost'} className={`flex-1 ${activeTab === id ? 'bg-blue-500 text-white shadow' : 'text-slate-600'}`}>
    <Icon className="mr-2" size={16}/> {children}
  </Button>
);

const BookingStatusBadge = ({ status }) => {
  const statusStyles = {
    confirmed: 'bg-green-100 text-green-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    pending_payment: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  const statusText = {
    confirmed: 'Confirmada',
    pending_approval: 'Pendiente',
    pending_payment: 'Pendiente Pago',
    cancelled: 'Cancelada',
    completed: 'Completada',
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>{statusText[status] || status}</span>;
};

export default PatronDashboard;