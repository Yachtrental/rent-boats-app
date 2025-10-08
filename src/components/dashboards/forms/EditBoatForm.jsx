import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Anchor, MapPin, Users, DollarSign, FileText, Check, Plus, Trash2, Image as ImageIcon, Upload, Shield, Star, Sun, Moon, Sunset, CalendarDays, Clock, Wind, Compass, LifeBuoy, Refrigerator, Tv, Wifi, Sailboat, ChevronDown, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const defaultTimeSlots = [
  { id: 'morning', name: 'Medio día (mañana)', time: '10:00-14:00', enabled: false, price: 0 },
  { id: 'afternoon', name: 'Medio día (tarde)', time: '15:00-19:00', enabled: false, price: 0 },
  { id: 'full_day', name: 'Día completo', time: '10:00-18:00', enabled: false, price: 0 },
  { id: 'daycharter', name: 'Daycharter', time: '10:00-20:00', enabled: false, price: 0 },
  { id: 'sunset', name: 'Atardecer', time: '19:00-21:00', enabled: false, price: 0 },
  { id: 'week', name: 'Semana Completa', time: 'Sábado a Sábado', enabled: false, price: 0 },
];

const boatFeaturesList = [
  { id: 'gps', name: 'GPS', icon: Compass },
  { id: 'autopilot', name: 'Piloto automático', icon: Wind },
  { id: 'lifesaving', name: 'Chalecos salvavidas', icon: LifeBuoy },
  { id: 'kitchen', name: 'Cocina', icon: Refrigerator },
  { id: 'tv', name: 'TV', icon: Tv },
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'air_conditioning', name: 'Aire acondicionado', icon: Wind },
];

const EditBoatForm = ({ boat, users, onClose, onSave, isAdmin }) => {
  const [locations, setLocations] = useState([]);
  const [ports, setPorts] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');

  const [formData, setFormData] = useState({
    name: boat?.name || '',
    type: boat?.type || '',
    port_id: boat?.port_id || null,
    capacity: boat?.capacity || 2,
    price: boat?.price || 0,
    description: boat?.description || '',
    needs_patron: boat?.needs_patron || false,
    deposit: boat?.deposit || 0,
    cabins: boat?.cabins || 0,
    bathrooms: boat?.bathrooms || 0,
    features: boat?.features || [],
    length: boat?.length || null,
    beam: boat?.beam || null,
    draft: boat?.draft || null,
    navigation_area: boat?.navigation_area || '',
    year: boat?.year || null,
    owner_id: boat?.owner_id || null,
  });
  const [timeSlots, setTimeSlots] = useState(() => {
    if (boat?.available_slots && Array.isArray(boat.available_slots) && boat.available_slots.length > 0) {
      return defaultTimeSlots.map(defaultSlot => {
        const savedSlot = boat.available_slots.find(s => s.id === defaultSlot.id);
        return savedSlot ? { ...defaultSlot, ...savedSlot } : defaultSlot;
      });
    }
    return defaultTimeSlots.map(slot => ({ ...slot, price: boat?.price || 0, enabled: (boat?.price || 0) > 0 }));
  });
  const [images, setImages] = useState(boat?.boat_images || []);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLocations = async () => {
      const { data: locationsData, error: locationsError } = await supabase.from('locations').select('*');
      if (locationsError) console.error(locationsError); else setLocations(locationsData);

      const { data: portsData, error: portsError } = await supabase.from('ports').select('*');
      if (portsError) console.error(portsError); else setPorts(portsData);

      if (boat?.port_id) {
        const { data: portData, error: portError } = await supabase.from('ports').select('location_id').eq('id', boat.port_id).single();
        if (!portError && portData) {
          setSelectedLocationId(portData.location_id);
        }
      }
    };
    fetchLocations();
  }, [boat?.port_id]);

  const availablePorts = useMemo(() => {
    if (!selectedLocationId) return [];
    return ports.filter(p => p.location_id === selectedLocationId);
  }, [ports, selectedLocationId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? (value ? parseFloat(value) : null) : value) }));
  };

  const handleLocationChange = (e) => {
    const locId = parseInt(e.target.value);
    setSelectedLocationId(locId);
    setFormData(prev => ({ ...prev, port_id: null }));
  };

  const handleFeatureChange = (featureId) => {
    setFormData(prev => {
      const currentFeatures = prev.features || [];
      const newFeatures = currentFeatures.includes(featureId)
        ? currentFeatures.filter(f => f !== featureId)
        : [...currentFeatures, featureId];
      return { ...prev, features: newFeatures };
    });
  };

  const handleTimeSlotChange = (id, field, value) => {
    setTimeSlots(prevSlots => prevSlots.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
  };

  const handleImageUpload = async (e, boatId) => {
    const file = e.target.files[0];
    if (!file || !boatId) return;
    const fileName = `${boatId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('boat-images').upload(fileName, file);
    if (error) {
      toast({ variant: "destructive", title: "Error de subida", description: error.message });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('boat-images').getPublicUrl(fileName);
      const { data: newImage, error: insertError } = await supabase.from('boat_images').insert({ boat_id: boatId, image_url: publicUrl, is_main: images.length === 0 }).select().single();
      if (insertError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la imagen en la base de datos." });
      } else {
        setImages([...images, newImage]);
        toast({ title: "Éxito", description: "Imagen subida correctamente." });
      }
    }
  };

  const handleSetMainImage = async (imageId) => {
    const { error } = await supabase.from('boat_images').update({ is_main: true }).eq('id', imageId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo establecer la imagen principal." });
    } else {
      setImages(images.map(img => ({ ...img, is_main: img.id === imageId })));
      toast({ title: "Éxito", description: "Imagen principal actualizada." });
    }
  };

  const handleDeleteImage = async (imageId, imageUrl) => {
    const path = new URL(imageUrl).pathname.split('/boat-images/')[1];
    const { error: storageError } = await supabase.storage.from('boat-images').remove([path]);
    if (storageError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el archivo de imagen." });
      return;
    }
    const { error: dbError } = await supabase.from('boat_images').delete().eq('id', imageId);
    if (dbError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar la referencia de la imagen." });
    } else {
      setImages(images.filter(img => img.id !== imageId));
      toast({ title: "Éxito", description: "Imagen eliminada." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isAdmin && !formData.owner_id) {
      toast({ variant: "destructive", title: "Error de validación", description: "Debes asignar un armador a la embarcación." });
      setLoading(false);
      return;
    }

    const enabledSlots = timeSlots.filter(slot => slot.enabled);
    if (enabledSlots.length === 0) {
      toast({ variant: "destructive", title: "Error de validación", description: "Debes habilitar y poner precio al menos a una franja horaria." });
      setLoading(false);
      return;
    }
    
    const updateData = { ...formData, available_slots: enabledSlots, location: locations.find(l => l.id === selectedLocationId)?.name || '' };
    
    if (!isAdmin) {
      updateData.status = 'pending';
      updateData.rejection_reason = null;
    } else {
      updateData.status = 'active'; // Admin can directly activate
    }

    if (boat?.id) {
      const { error } = await supabase.from('boats').update(updateData).eq('id', boat.id);
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la embarcación." });
      } else {
        toast({ title: "Éxito", description: "Embarcación actualizada." });
        onSave();
      }
    } else {
      // Create new boat
      const { data: newBoat, error } = await supabase.from('boats').insert(updateData).select().single();
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo crear la embarcación." });
      } else {
        toast({ title: "Éxito", description: "Embarcación creada. Ahora puedes añadir imágenes." });
        onSave(newBoat); // Pass new boat to parent to handle state
      }
    }

    setLoading(false);
  };

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
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-4xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{boat?.id ? 'Editar' : 'Crear'} Embarcación</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isAdmin && (
            <div>
              <Label htmlFor="owner_id" className="block text-slate-700 text-sm font-medium mb-2">Armador (Propietario)</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select id="owner_id" name="owner_id" value={formData.owner_id || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Selecciona un armador</option>
                  {users?.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('name', 'Nombre', 'Ej: La Perla Negra', Anchor)}
            {renderInput('type', 'Tipo', 'Ej: Velero', Anchor)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="location" className="block text-slate-700 text-sm font-medium mb-2">Isla</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select id="location" name="location" value={selectedLocationId} onChange={handleLocationChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Selecciona una isla</option>
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
            <div>
              <Label htmlFor="port_id" className="block text-slate-700 text-sm font-medium mb-2">Puerto Base</Label>
              <div className="relative">
                <Anchor className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select id="port_id" name="port_id" value={formData.port_id || ''} onChange={handleInputChange} disabled={!selectedLocationId} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="">Selecciona un puerto</option>
                  {availablePorts.map(port => <option key={port.id} value={port.id}>{port.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('capacity', 'Capacidad', 'Ej: 8', Users, 'number')}
            {renderInput('price', 'Precio por Día (Referencia)', 'Ej: 500', DollarSign, 'number')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {renderInput('length', 'Eslora (m)', 'Ej: 12', Sailboat, 'number')}
            {renderInput('beam', 'Manga (m)', 'Ej: 4', Sailboat, 'number')}
            {renderInput('draft', 'Calado (m)', 'Ej: 2', Sailboat, 'number')}
            {renderInput('year', 'Año', 'Ej: 2020', CalendarDays, 'number')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('cabins', 'Camarotes', 'Ej: 2', Users, 'number')}
            {renderInput('bathrooms', 'Baños', 'Ej: 1', Users, 'number')}
          </div>
          <div>
            <Label htmlFor="description" className="block text-slate-700 text-sm font-medium mb-2">Descripción</Label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe tu embarcación..."></textarea>
          </div>
          <div>
            <Label htmlFor="navigation_area" className="block text-slate-700 text-sm font-medium mb-2">Zona de Navegación</Label>
            <textarea id="navigation_area" name="navigation_area" value={formData.navigation_area} onChange={handleInputChange} rows="2" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Ibiza y Formentera, aguas costeras..."></textarea>
          </div>
          <div>
            <Label className="block text-slate-700 text-sm font-medium mb-2">Equipamiento y Características</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              {boatFeaturesList.map(feature => (
                <div key={feature.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`feature-${feature.id}`}
                    checked={(formData.features || []).includes(feature.id)}
                    onCheckedChange={() => handleFeatureChange(feature.id)}
                  />
                  <div className="flex items-center gap-2">
                    <feature.icon size={18} className="text-slate-600" />
                    <Label htmlFor={`feature-${feature.id}`} className="text-sm font-medium text-slate-800 cursor-pointer">
                      {feature.name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Checkbox id="needs_patron" name="needs_patron" checked={formData.needs_patron} onCheckedChange={(checked) => setFormData(p => ({...p, needs_patron: checked}))} />
              <Label htmlFor="needs_patron" className="text-sm font-medium text-slate-800">Requiere Patrón Obligatoriamente</Label>
            </div>
            <div>
              {renderInput('deposit', 'Fianza (€)', 'Ej: 500', Shield, 'number')}
              <p className="text-xs text-slate-500 mt-1">El depósito lo cobra el armador al embarcar, no se suma al total de la reserva.</p>
            </div>
          </div>
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
                          <input type="number" value={slot.price} onChange={(e) => handleTimeSlotChange(slot.id, 'price', parseFloat(e.target.value) || 0)} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Precio" />
                        </div>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="text" value={slot.time} onChange={(e) => handleTimeSlotChange(slot.id, 'time', e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Horario (ej. 10:00-18:00)" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
          {boat?.id && (
            <div>
              <Label className="flex items-center text-slate-700 text-sm font-medium mb-3"><ImageIcon className="mr-2" size={16}/>Imágenes</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map(img => (
                  <div key={img.id} className="relative group">
                    <img src={img.image_url} alt="Embarcación" className="w-full h-32 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button type="button" size="icon" variant="destructive" className="h-8 w-8 mr-1" onClick={() => handleDeleteImage(img.id, img.image_url)}><Trash2 size={16} /></Button>
                      {!img.is_main && <Button type="button" size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600" onClick={() => handleSetMainImage(img.id)}><Star size={16} /></Button>}
                    </div>
                    {img.is_main && <div className="absolute top-2 right-2 bg-yellow-400 text-white p-1 rounded-full"><Star size={12} /></div>}
                  </div>
                ))}
                <label className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                  <Upload size={24} className="text-slate-400" />
                  <span className="text-sm text-slate-500 mt-2">Subir imagen</span>
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, boat.id)} accept="image/*" />
                </label>
              </div>
              <p className="text-xs text-yellow-600 mt-2">⚠️ No subas archivos pesados, el sistema los comprimirá automáticamente para optimizar espacio y velocidad.</p>
            </div>
          )}
          
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

export default EditBoatForm;