
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Anchor, DollarSign, Settings, BarChart3, Calendar, CheckCircle, Plus, Edit, Trash2, PackagePlus, Download, XCircle, AlertTriangle, Lock, UserCheck, Mail, History, CheckSquare, XSquare, Sailboat, Briefcase, MapPin, ChevronDown, ChevronUp, User as UserIcon, Clock, FileText as FileTextIcon, RefreshCw, BookOpen, Percent, CreditCard, ShieldOff, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import EditBoatForm from '@/components/dashboards/forms/EditBoatForm';
import EditUserForm from '@/components/dashboards/forms/EditUserForm';
import EditExtraForm from '@/components/dashboards/forms/EditExtraForm';
import ChangePasswordForm from '@/components/dashboards/forms/ChangePasswordForm';
import DocumentsManager from '@/components/dashboards/common/DocumentsManager';
import EditPatronProfileForm from '@/components/dashboards/forms/EditPatronProfileForm';
import EditServiceForm from '@/components/dashboards/forms/EditServiceForm';
import BlogManager from '@/components/dashboards/common/BlogManager';
import PaymentSettings from '@/components/dashboards/common/PaymentSettings';
import AvailabilityManager from '@/components/dashboards/common/AvailabilityManager';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [boats, setBoats] = useState([]);
  const [extras, setExtras] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [patrons, setPatrons] = useState([]);
  const [services, setServices] = useState([]);
  const [editingBoat, setEditingBoat] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingExtra, setEditingExtra] = useState(null);
  const [editingPatron, setEditingPatron] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [viewingUserDocs, setViewingUserDocs] = useState(null);
  const [viewingAvailability, setViewingAvailability] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { toast } = useToast();

  const fetchAllData = async () => {
    setLoading(true);
    const [
      { data: usersData, error: usersError },
      { data: boatsData, error: boatsError },
      { data: bookingsData, error: bookingsError },
      { data: extrasData, error: extrasError },
      { data: servicesData, error: servicesError }
    ] = await Promise.all([
      supabase.from('profiles').select('*, documents(*), referrer:referrer_id(full_name)'),
      supabase.from('boats').select('*, owner:owner_id(id, full_name, commission_rate), boat_images(id, image_url, is_main), documents(*), port:ports(name)'),
      supabase.from('bookings').select('*, client:profiles!client_id(id, full_name, email, phone), boat:boats(id, name, owner:owner_id(id, full_name, email, phone, commission_rate), port:ports(name)), patron:profiles!patron_id(id, full_name, email, phone, commission_rate), collaborator:profiles!collaborator_id(id, full_name, email, commission_rate), booking_items(*, extra:extras(name), service:services(id, name, provider:provider_id(id, full_name, email, phone, commission_rate))), booking_service_confirmations(*)'),
      supabase.from('extras').select('*'),
      supabase.from('services').select('*, provider:profiles!provider_id(*, documents(*))')
    ]);

    if (usersError || boatsError || bookingsError || extrasError || servicesError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos del panel." });
    } else {
      setUsers(usersData || []);
      setBoats(boatsData || []);
      setBookings(bookingsData || []);
      setExtras(extrasData || []);
      setPatrons((usersData || []).filter(u => u.role === 'patron'));
      setServices(servicesData || []);
      setStats({
        totalUsers: (usersData || []).length,
        totalBoats: (boatsData || []).length,
        totalBookings: (bookingsData || []).length,
        totalRevenue: (bookingsData || []).reduce((acc, b) => acc + b.total_price, 0),
        pendingApprovals: (boatsData || []).filter(b => b.status === 'pending').length
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const tabs = [
    { id: 'overview', name: 'Resumen', icon: BarChart3 },
    { id: 'users', name: 'Usuarios', icon: Users },
    { id: 'boats', name: 'Embarcaciones', icon: Anchor },
    { id: 'patrons', name: 'Patrones', icon: Sailboat },
    { id: 'services', name: 'Servicios', icon: Briefcase },
    { id: 'extras', name: 'Extras', icon: PackagePlus },
    { id: 'blog', name: 'Blog', icon: BookOpen },
    { id: 'bookings', name: 'Reservas', icon: Calendar },
    { id: 'payments', name: 'Pagos', icon: CreditCard },
    { id: 'settings', name: 'Configuración', icon: Settings }
  ];

  const handleUpdateDocStatus = async (docId, status, reason = null) => {
    const { error } = await supabase.from('documents').update({ status, rejection_reason: reason }).eq('id', docId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el estado del documento." });
    } else {
      toast({ title: "Éxito", description: "Documento actualizado." });
      fetchAllData();
      if (viewingUserDocs) {
        const updatedDocs = viewingUserDocs.documents.map(d => d.id === docId ? {...d, status, rejection_reason: reason} : d);
        setViewingUserDocs(prev => ({...prev, documents: updatedDocs}));
      }
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la reserva." });
    } else {
      toast({ title: "Éxito", description: "Reserva actualizada." });
      fetchAllData();
    }
  };
  
  const handleApproveBoat = async (boatId, shouldApprove) => {
    let reason = null;
    if (!shouldApprove) {
      reason = prompt("Por favor, introduce el motivo del rechazo:");
      if (reason === null) return; // User cancelled prompt
    }
    const newStatus = shouldApprove ? 'active' : 'rejected';
    const { error } = await supabase.from('boats').update({ status: newStatus, rejection_reason: reason }).eq('id', boatId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: `No se pudo ${shouldApprove ? 'aprobar' : 'rechazar'} la embarcación.` });
    } else {
      toast({ title: "Éxito", description: `Embarcación ${shouldApprove ? 'aprobada' : 'rechazada'}.` });
      fetchAllData();
    }
  };

  const handleApproveService = async (serviceId, shouldApprove) => {
    let reason = null;
    if (!shouldApprove) {
      reason = prompt("Por favor, introduce el motivo del rechazo:");
      if (reason === null) return;
    }
    const newStatus = shouldApprove ? 'active' : 'rejected';
    const { error } = await supabase.from('services').update({ status: newStatus, rejection_reason: reason }).eq('id', serviceId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: `No se pudo ${shouldApprove ? 'aprobar' : 'rechazar'} el servicio.` });
    } else {
      toast({ title: "Éxito", description: `Servicio ${shouldApprove ? 'aprobado' : 'rechazado'}.` });
      fetchAllData();
    }
  };

  const handleApproveUser = async (userId, shouldApprove) => {
    let reason = null;
    if (!shouldApprove) {
      reason = prompt("Por favor, introduce el motivo del rechazo:");
      if (reason === null) return;
    }
    const newStatus = shouldApprove ? 'active' : 'rejected';
    const { error } = await supabase.from('profiles').update({ status: newStatus, rejection_reason: reason }).eq('id', userId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: `No se pudo ${shouldApprove ? 'aprobar' : 'rechazar'} el usuario.` });
    } else {
      toast({ title: "Éxito", description: `Usuario ${shouldApprove ? 'aprobado' : 'rechazado'}.` });
      fetchAllData();
    }
  };

  const handleDeleteExtra = async (extraId) => {
    const { error } = await supabase.from('extras').delete().eq('id', extraId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el extra." });
    } else {
      toast({ title: "Éxito", description: "Extra eliminado." });
      fetchAllData();
    }
  };

  const handleDeleteService = async (serviceId) => {
    const { error } = await supabase.from('services').delete().eq('id', serviceId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el servicio." });
    } else {
      toast({ title: "Éxito", description: "Servicio eliminado." });
      fetchAllData();
    }
  };

  const handleViewProfile = (userProfile) => {
    if (userProfile && userProfile.id) {
      const userToEdit = users.find(u => u.id === userProfile.id);
      if (userToEdit) {
        setActiveTab('users');
        setEditingUser(userToEdit);
      } else {
        toast({ variant: "destructive", title: "Error", description: "No se encontró el perfil del usuario." });
      }
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Usuarios" value={stats.totalUsers} icon={Users} color="blue" />
      <StatCard title="Embarcaciones" value={stats.totalBoats} icon={Anchor} color="green" />
      <StatCard title="Reservas Totales" value={stats.totalBookings} icon={Calendar} color="sky" />
      <StatCard title="Ingresos Totales" value={`€${stats.totalRevenue?.toLocaleString()}`} icon={DollarSign} color="yellow" />
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Gestión de Usuarios</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr><th className="px-6 py-3">Usuario</th><th className="px-6 py-3">Contacto</th><th className="px-6 py-3">Rol</th><th className="px-6 py-3">Comisión</th><th className="px-6 py-3">Estado</th><th className="px-6 py-3">Acciones</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-slate-900">
                  <p>{u.full_name}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <LinkIcon size={12} className="mr-1" />
                    <span>{u.source === 'collaborator' ? `Colab: ${u.referrer?.full_name || 'N/A'}` : u.source || 'web'}</span>
                  </div>
                </td>
                <td className="px-6 py-4"><p>{u.email}</p><p className="text-slate-500">{u.phone || 'Sin teléfono'}</p></td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">
                  {u.role !== 'cliente' ? `${((u.commission_rate || 0) * 100).toFixed(0)}%` : 'N/A'}
                </td>
                <td className="px-6 py-4"><BookingStatusBadge status={u.status} /></td>
                <td className="px-6 py-4 space-x-2">
                  {u.status === 'pending' && u.role !== 'cliente' && (
                    <>
                      <Button onClick={() => handleApproveUser(u.id, true)} size="sm" className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle size={16} /></Button>
                      <Button onClick={() => handleApproveUser(u.id, false)} size="sm" className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={16} /></Button>
                    </>
                  )}
                  <Button onClick={() => setEditingUser(u)} size="sm" variant="outline">Editar</Button>
                  {u.role !== 'cliente' && <Button onClick={() => setViewingUserDocs(u)} size="sm" variant="outline">Docs</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBoats = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Gestión de Embarcaciones</h3>
        <Button onClick={() => setEditingBoat({})}><Plus className="mr-2" size={16}/> Crear Embarcación</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr><th className="px-6 py-3">Embarcación</th><th className="px-6 py-3">Armador</th><th className="px-6 py-3">Estado</th><th className="px-6 py-3">Documentos</th><th className="px-6 py-3">Acciones</th></tr>
          </thead>
          <tbody>
            {boats.map(boat => (
              <tr key={boat.id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-slate-900">{boat.name}</td>
                <td className="px-6 py-4">
                  {boat.owner ? (
                    <div className="flex items-center gap-2">
                      <span>{boat.owner.full_name}</span>
                      <Button onClick={() => handleViewProfile(boat.owner)} size="icon" variant="ghost" className="h-6 w-6"><UserCheck size={14} /></Button>
                    </div>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4"><BookingStatusBadge status={boat.status} /></td>
                <td className="px-6 py-4">{boat.documents?.length || 0}</td>
                <td className="px-6 py-4 space-x-2">
                  {boat.status === 'pending' && (
                    <>
                      <Button onClick={() => handleApproveBoat(boat.id, true)} size="sm" className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle size={16} /></Button>
                      <Button onClick={() => handleApproveBoat(boat.id, false)} size="sm" className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={16} /></Button>
                    </>
                  )}
                  <Button onClick={() => setEditingBoat(boat)} size="sm" variant="outline"><Edit size={16} /></Button>
                  <Button onClick={() => setViewingAvailability({ id: boat.id, type: 'boat', name: boat.name })} size="sm" variant="outline"><Calendar size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPatrons = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Gestión de Patrones</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr><th className="px-6 py-3">Patrón</th><th className="px-6 py-3">Email</th><th className="px-6 py-3">Estado</th><th className="px-6 py-3">Acciones</th></tr>
          </thead>
          <tbody>
            {patrons.map(patron => (
              <tr key={patron.id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-slate-900">{patron.full_name}</td>
                <td className="px-6 py-4">{patron.email}</td>
                <td className="px-6 py-4"><BookingStatusBadge status={patron.status} /></td>
                <td className="px-6 py-4 space-x-2">
                  {patron.status === 'pending' && (
                    <>
                      <Button onClick={() => handleApproveUser(patron.id, true)} size="sm" className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle size={16} /></Button>
                      <Button onClick={() => handleApproveUser(patron.id, false)} size="sm" className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={16} /></Button>
                    </>
                  )}
                  <Button onClick={() => setEditingPatron(patron)} size="sm" variant="outline"><Edit size={16} /></Button>
                  <Button onClick={() => setViewingUserDocs(patron)} size="sm" variant="outline">Docs</Button>
                  <Button onClick={() => setViewingAvailability({ id: patron.id, type: 'patron', name: patron.full_name })} size="sm" variant="outline"><Calendar size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Gestión de Servicios</h3>
        <Button onClick={() => setEditingService({})}><Plus className="mr-2" size={16}/> Crear Servicio</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr><th className="px-6 py-3">Servicio</th><th className="px-6 py-3">Proveedor</th><th className="px-6 py-3">Precio</th><th className="px-6 py-3">Estado</th><th className="px-6 py-3">Acciones</th></tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                <td className="px-6 py-4">{service.provider?.full_name || 'N/A'}</td>
                <td className="px-6 py-4">€{service.price}</td>
                <td className="px-6 py-4"><BookingStatusBadge status={service.status} /></td>
                <td className="px-6 py-4 space-x-2">
                  {service.status === 'pending' && (
                    <>
                      <Button onClick={() => handleApproveService(service.id, true)} size="sm" className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle size={16} /></Button>
                      <Button onClick={() => handleApproveService(service.id, false)} size="sm" className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={16} /></Button>
                    </>
                  )}
                  <Button onClick={() => setEditingService(service)} size="sm" variant="outline"><Edit size={16} /></Button>
                  <Button onClick={() => handleDeleteService(service.id)} size="sm" variant="destructive"><Trash2 size={16} /></Button>
                  {service.provider && <Button onClick={() => setViewingUserDocs(service.provider)} size="sm" variant="outline">Docs</Button>}
                  <Button onClick={() => setViewingAvailability({ id: service.id, type: 'service', name: service.name })} size="sm" variant="outline"><Calendar size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExtras = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Gestión de Extras</h3>
        <Button onClick={() => setEditingExtra({})}><Plus className="mr-2" size={16}/> Crear Extra</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr><th className="px-6 py-3">Nombre</th><th className="px-6 py-3">Precio Rec.</th><th className="px-6 py-3">Rol Aplicable</th><th className="px-6 py-3">Acciones</th></tr>
          </thead>
          <tbody>
            {extras.map(extra => (
              <tr key={extra.id} className="bg-white border-b">
                <td className="px-6 py-4 font-medium text-slate-900">{extra.name}</td>
                <td className="px-6 py-4">€{extra.recommended_price}</td>
                <td className="px-6 py-4 capitalize">{extra.applicable_to_role}</td>
                <td className="px-6 py-4 space-x-2">
                  <Button onClick={() => setEditingExtra(extra)} size="sm" variant="outline"><Edit size={16} /></Button>
                  <Button onClick={() => handleDeleteExtra(extra.id)} size="sm" variant="destructive"><Trash2 size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Informe de Reservas</h3>
      <div className="space-y-4">
        {bookings.map(booking => <BookingReportCard key={booking.id} booking={booking} onUpdate={handleUpdateBookingStatus} onViewProfile={handleViewProfile} patrons={patrons} serviceProviders={users.filter(u => u.role === 'servicios')} extras={extras} onRefresh={fetchAllData} />)}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Configuración del Marketplace</h3>
      <p className="text-slate-600 mb-6">Aquí puedes ajustar parámetros globales como comisiones por defecto, políticas de cancelación y otros ajustes que afectan a todo el sitio.</p>
      <div className="space-y-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => setShowChangePassword(true)}>
          <Lock className="mr-2 h-4 w-4" /> Cambiar mi contraseña
        </Button>
        <p className="text-center text-slate-500 p-8 border-2 border-dashed rounded-lg">Más opciones de configuración estarán disponibles próximamente.</p>
      </div>
    </div>
  );

  const getRequiredDocsForUser = (user) => {
    if (!user) return [];
    switch (user.role) {
      case 'armador':
        return [
          { id: 'id_card', name: 'DNI/Pasaporte' },
          { id: 'proof_of_address', name: 'Justificante de Domicilio' },
          { id: 'boat_insurance', name: 'Seguro de la embarcación', isBoatDoc: true },
          { id: 'navigation_permit', name: 'Permiso de Navegación', isBoatDoc: true },
          { id: 'itb', name: 'Certificado de Navegabilidad / ITB', isBoatDoc: true },
          { id: 'registration', name: 'Declaración de Matrícula (Lista 6ª/7ª)', isBoatDoc: true },
        ];
      case 'patron':
        return [
          { id: 'id_card', name: 'DNI/Pasaporte' },
          { id: 'patron_license', name: 'Licencia de Navegante (PER, PY, etc.)' },
          { id: 'rc_insurance', name: 'Seguro de Responsabilidad Profesional' },
          { id: 'medical_cert', name: 'Certificado Médico Náutico' },
        ];
      case 'servicios':
        return [
          { id: 'id_card', name: 'DNI/Pasaporte del representante' },
          { id: 'company_license', name: 'Licencia de Actividad' },
          { id: 'company_insurance', name: 'Póliza de Seguro de la Empresa' },
          { id: 'fiscal_registration', name: 'Registro Fiscal' },
        ];
      default:
        return [
          { id: 'id_card', name: 'DNI/Pasaporte' },
        ];
    }
  };

  const renderUserDocsModal = () => {
    if (!viewingUserDocs) return null;
    const requiredDocs = getRequiredDocsForUser(viewingUserDocs);
    const userBoats = boats.filter(b => b.owner_id === viewingUserDocs.id);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setViewingUserDocs(null)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-3xl border border-slate-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Documentos de {viewingUserDocs.full_name}</h2>
          <DocumentsManager user={viewingUserDocs} requiredDocs={requiredDocs} relatedBoats={userBoats} onUpdateStatus={handleUpdateDocStatus} isAdminView={true} />
        </motion.div>
      </motion.div>
    );
  };

  const renderAvailabilityModal = () => {
    if (!viewingAvailability) return null;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setViewingAvailability(null)}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-50 rounded-2xl w-full max-w-5xl border border-slate-200 shadow-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Disponibilidad de {viewingAvailability.name}</h2>
            <Button variant="ghost" size="icon" onClick={() => setViewingAvailability(null)}><XCircle /></Button>
          </div>
          <div className="p-6 overflow-y-auto">
            <AvailabilityManager providerId={viewingAvailability.id} providerType={viewingAvailability.type} />
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="text-center text-slate-500 py-10">Cargando...</div>;
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'boats': return renderBoats();
      case 'patrons': return renderPatrons();
      case 'services': return renderServices();
      case 'extras': return renderExtras();
      case 'blog': return <BlogManager user={user} />;
      case 'bookings': return renderBookings();
      case 'payments': return <PaymentSettings />;
      case 'settings': return renderSettings();
      default: return <div className="text-center text-slate-500 p-8 bg-white rounded-2xl shadow-md border border-slate-200">Sección en desarrollo.</div>;
    }
  };

  return (
    <>
      <div className="min-h-screen p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Panel de Administración</h1>
            <p className="text-slate-600">Control total del ecosistema Rent-boats.com</p>
          </motion.div>
          <motion.div className="bg-white shadow-md rounded-2xl p-2 mb-8 border border-slate-200" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === tab.id ? 'bg-blue-500 text-white shadow' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                    <Icon size={16} /><span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {renderContent()}
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {editingUser && <EditUserForm user={editingUser} onClose={() => setEditingUser(null)} onSave={() => { fetchAllData(); setEditingUser(null); }} />}
        {editingBoat && <EditBoatForm boat={editingBoat} users={users.filter(u => u.role === 'armador')} onClose={() => setEditingBoat(null)} onSave={() => { fetchAllData(); setEditingBoat(null); }} isAdmin={true} />}
        {editingExtra && <EditExtraForm extra={editingExtra} onClose={() => setEditingExtra(null)} onSave={() => { fetchAllData(); setEditingExtra(null); }} />}
        {editingPatron && <EditPatronProfileForm user={editingPatron} onClose={() => setEditingPatron(null)} onSave={() => { fetchAllData(); setEditingPatron(null); }} />}
        {editingService && <EditServiceForm service={editingService} users={users.filter(u => u.role === 'servicios')} onClose={() => setEditingService(null)} onSave={() => { fetchAllData(); setEditingService(null); }} isAdmin={true} />}
        {showChangePassword && <ChangePasswordForm onClose={() => setShowChangePassword(false)} onSave={() => setShowChangePassword(false)} />}
      </AnimatePresence>
      <AnimatePresence>{renderUserDocsModal()}</AnimatePresence>
      <AnimatePresence>{renderAvailabilityModal()}</AnimatePresence>
    </>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: 'from-blue-400 to-blue-500',
    green: 'from-green-400 to-green-500',
    sky: 'from-sky-400 to-sky-500',
    yellow: 'from-yellow-400 to-yellow-500',
  };
  return (
    <motion.div className={`bg-gradient-to-br ${colors[color]} text-white rounded-2xl p-6 shadow-lg`} whileHover={{ scale: 1.03 }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className="opacity-50" size={32} />
      </div>
    </motion.div>
  );
};

const BookingStatusBadge = ({ status }) => {
  const statusStyles = {
    confirmed: 'bg-green-100 text-green-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    pending_payment: 'bg-blue-100 text-blue-800',
    pending_admin_action: 'bg-purple-100 text-purple-800',
    pending_client_decision: 'bg-orange-100 text-orange-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-slate-200 text-slate-800',
  };
  const statusText = {
    confirmed: 'Confirmada',
    pending_approval: 'Pendiente Aprobación',
    pending_payment: 'Pendiente de Pago',
    pending_admin_action: 'Acción Admin',
    pending_client_decision: 'Decisión Cliente',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
    rejected: 'Rechazada',
    completed: 'Completada',
    active: 'Activa',
    suspended: 'Suspendido',
  };
  return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status] || 'bg-slate-100 text-slate-800'}`}>{statusText[status] || status}</span>;
};

const ProfileLink = ({ label, profile, onView }) => (
  <div className="flex items-center gap-2">
    <span className="font-semibold">{label}:</span>
    <span>{profile.full_name}</span>
    <Button onClick={() => onView(profile)} size="icon" variant="ghost" className="h-5 w-5">
      <UserCheck size={12} />
    </Button>
  </div>
);

const CountdownTimer = ({ deadline }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(deadline) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000 * 60); // Update every minute
    return () => clearTimeout(timer);
  });

  if (!Object.keys(timeLeft).length) return <span className="font-mono text-red-600">Expirado</span>;

  return (
    <span className="font-mono text-orange-600">
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {`${String(timeLeft.hours).padStart(2, '0')}h `}
      {`${String(timeLeft.minutes).padStart(2, '0')}m`}
    </span>
  );
};

const BookingReportCard = ({ booking, onUpdate, onViewProfile, patrons, serviceProviders, extras, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingParticipant, setIsEditingParticipant] = useState(false);
  const [isEditingExtras, setIsEditingExtras] = useState(false);
  const { toast } = useToast();

  const isServiceBooking = !booking.boat_id;
  const serviceItem = booking.booking_items?.find(item => item.service);
  const bookingTitle = booking.boat?.name || serviceItem?.service?.name || booking.selected_slot_name || 'Reserva sin título';

  const getConfirmationStatus = (confirmed_at, deadline, isRejected) => {
    if (isRejected) return { icon: <XSquare className="text-red-500" />, text: 'Rechazado' };
    if (confirmed_at) return { icon: <CheckSquare className="text-green-500" />, text: `Confirmado` };
    return { icon: <History className="text-orange-500" />, text: 'Pendiente', deadline };
  };

  const handleNotify = () => {
    onUpdate(booking.id, 'pending_payment');
    toast({ title: "Notificación enviada", description: "Se ha notificado al cliente para que proceda con el pago." });
  };

  const handleChangePatron = async (newPatronId) => {
    const { error } = await supabase.from('bookings').update({ patron_id: newPatronId, status: 'pending_approval', patron_confirmed_at: null }).eq('id', booking.id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el patrón." });
    } else {
      toast({ title: "Éxito", description: "Patrón cambiado. Pendiente de su confirmación." });
      onRefresh();
      setIsEditingParticipant(false);
    }
  };

  const handleChangeServiceProvider = async (bookingItemId, newProviderId) => {
    const { data: serviceItem, error: itemError } = await supabase
      .from('booking_items')
      .select('service_id')
      .eq('id', bookingItemId)
      .single();

    if (itemError || !serviceItem) {
      toast({ variant: "destructive", title: "Error", description: "No se encontró el ítem del servicio." });
      return;
    }

    const { error: updateError } = await supabase
      .from('services')
      .update({ provider_id: newProviderId })
      .eq('id', serviceItem.service_id);

    if (updateError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el proveedor del servicio." });
    } else {
      toast({ title: "Éxito", description: "Proveedor cambiado. Se requiere nueva confirmación." });
      onRefresh();
      setIsEditingParticipant(false);
    }
  };

  const calculateCommission = (price, rate) => (price * (rate || 0.15)).toFixed(2);

  const armadorCommission = booking.boat?.owner?.commission_rate !== undefined ? calculateCommission(booking.total_price, booking.boat.owner.commission_rate) : 'N/A';
  const patronCommission = booking.patron?.commission_rate !== undefined ? calculateCommission(booking.total_price, booking.patron.commission_rate) : 'N/A';
  
  const serviceCommissions = booking.booking_items
    .filter(item => item.service?.provider?.commission_rate !== undefined)
    .map(item => ({
      name: item.service.name,
      commission: calculateCommission(item.price * item.quantity, item.service.provider.commission_rate)
    }));

  const totalCommission = [armadorCommission, patronCommission, ...serviceCommissions.map(s => s.commission)]
    .filter(c => c !== 'N/A')
    .reduce((acc, val) => acc + parseFloat(val), 0)
    .toFixed(2);

  const mainServiceProvider = booking.booking_items.find(item => item.service?.provider)?.service.provider;

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 transition-all">
      <div className="flex flex-wrap justify-between items-start gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h4 className="font-bold text-lg text-slate-800">{bookingTitle}</h4>
          <p className="text-sm text-slate-500">ID: {booking.id} | Cliente: {booking.client?.full_name}</p>
          <div className="mt-2"><BookingStatusBadge status={booking.status} /></div>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-slate-800">€{booking.total_price}</p>
          <p className="text-sm text-green-600">Comisión: €{totalCommission}</p>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Button>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                {/* Columna 1: Detalles de la Reserva */}
                <div className="space-y-2">
                  <h5 className="font-semibold text-slate-700 mb-2 border-b pb-1">Detalles de Reserva</h5>
                  <p className="flex items-center"><Calendar size={14} className="mr-2"/> <strong>Desde:</strong> {new Date(booking.start_date).toLocaleString()}</p>
                  <p className="flex items-center"><Calendar size={14} className="mr-2"/> <strong>Hasta:</strong> {new Date(booking.end_date).toLocaleString()}</p>
                  <p className="flex items-center"><Clock size={14} className="mr-2"/> <strong>Franja:</strong> {booking.selected_slot_name || 'Día completo'}</p>
                  <p className="flex items-center"><MapPin size={14} className="mr-2"/> <strong>Lugar:</strong> {booking.boat?.port?.name || booking.location || 'N/A'}</p>
                  <p className="flex items-center"><Users size={14} className="mr-2"/> <strong>Invitados:</strong> {booking.guests}</p>
                </div>

                {/* Columna 2: Participantes y Confirmaciones */}
                <div className="space-y-2">
                  <h5 className="font-semibold text-slate-700 mb-2 border-b pb-1">Participantes y Confirmaciones</h5>
                  <ProfileLink label="Cliente" profile={booking.client} onView={onViewProfile} />
                  {booking.boat?.owner && (
                    <div className="pl-4 border-l-2">
                      <ProfileLink label="Armador" profile={booking.boat.owner} onView={onViewProfile} />
                      <div className="flex items-center gap-2 text-xs ml-4">
                        {getConfirmationStatus(booking.armador_confirmed_at, booking.approval_deadline, booking.status === 'cancelled' && !booking.armador_confirmed_at).icon}
                        <span>Confirmación: {getConfirmationStatus(booking.armador_confirmed_at, booking.approval_deadline, booking.status === 'cancelled' && !booking.armador_confirmed_at).text}</span>
                        {booking.status === 'pending_approval' && !booking.armador_confirmed_at && <CountdownTimer deadline={booking.approval_deadline} />}
                      </div>
                    </div>
                  )}
                  {booking.patron && (
                    <div className="pl-4 border-l-2 mt-2">
                      <ProfileLink label="Patrón" profile={booking.patron} onView={onViewProfile} />
                      <div className="flex items-center gap-2 text-xs ml-4">
                        {getConfirmationStatus(booking.patron_confirmed_at, booking.approval_deadline, booking.status === 'pending_admin_action' && !booking.patron_confirmed_at).icon}
                        <span>Confirmación: {getConfirmationStatus(booking.patron_confirmed_at, booking.approval_deadline, booking.status === 'pending_admin_action' && !booking.patron_confirmed_at).text}</span>
                        {booking.status === 'pending_approval' && !booking.patron_confirmed_at && <CountdownTimer deadline={booking.approval_deadline} />}
                      </div>
                    </div>
                  )}
                  {booking.booking_items.filter(item => item.service?.provider).map(item => {
                    const provider = item.service.provider;
                    const confirmation = booking.booking_service_confirmations.find(c => c.booking_item_id === item.id);
                    return (
                      <div key={provider.id} className="pl-4 border-l-2 mt-2">
                        <ProfileLink label="Proveedor" profile={provider} onView={onViewProfile} />
                        <div className="flex items-center gap-2 text-xs ml-4">
                          {getConfirmationStatus(confirmation?.confirmed_at, booking.approval_deadline, false).icon}
                          <span>Confirmación: {getConfirmationStatus(confirmation?.confirmed_at, booking.approval_deadline, false).text}</span>
                          {booking.status === 'pending_approval' && !confirmation?.confirmed_at && <CountdownTimer deadline={booking.approval_deadline} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Columna 3: Finanzas y Acciones */}
                <div className="space-y-2">
                  <h5 className="font-semibold text-slate-700 mb-2 border-b pb-1">Finanzas y Acciones</h5>
                  <p><strong>Precio Total:</strong> €{booking.total_price}</p>
                  <p><strong>Comisión Total:</strong> €{totalCommission}</p>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button onClick={() => setIsEditingParticipant(true)} size="sm" variant="outline" className="justify-start"><RefreshCw size={14} className="mr-2"/> Cambiar {isServiceBooking ? 'Proveedor' : 'Patrón'}</Button>
                    <Button onClick={() => setIsEditingExtras(true)} size="sm" variant="outline" className="justify-start"><PackagePlus size={14} className="mr-2"/> Modificar Extras</Button>
                    <Button onClick={handleNotify} size="sm" variant="outline" className="justify-start" disabled={booking.status !== 'pending_approval'}>
                      <Mail size={14} className="mr-2"/> Notificar para Pago
                    </Button>
                    {booking.status !== 'cancelled' && <Button onClick={() => onUpdate(booking.id, 'cancelled')} size="sm" className="bg-red-100 text-red-700 hover:bg-red-200 justify-start"><XCircle size={14} className="mr-2"/> Cancelar Reserva</Button>}
                  </div>
                </div>
              </div>
              
              {booking.booking_items.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-semibold text-slate-700 mb-2">Servicios y Extras</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {booking.booking_items.map(item => (
                      <div key={item.id} className="bg-white p-2 rounded-md border">
                        <p className="font-semibold">{item.name} (x{item.quantity})</p>
                        <p>Precio: €{item.price}</p>
                        {item.service?.provider && <p>Proveedor: {item.service.provider.full_name}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isEditingParticipant && (
          <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setIsEditingParticipant(false)}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4">Cambiar {isServiceBooking ? 'Proveedor de Servicio' : 'Patrón'}</h3>
              <div className="space-y-2">
                {isServiceBooking ? (
                  serviceProviders.map(p => (
                    <Button key={p.id} variant="outline" className="w-full justify-between" onClick={() => handleChangeServiceProvider(booking.booking_items.find(i => i.service?.provider_id === p.id)?.id, p.id)} disabled={p.id === mainServiceProvider?.id}>
                      {p.full_name}
                      {p.id === mainServiceProvider?.id && <CheckCircle size={16} className="text-green-500" />}
                    </Button>
                  ))
                ) : (
                  patrons.map(p => (
                    <Button key={p.id} variant="outline" className="w-full justify-between" onClick={() => handleChangePatron(p.id)} disabled={p.id === booking.patron_id}>
                      {p.full_name}
                      {p.id === booking.patron_id && <CheckCircle size={16} className="text-green-500" />}
                    </Button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
        {isEditingExtras && (
           <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setIsEditingExtras(false)}>
             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
               <h3 className="font-bold text-lg mb-4">Modificar Extras</h3>
               <p className="text-center text-slate-500">Esta función estará disponible próximamente.</p>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
