import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';

const EditClientProfileForm = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    avatar_url: user.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fileName = `avatars/${user.id}-${Date.now()}`;
    const { error } = await supabase.storage.from('boat-images').upload(fileName, file);
    if (error) {
      toast({ variant: "destructive", title: "Error de subida", description: error.message });
    } else {
      const { data } = supabase.storage.from('boat-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
      toast({ title: "Éxito", description: "Avatar subido correctamente." });
    }
    setUploadingAvatar(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        avatar_url: formData.avatar_url,
      })
      .eq('id', user.id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el perfil." });
    } else {
      toast({ title: "Éxito", description: "Perfil actualizado correctamente." });
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
          value={formData[name] || ''}
          onChange={handleInputChange}
          className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-lg border border-slate-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Editar Mi Perfil</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-slate-700 text-sm font-medium mb-2">Foto de Perfil</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                {formData.avatar_url ? <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" /> : <ImageIcon className="text-slate-400" size={32} />}
              </div>
              <label className="cursor-pointer bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Upload size={16} className="inline mr-2" />
                {uploadingAvatar ? 'Subiendo...' : 'Cambiar Foto'}
                <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" disabled={uploadingAvatar} />
              </label>
            </div>
            <p className="text-xs text-yellow-600 mt-2">⚠️ No subas archivos pesados, el sistema los comprimirá automáticamente para optimizar espacio y velocidad.</p>
          </div>

          {renderInput('full_name', 'Nombre Completo', 'Tu nombre y apellidos', User)}
          {renderInput('phone', 'Teléfono', 'Tu número de contacto', Phone, 'tel')}
          
          <div>
            <Label htmlFor="email" className="block text-slate-700 text-sm font-medium mb-2">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                id="email"
                value={user.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-slate-200 border border-slate-300 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || uploadingAvatar} className="bg-gradient-to-r from-blue-500 to-sky-500 text-white">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditClientProfileForm;