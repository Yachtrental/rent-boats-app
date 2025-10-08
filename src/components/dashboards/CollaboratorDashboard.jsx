import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, DollarSign, Plus, Eye, Phone, UserPlus, Lock, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import ChangePasswordForm from '@/components/dashboards/forms/ChangePasswordForm';

const CollaboratorDashboard = ({ user, onViewChange }) => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`*, client:profiles!client_id(full_name), boat:boats(name)`)
      .eq('collaborator_id', user.id);

    if (bookingsError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las reservas." });
    } else {
      setBookings(bookingsData || []);
      const totalCommissions = (bookingsData || []).reduce((acc, b) => acc + (b.total_price * (user.commission_rate || 0.10)), 0);
      setStats({
        totalClients: [...new Set((bookingsData || []).map(b => b.client_id))].length,
        totalBookings: (bookingsData || []).length,
        totalCommissions: totalCommissions,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user, toast]);

  const handleAction = (action) => {
    if (action === 'new-booking') {
      onViewChange('marketplace');
      toast({ title: "Crear nueva reserva", description: "Selecciona un item del marketplace para iniciar una reserva para un cliente." });
    } else {
      toast({ title: "Funcionalidad no implementada", description: "Esta acción estará disponible pronto." });
    }
  };

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Mis Clientes" value={stats.totalClients} icon={Users} />
        <StatCard title="Reservas Totales" value={stats.totalBookings} icon={Calendar} />
        <StatCard title="Comisiones Totales" value={`€${stats.totalCommissions?.toFixed(2)}`} icon={DollarSign} />
      </div>
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Reservas Gestionadas</h2>
          <div className="flex gap-2">
            <Button onClick={() => handleAction('new-client')} variant="outline"><UserPlus size={16} className="mr-2"/>Nuevo Cliente</Button>
            <Button onClick={() => handleAction('new-booking')} className="bg-gradient-to-r from-blue-500 to-sky-500 text-white"><Plus size={16} className="mr-2"/>Nueva Reserva</Button>
          </div>
        </div>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{booking.boat?.name || 'Servicio'}</h3>
                  <p className="text-sm text-slate-500">Cliente: {booking.client.full_name}</p>
                  <p className="text-sm text-slate-500">Fecha: {new Date(booking.start_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-lg">€{booking.total_price}</p>
                  <p className="text-sm text-green-600">Comisión ({((user.commission_rate || 0.10) * 100).toFixed(0)}%): €{(booking.total_price * (user.commission_rate || 0.10)).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <BookingStatusBadge status={booking.status} />
                  <Button onClick={() => handleAction('view-booking')} size="sm" variant="outline"><Eye size={16} /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
  
  const renderSettingsTab = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Configuración de Cuenta</h2>
      <div className="max-w-md space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Percent size={20} className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-700">Mi Tasa de Comisión</h3>
          </div>
          <p className="text-4xl font-bold text-blue-600 mt-2">{((user.commission_rate || 0.10) * 100).toFixed(0)}%</p>
          <p className="text-sm text-slate-500 mt-1">Esta es la comisión que ganas por cada reserva que gestiones.</p>
        </div>
        <div className="border-t pt-6">
          <Button variant="outline" className="w-full justify-start" onClick={() => setShowChangePassword(true)}>
            <Lock className="mr-2 h-4 w-4" /> Cambiar Contraseña
          </Button>
          <p className="text-sm text-slate-500 mt-2">Actualiza tu contraseña de acceso de forma segura.</p>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="text-center text-slate-500 py-10">Cargando tu panel...</div>;

  return (
    <>
      <div className="min-h-screen p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Panel del Colaborador</h1>
            <p className="text-slate-600">Gestiona las reservas de tus clientes y maximiza tus comisiones</p>
          </motion.div>
          <div className="bg-white shadow-md rounded-2xl p-2 mb-8 border border-slate-200">
            <div className="flex space-x-2">
              <TabButton id="overview" activeTab={activeTab} setActiveTab={setActiveTab} icon={Users}>Resumen</TabButton>
              <TabButton id="settings" activeTab={activeTab} setActiveTab={setActiveTab} icon={Eye}>Cuenta</TabButton>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'settings' && renderSettingsTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {showChangePassword && <ChangePasswordForm onClose={() => setShowChangePassword(false)} onSave={() => setShowChangePassword(false)} />}
      </AnimatePresence>
    </>
  );
};

const TabButton = ({ id, activeTab, setActiveTab, icon: Icon, children }) => (
  <Button onClick={() => setActiveTab(id)} variant={activeTab === id ? 'secondary' : 'ghost'} className={`flex-1 ${activeTab === id ? 'bg-blue-500 text-white shadow' : 'text-slate-600'}`}>
    <Icon className="mr-2" size={16}/> {children}
  </Button>
);

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

const BookingStatusBadge = ({ status }) => {
  const statusStyles = {
    confirmed: 'bg-green-100 text-green-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };
  const statusText = {
    confirmed: 'Confirmada',
    pending_approval: 'Pendiente',
    cancelled: 'Cancelada',
    completed: 'Completada',
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>{statusText[status] || status}</span>;
};

export default CollaboratorDashboard;