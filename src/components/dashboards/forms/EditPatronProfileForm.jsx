import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, DollarSign, MapPin, FileText, Phone, Calendar, Clock, Sun, Moon, Sunset, CalendarDays, Anchor, Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AvailabilityManager from '@/components/dashboards/common/AvailabilityManager';

const defaultTimeSlots = [
  { id: 'morning', name: 'Medio día (mañana)', time: '10:00-14:00', enabled: false, price: 0 },
  { id: 'afternoon', name: 'Medio día (tarde)', time: '15:00-19:00', enabled: false, price: 0 },
  { id: 'full_day', name: 'Día completo', time: '10:00-18:00', enabled: false, price: 0 },
  { id: 'daycharter', name: 'Daycharter', time: '10:00-20:00', enabled: false, price: 0 },
  { id: 'sunset', name: 'Atardecer', time: '19:00-21:00', enabled: false, price: 0 },
  { id: 'week', name: 'Semana Completa', time: 'Sábado a Sábado', enabled: false, price: 0 },
];

const EditPatronProfileForm = ({ user, onClose, onSave }) => {
  const [locations, setLocations] = useState([]);
  const [ports, setPorts] = useState([]);
  const [selectedPorts, setSelectedPorts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    experience: user.experience || '',
    licenses: user.licenses?.join(', ') || '',
    languages: user.languages?.join(', ') || '',
    phone: user.phone || '',
    avatar_url: user.avatar_url || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || null);
  const fileInputRef = useRef(null);

  const [timeSlots, setTimeSlots] = useState(() => {
    if (user.available_slots && Array.isArray(user.available_slots) && user.available_slots.length > 0) {
      return defaultTimeSlots.map(defaultSlot => {
        const savedSlot = user.available_slots.find(s => s.id === defaultSlot.id);
        return savedSlot ? { ...defaultSlot, ...savedSlot } : defaultSlot;
      });
    }
    return defaultTimeSlots.map(slot => {
      let price = 0;
      if (slot.id === 'full_day') price = user.price_per_day || 0;
      if (slot.id === 'week') price = user.price_week || 0;
      if (['morning', 'afternoon', 'sunset', 'daycharter'].includes(slot.id)) price = user.price_half_day || 0;
      return { ...slot, price, enabled: price > 0 };
    });
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocationsAndPorts = async () => {
      const { data: locationsData, error: locationsError } = await supabase.from('locations').select('*');
      if (locationsError) console.error(locationsError);
      else {
        setLocations(locationsData);
        if (locationsData.length > 0) {
          setSelectedLocation(locationsData[0].id);
        }
      }

      const { data: portsData, error: portsError } = await supabase.from('ports').select('*, location:locations(id, name)');
      if (portsError) console.error(portsError); else setPorts(portsData);

      const { data: profilePortsData, error: profilePortsError } = await supabase.from('profile_ports').select('port_id').eq('profile_id', user.id);
      if (!profilePortsError) {
        setSelectedPorts(profilePortsData.map(p => p.port_id));
      }
    };
    fetchLocationsAndPorts();
  }, [user.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePortSelection = (portId) => {
    setSelectedPorts(prev => 
      prev.includes(portId) ? prev.filter(id => id !== portId) : [...prev, portId]
    );
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleTimeSlotChange = (id, field, value) => {
    setTimeSlots(prevSlots => prevSlots.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let avatarUrl = formData.avatar_url;
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `avatars/${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('boat-images').upload(filePath, avatarFile);
      if (uploadError) {
        toast({ variant: "destructive", title: "Error de subida", description: "No se pudo subir tu imagen de perfil." });
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('boat-images').getPublicUrl(filePath);
      avatarUrl = urlData.publicUrl;
    }

    const { licenses, languages, ...rest } = formData;
    const enabledSlots = timeSlots.filter(slot => slot.enabled);
    const updateData = {
      ...rest,
      avatar_url: avatarUrl,
      licenses: licenses.split(',').map(item => item.trim()).filter(Boolean),
      languages: languages.split(',').map(item => item.trim()).filter(Boolean),
      available_slots: enabledSlots,
      price_per_day: enabledSlots.find(s => s.id === 'full_day')?.price || 0,
      price_half_day: enabledSlots.find(s => s.id === 'morning')?.price || 0,
      price_week: enabledSlots.find(s => s.id === 'week')?.price || 0,
      status: 'pending',
      rejection_reason: null,
    };

    const { error: profileError } = await supabase.from('profiles').update(updateData).eq('id', user.id);
    if (profileError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar tu perfil." });
      setLoading(false);
      return;
    }

    const { error: deletePortsError } = await supabase.from('profile_ports').delete().eq('profile_id', user.id);
    if (deletePortsError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron actualizar los puertos." });
      setLoading(false);
      return;
    }

    if (selectedPorts.length > 0) {
      const portsToInsert = selectedPorts.map(port_id => ({ profile_id: user.id, port_id }));
      const { error: insertPortsError } = await supabase.from('profile_ports').insert(portsToInsert);
      if (insertPortsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron guardar los nuevos puertos." });
        setLoading(false);
        return;
      }
    }

    toast({ title: "Éxito", description: "Perfil actualizado. Pendiente de revisión por un administrador." });
    onSave();
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

  const getSlotIcon = (slotId) => {
    switch(slotId) {
      case 'morning': return <Sun className="mr-2" size={20}/>;
      case 'afternoon': return <Moon className="mr-2" size={20}/>;
      case 'full_day': return <Clock className="mr-2" size={20}/>;
      case 'daycharter': return <Anchor className="mr-2" size={20}/>;
      case 'sunset': return <Sunset className="mr-2" size={20}/>;
      case 'week': return <CalendarDays className="mr-2" size={20}/>;
      default: return <Clock className="mr-2" size={20}/>;
    }
  };

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
        className="bg-white rounded-2xl p-8 w-full max-w-3xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Editar Perfil de Patrón</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-slate-200" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                  <ImageIcon className="text-slate-400" size={40} />
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-all">
                <Upload size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>
            <div className="flex-grow">
              {renderInput('full_name', 'Nombre Completo', 'Tu nombre', User)}
            </div>
          </div>
          <p className="text-xs text-yellow-600 -mt-4 ml-32">⚠️ No subas archivos pesados, el sistema los comprimirá automáticamente para optimizar espacio y velocidad.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('phone', 'Teléfono', 'Tu número de contacto', Phone)}
          </div>
          
          <div>
            <Label className="block text-slate-700 text-sm font-medium mb-2">Puertos de Operación</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location-select" className="text-slate-600 text-xs font-medium">1. Selecciona una isla</Label>
                <div className="relative mt-1">
                  <select
                    id="location-select"
                    value={selectedLocation || ''}
                    onChange={(e) => setSelectedLocation(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>
              <div>
                <Label className="text-slate-600 text-xs font-medium">2. Selecciona los puertos</Label>
                <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-40 overflow-y-auto">
                  {selectedLocation ? (
                    <div className="grid grid-cols-1 gap-2">
                      {ports.filter(p => p.location.id === selectedLocation).map(port => (
                        <div key={port.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`port-${port.id}`}
                            checked={selectedPorts.includes(port.id)}
                            onCheckedChange={() => handlePortSelection(port.id)}
                          />
                          <Label htmlFor={`port-${port.id}`} className="text-sm font-normal text-slate-800 cursor-pointer">{port.name}</Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center">Selecciona una isla primero</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {renderInput('experience', 'Experiencia', 'Ej: 10 años en el Mediterráneo', FileText)}
          {renderInput('licenses', 'Licencias (separadas por coma)', 'Ej: PPER, Capitán de Yate', FileText)}
          {renderInput('languages', 'Idiomas (separados por coma)', 'Ej: Español, Inglés', FileText)}
          
          <div>
            <Label className="flex items-center text-slate-700 text-sm font-medium mb-3"><DollarSign className="mr-2" size={16}/>Tarifas por Tramo</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeSlots.map(slot => (
                <div key={slot.id} className={`p-4 rounded-lg border-2 transition-all ${slot.enabled ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox id={`slot-enabled-${slot.id}`} checked={slot.enabled} onCheckedChange={(checked) => handleTimeSlotChange(slot.id, 'enabled', checked)} />
                      <div className="flex items-center">
                        {getSlotIcon(slot.id)}
                        <Label htmlFor={`slot-enabled-${slot.id}`} className="font-medium text-slate-800">{slot.name}</Label>
                      </div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {slot.enabled && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-2">
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="number" 
                            value={slot.price} 
                            onChange={(e) => handleTimeSlotChange(slot.id, 'price', parseFloat(e.target.value) || 0)} 
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Precio"
                          />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            value={slot.time} 
                            onChange={(e) => handleTimeSlotChange(slot.id, 'time', e.target.value)} 
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Horario (ej. 10:00-18:00)"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
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

export default EditPatronProfileForm;