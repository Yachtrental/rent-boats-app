import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Anchor, DollarSign, Calendar, Eye, Edit, Trash2, FileText, Check, X, Lock, Package, History, User, MapPin, AlertTriangle, Percent, Sailboat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import EditBoatForm from '@/components/dashboards/forms/EditBoatForm';
import DocumentsManager from '@/components/dashboards/common/DocumentsManager';
import ChangePasswordForm from '@/components/dashboards/forms/ChangePasswordForm';
import ExtrasManager from '@/components/dashboards/common/ExtrasManager';
import BookingDetailModal from '@/components/dashboards/common/BookingDetailModal';
import AvailabilityManager from '@/components/dashboards/common/AvailabilityManager';

const ArmadorDashboard = ({ user }) => {
  const [boats, setBoats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingBoat, setEditingBoat] = useState(null);
  const [managingExtrasForBoat, setManagingExtrasForBoat] = useState(null);
  const [managingAvailabilityForBoat, setManagingAvailabilityForBoat] = useState(null);
  const [activeTab, setActiveTab] = useState('boats');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { toast } = useToast();

  const getArmadorFee = (booking) => {
    const boatItem = booking.booking_items?.find(i => i.item_type === 'boat');
    const extrasItems = booking.booking_items?.filter(i => {
        const extraIsFromBoat = booking.boat?.boat_extras?.some(be => be.extra_id === i.extra_id);
        return i.item_type === 'extra' && extraIsFromBoat;
    });
    const boatPrice = boatItem?.price || 0;
    const extrasPrice = extrasItems?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;
    return boatPrice + extrasPrice;
  };

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    const boatsPromise = supabase
      .from('boats')
      .select('*, boat_images(id, image_url, is_main), documents(*), port:ports(name), boat_extras(extra_id, extra:extras(deposit_amount)))')
      .eq('owner_id', user.id);

    const { data: boatsData, error: boatsError } = await boatsPromise;

    if (boatsError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar tus embarcaciones." });
      setLoading(false);
      return;
    }
    setBoats(boatsData || []);

    const boatIds = (boatsData || []).map(b => b.id);
    if (boatIds.length > 0) {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, client:profiles!client_id(full_name), patron:profiles!patron_id(full_name, avatar_url), boat:boats!inner(id, name, port:ports(name), deposit), booking_items(*, service:services(*, provider:profiles(*)), extra:extras(*)), booking_service_confirmations(*)')
        .in('boat_id', boatIds);

      if (bookingsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las reservas." });
      } else {
        const enrichedBookings = bookingsData.map(b => ({
          ...b,
          boat: { ...b.boat, boat_extras: boatsData.find(boat => boat.id === b.boat_id)?.boat_extras }
        }));
        setBookings(enrichedBookings || []);

        const completedBookings = (enrichedBookings || []).filter(b => b.status === 'completed');
        const totalEarnings = completedBookings.reduce((acc, b) => acc + getArmadorFee(b), 0);
        const totalCommission = totalEarnings * (user.commission_rate || 0.15);
        
        setStats({
          totalBoats: (boatsData || []).length,
          totalEarnings: totalEarnings - totalCommission,
          pendingBookings: (enrichedBookings || []).filter(b => b.status === 'pending_approval').length,
        });
      }
    } else {
      setBookings([]);
      setStats({ totalBoats: 0, totalEarnings: 0, pendingBookings: 0 });
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const handleAddBoat = async () => {
    const { data, error } = await supabase
      .from('boats')
      .insert({ name: 'Nueva Embarcación (Editar)', owner_id: user.id, status: 'pending', price: 0 })
      .select('*, boat_images(id, image_url, is_main), documents(*)').single();
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo añadir la embarcación." });
    } else {
      toast({ title: "Éxito", description: "Embarcación creada. Edítala para publicarla." });
      setEditingBoat(data);
      fetchData();
    }
  };

  const handleDeleteBoat = async (boatId) => {
    const { error } = await supabase.from('boats').delete().eq('id', boatId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la embarcación." });
    } else {
      toast({ title: "Éxito", description: "Embarcación eliminada." });
      fetchData();
    }
  };

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

  const renderBoatsTab = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Mis Embarcaciones" value={stats.totalBoats} icon={Anchor} />
        <StatCard title="Ingresos Netos" value={`€${stats.totalEarnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} />
        <StatCard title="Reservas Pendientes" value={stats.pendingBookings} icon={Calendar} />
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Mis Embarcaciones</h2>
          <Button onClick={handleAddBoat} className="bg-gradient-to-r from-blue-500 to-sky-500 text-white"><Plus size={20} className="mr-2" />Añadir Embarcación</Button>
        </div>
        <div className="space-y-4">
          {boats.map((boat) => <BoatCard key={boat.id} boat={boat} onEdit={() => setEditingBoat(boat)} onDelete={() => handleDeleteBoat(boat.id)} onManageExtras={() => setManagingExtrasForBoat(boat)} onManageAvailability={() => setManagingAvailabilityForBoat(boat)} />)}
        </div>
      </div>
    </>
  );

  const renderBookingsTab = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Reservas</h2>
      <div className="space-y-4">
        {bookings.length > 0 ? bookings.map(booking => {
          const armadorFee = getArmadorFee(booking);
          const netIncome = armadorFee - (armadorFee * (user.commission_rate || 0.15));
          return (
            <div key={booking.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{booking.boat.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center"><User size={14} className="mr-2"/>Cliente: {booking.client.full_name}</p>
                  {booking.patron && <p className="text-sm text-slate-500 flex items-center"><Sailboat size={14} className="mr-2"/>Patrón: {booking.patron.full_name}</p>}
                  <p className="text-sm text-slate-500 flex items-center"><Calendar size={14} className="mr-2"/>Fecha: {new Date(booking.start_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">Total Cliente: €{booking.total_price.toFixed(2)}</p>
                  <p className="text-md font-semibold text-slate-600">Tu Tarifa Bruta: €{armadorFee.toFixed(2)}</p>
                  <p className="text-sm font-semibold text-green-700">Tu Neto Estimado: €{netIncome.toFixed(2)}</p>
                  <div className="mt-2"><BookingStatusBadge status={booking.status} /></div>
                </div>
              </div>
              <div className="border-t border-slate-200 mt-4 pt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>Ver Detalles</Button>
              </div>
            </div>
          );
        }) : <p className="text-center text-slate-500 py-8">No tienes reservas para tus embarcaciones.</p>}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Mi Perfil</h2>
        <div className="max-w-md space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Percent size={20} className="text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-700">Mi Tasa de Comisión</h3>
            </div>
            <p className="text-4xl font-bold text-blue-600 mt-2">{((user.commission_rate || 0.15) * 100).toFixed(0)}%</p>
            <p className="text-sm text-slate-500 mt-1">Esta es la comisión que se aplica a cada una de tus reservas completadas.</p>
          </div>
          <div className="border-t pt-6">
            <Button variant="outline" className="w-full justify-start" onClick={() => setShowChangePassword(true)}>
              <Lock className="mr-2 h-4 w-4" /> Cambiar Contraseña
            </Button>
            <p className="text-sm text-slate-500 mt-2">Actualiza tu contraseña de acceso de forma segura.</p>
          </div>
        </div>
      </div>
      <AvailabilityManager providerId={user.id} providerType="armador" />
    </div>
  );

  const requiredDocs = [
    { id: 'boat_insurance', name: 'Seguro de la embarcación' },
    { id: 'navigation_permit', name: 'Permiso de Navegación' },
    { id: 'itb', name: 'Certificado de Navegabilidad / ITB' },
    { id: 'registration', name: 'Declaración de Matrícula (Lista 6ª/7ª)' },
  ];

  if (loading) return <div className="text-center text-slate-500 py-10">Cargando tu panel...</div>;

  return (
    <>
      <div className="min-h-screen p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Panel del Armador</h1>
            <p className="text-slate-600">Gestiona tu flota y maximiza tus ingresos</p>
          </motion.div>
          {user.status === 'pending' && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg" role="alert">
              <p className="font-bold">Perfil pendiente de aprobación</p>
              <p>Tu perfil está siendo revisado por nuestros administradores. Recibirás una notificación cuando sea aprobado.</p>
            </div>
          )}
          {user.status === 'rejected' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
              <p className="font-bold">Perfil rechazado</p>
              <p>Motivo: {user.rejection_reason || 'Sin motivo especificado.'}</p>
              <p>Por favor, revisa tu documentación y perfil y contacta con soporte si tienes dudas.</p>
            </div>
          )}
          <div className="bg-white shadow-md rounded-2xl p-2 mb-8 border border-slate-200">
            <div className="flex space-x-2">
              <TabButton id="boats" activeTab={activeTab} setActiveTab={setActiveTab} icon={Anchor}>Embarcaciones</TabButton>
              <TabButton id="bookings" activeTab={activeTab} setActiveTab={setActiveTab} icon={Calendar}>Reservas</TabButton>
              <TabButton id="documents" activeTab={activeTab} setActiveTab={setActiveTab} icon={FileText}>Documentación</TabButton>
              <TabButton id="profile" activeTab={activeTab} setActiveTab={setActiveTab} icon={User}>Perfil y Cuenta</TabButton>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              {activeTab === 'boats' && renderBoatsTab()}
              {activeTab === 'bookings' && renderBookingsTab()}
              {activeTab === 'documents' && <DocumentsManager user={user} requiredDocs={requiredDocs} relatedBoats={boats} />}
              {activeTab === 'profile' && renderProfileTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {selectedBooking && <BookingDetailModal booking={selectedBooking} user={user} onClose={() => setSelectedBooking(null)} onConfirm={handleBookingConfirmation} />}
        {editingBoat && <EditBoatForm boat={editingBoat} onClose={() => setEditingBoat(null)} onSave={() => { fetchData(); setEditingBoat(null); }} isAdmin={false} />}
        {showChangePassword && <ChangePasswordForm onClose={() => setShowChangePassword(false)} onSave={() => setShowChangePassword(false)} />}
        {managingExtrasForBoat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setManagingExtrasForBoat(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-50 rounded-2xl w-full max-w-4xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Extras para {managingExtrasForBoat.name}</h2>
                <p className="text-slate-500 mb-6">Añade y configura los extras disponibles para esta embarcación.</p>
                <ExtrasManager providerId={managingExtrasForBoat.id} providerType="boat" userRole="armador" />
              </div>
            </motion.div>
          </motion.div>
        )}
        {managingAvailabilityForBoat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setManagingAvailabilityForBoat(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-50 rounded-2xl w-full max-w-5xl border border-slate-200 shadow-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-slate-800">Disponibilidad para {managingAvailabilityForBoat.name}</h2>
              </div>
              <div className="p-6 overflow-y-auto">
                <AvailabilityManager providerId={managingAvailabilityForBoat.id} providerType="boat" />
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

const BoatCard = ({ boat, onEdit, onDelete, onManageExtras, onManageAvailability }) => {
  const mainImage = boat.boat_images.find(img => img.is_main) || boat.boat_images[0];
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all">
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
          <img className="w-full h-full object-cover" alt={boat.name} src={mainImage?.image_url || 'https://placehold.co/300x300/e2e8f0/94a3b8/png?text=Sin+Imagen'} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800">{boat.name}</h3>
          <p className="text-slate-500 text-sm">{boat.type}</p>
          <div className="flex items-center space-x-4 mt-2">
            <BookingStatusBadge status={boat.status} />
            {boat.status === 'rejected' && boat.rejection_reason && (
              <div className="flex items-center text-red-600 text-xs gap-1">
                <AlertTriangle size={14} />
                <span>{boat.rejection_reason}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-800">€{boat.price}</div>
          <span className="text-slate-500 text-sm">/día</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 mt-4">
        <Button onClick={onManageAvailability} size="sm" variant="outline"><Calendar size={16} className="mr-1" />Disponibilidad</Button>
        <Button onClick={onManageExtras} size="sm" variant="outline"><Package size={16} className="mr-1" />Gestionar Extras</Button>
        <Button onClick={onEdit} size="sm" variant="outline"><Edit size={16} className="mr-1" />Editar</Button>
        <Button onClick={onDelete} size="sm" variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200"><Trash2 size={16} className="mr-1" />Eliminar</Button>
      </div>
    </div>
  );
};

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
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };
  const statusText = {
    confirmed: 'Confirmada',
    pending_approval: 'Pendiente',
    pending_payment: 'Pendiente Pago',
    cancelled: 'Cancelada',
    completed: 'Completada',
    active: 'Activa',
    pending: 'Pendiente Revisión',
    rejected: 'Rechazada',
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>{statusText[status] || status}</span>;
};

export default ArmadorDashboard;