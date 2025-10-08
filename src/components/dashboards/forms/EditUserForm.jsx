
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Briefcase, Percent, ShieldOff, Shield, Users, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';

const EditUserForm = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    role: user.role || 'cliente',
    commission_rate: user.commission_rate || 0,
    email: user.email || '',
    status: user.status || 'pending',
    source: user.source || 'web',
    referrer_id: user.referrer_id || null,
  });
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCollaborators = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'colaborador');
      if (error) {
        console.error('Error fetching collaborators:', error);
      } else {
        setCollaborators(data);
      }
    };
    fetchCollaborators();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    if (type === 'number') {
      processedValue = parseFloat(value);
      if (name === 'commission_rate') {
        processedValue = processedValue / 100;
      }
    }
    if (name === 'source' && value !== 'colaborador') {
      setFormData(prev => ({ ...prev, referrer_id: null }));
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, ...updateData } = formData;

    const { error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (profileError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el perfil del usuario." });
      setLoading(false);
      return;
    }

    if (user.role !== formData.role) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { role: formData.role } }
      );

      if (authError) {
        toast({
          variant: "destructive",
          title: "Error de Autenticación",
          description: "El perfil se actualizó, pero no se pudo cambiar el rol en el sistema de autenticación.",
        });
      }
    }

    toast({ title: "Éxito", description: "Usuario actualizado correctamente." });
    onSave();
    setLoading(false);
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    const { error } = await supabase.rpc('update_user_and_related_status', {
      p_user_id: user.id,
      p_new_status: newStatus
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: `No se pudo ${newStatus === 'suspended' ? 'suspender' : 'reactivar'} al usuario. ${error.message}` });
    } else {
      toast({ title: "Éxito", description: `Usuario ${newStatus === 'suspended' ? 'suspendido' : 'reactivado'} y todos sus servicios.` });
      onSave();
    }
    setLoading(false);
  };

  const renderInput = (name, label, placeholder, Icon, type = "text") => (
    <div>
      <Label htmlFor={name} className="block text-slate-700 text-sm font-medium mb-2">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type={type}
          id={name}
          name={name}
          value={name === 'commission_rate' ? (formData[name] * 100) : (formData[name] || '')}
          onChange={handleInputChange}
          className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          disabled={name === 'email'}
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-lg border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Editar Usuario</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderInput('full_name', 'Nombre Completo', 'Nombre del usuario', User)}
          {renderInput('email', 'Email', 'Email del usuario', Mail, 'email')}
          {renderInput('phone', 'Teléfono', 'Número de contacto', Phone)}
          
          <div>
            <Label htmlFor="role" className="block text-slate-700 text-sm font-medium mb-2">Rol</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="cliente">Cliente</option>
                <option value="patron">Patrón</option>
                <option value="armador">Armador</option>
                <option value="servicios">Servicios</option>
                <option value="colaborador">Colaborador</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {['armador', 'patron', 'servicios', 'colaborador'].includes(formData.role) &&
            renderInput('commission_rate', 'Comisión (%)', 'Ej: 15', Percent, 'number')
          }

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-700">Origen del Cliente</h3>
            <div>
              <Label htmlFor="source" className="block text-slate-700 text-sm font-medium mb-2">Fuente</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="web">Web</option>
                  <option value="referral">Referido</option>
                  <option value="collaborator">Colaborador</option>
                </select>
              </div>
            </div>
            {formData.source === 'collaborator' && (
              <div>
                <Label htmlFor="referrer_id" className="block text-slate-700 text-sm font-medium mb-2">Colaborador</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <select
                    id="referrer_id"
                    name="referrer_id"
                    value={formData.referrer_id || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Seleccionar colaborador</option>
                    {collaborators.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-700">Acciones de Moderación</h3>
            {formData.status !== 'suspended' ? (
              <Button type="button" variant="destructive" onClick={() => handleStatusChange('suspended')} className="w-full" disabled={loading}>
                <ShieldOff className="mr-2" size={16} /> Suspender Usuario y sus Servicios
              </Button>
            ) : (
              <Button type="button" onClick={() => handleStatusChange('active')} className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={loading}>
                <Shield className="mr-2" size={16} /> Reactivar Usuario y sus Servicios
              </Button>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-sky-500 text-white">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditUserForm;
