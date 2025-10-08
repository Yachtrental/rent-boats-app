import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Briefcase, FileText, DollarSign, MapPin, Image as ImageIcon, Upload, User, Anchor, ChevronDown, Clock, CalendarDays, Users as UsersIcon, Hourglass, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const EditServiceForm = ({ service, users, onClose, onSave, isAdmin }) => {
  const [locations, setLocations] = useState([]);
  const [ports, setPorts] = useState([]);
  const [selectedPorts, setSelectedPorts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [availableDays, setAvailableDays] = useState(service?.available_days || []);

  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    type: service?.type || 'catering',
    image_url: service?.image_url || '',
    provider_id: service?.provider_id || null,
    status: service?.status || 'pending',
    start_time: service?.start_time || '09:00',
    end_time: service?.end_time || '18:00',
    pricing_model: service?.pricing_model || 'fixed',
    min_units: service?.min_units || 1,
    max_units: service?.max_units || null,
    max_capacity: service?.max_capacity || null,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const weekDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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

      if (service?.id) {
        const { data: servicePortsData, error: servicePortsError } = await supabase.from('service_ports').select('port_id').eq('service_id', service.id);
        if (!servicePortsError) {
          setSelectedPorts(servicePortsData.map(p => p.port_id));
        }
      }
    };
    fetchLocationsAndPorts();
  }, [service?.id]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value ? parseFloat(value) : null) : value }));
  };

  const handlePortSelection = (portId) => {
    setSelectedPorts(prev => 
      prev.includes(portId) ? prev.filter(id => id !== portId) : [...prev, portId]
    );
  };

  const handleDaySelection = (day) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileName = `services/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('boat-images').upload(fileName, file);
    if (error) {
      toast({ variant: "destructive", title: "Error de subida", description: error.message });
    } else {
      const { data } = supabase.storage.from('boat-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: "Éxito", description: "Imagen subida correctamente." });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isAdmin && !formData.provider_id) {
      toast({ variant: "destructive", title: "Error de validación", description: "Debes asignar un proveedor al servicio." });
      setLoading(false);
      return;
    }

    let savedServiceId = service?.id;
    let error;

    const serviceData = { ...formData, available_days: availableDays };
    
    if (!isAdmin) {
      serviceData.status = 'pending';
      serviceData.rejection_reason = null;
    } else {
      serviceData.status = 'active';
    }

    if (service?.id) {
      ({ error } = await supabase.from('services').update(serviceData).eq('id', service.id));
    } else {
      const { data, error: insertError } = await supabase.from('services').insert(serviceData).select().single();
      if (insertError) {
        error = insertError;
      } else {
        savedServiceId = data.id;
      }
    }

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el servicio." });
      setLoading(false);
      return;
    }

    if (savedServiceId) {
      const { error: deletePortsError } = await supabase.from('service_ports').delete().eq('service_id', savedServiceId);
      if (deletePortsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron actualizar los puertos." });
        setLoading(false);
        return;
      }

      if (selectedPorts.length > 0) {
        const portsToInsert = selectedPorts.map(port_id => ({ service_id: savedServiceId, port_id }));
        const { error: insertPortsError } = await supabase.from('service_ports').insert(portsToInsert);
        if (insertPortsError) {
          toast({ variant: "destructive", title: "Error", description: "No se pudieron guardar los nuevos puertos." });
          setLoading(false);
          return;
        }
      }
    }

    toast({ title: "Éxito", description: `Servicio ${service?.id ? 'actualizado' : 'creado'}.` });
    onSave();
    setLoading(false);
  };

  const renderInput = (name, label, placeholder, Icon, type = "text", step = "any") => (
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
          step={step}
          className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  const getPricingUnitLabel = () => {
    switch (formData.pricing_model) {
      case 'per_hour': return 'por Hora';
      case 'per_person': return 'por Persona';
      case 'per_day': return 'por Día';
      case 'per_week': return 'por Semana';
      default: return 'Fijo';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-4xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{service?.id ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isAdmin && (
            <div>
              <Label htmlFor="provider_id" className="block text-slate-700 text-sm font-medium mb-2">Proveedor</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select id="provider_id" name="provider_id" value={formData.provider_id || ''} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="">Selecciona un proveedor</option>
                  {users?.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('name', 'Nombre del Servicio', 'Ej: Catering Premium', Briefcase)}
            <div>
              <Label htmlFor="type" className="block text-slate-700 text-sm font-medium mb-2">Tipo de Servicio</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select id="type" name="type" value={formData.type} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="catering">Catering</option>
                  <option value="cleaning">Limpieza</option>
                  <option value="transport">Transporte</option>
                  <option value="dj">DJ</option>
                  <option value="activity_monitor">Monitor de Actividad</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="block text-slate-700 text-sm font-medium mb-2">Descripción</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-5 transform -translate-y-1/2 text-slate-400" size={20} />
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe el servicio en detalle..."></textarea>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800">Configuración de Precios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="pricing_model" className="block text-slate-700 text-sm font-medium mb-2">Modelo de Contratación</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <select id="pricing_model" name="pricing_model" value={formData.pricing_model} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                    <option value="fixed">Precio Fijo (por servicio)</option>
                    <option value="per_hour">Precio por Hora</option>
                    <option value="per_person">Precio por Persona</option>
                    <option value="per_day">Precio por Día</option>
                    <option value="per_week">Precio por Semana</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
              {renderInput('price', `Precio ${getPricingUnitLabel()} (€)`, 'Ej: 50', DollarSign, 'number')}
            </div>
            {formData.pricing_model !== 'fixed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderInput('min_units', `Mínimo de ${formData.pricing_model === 'per_hour' ? 'Horas' : 'Personas/Días/Semanas'}`, 'Ej: 2', Hash, 'number')}
                {renderInput('max_units', `Máximo de ${formData.pricing_model === 'per_hour' ? 'Horas' : 'Personas/Días/Semanas'} (opcional)`, 'Ej: 8', Hash, 'number')}
              </div>
            )}
            {renderInput('max_capacity', 'Capacidad Máxima Total (opcional)', 'Ej: 20', UsersIcon, 'number')}
          </div>

          <div>
            <Label className="block text-slate-700 text-sm font-medium mb-2">Disponibilidad</Label>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-600 text-xs font-medium">Días de la semana</Label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {weekDays.map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox id={`day-${day}`} checked={availableDays.includes(day)} onCheckedChange={() => handleDaySelection(day)} />
                        <Label htmlFor={`day-${day}`} className="text-sm font-normal text-slate-800 cursor-pointer">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {renderInput('start_time', 'Desde', '', Clock, 'time')}
                  {renderInput('end_time', 'Hasta', '', Clock, 'time')}
                </div>
              </div>
            </div>
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

          <div>
            <Label className="block text-slate-700 text-sm font-medium mb-2">Imagen del Servicio</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                {formData.image_url ? <img src={formData.image_url} alt="Servicio" className="w-full h-full object-cover rounded-lg" /> : <ImageIcon className="text-slate-400" size={32} />}
              </div>
              <label className="cursor-pointer bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Upload size={16} className="inline mr-2" />
                Subir Imagen
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-yellow-600 mt-2">⚠️ No subas archivos pesados, el sistema los comprimirá automáticamente para optimizar espacio y velocidad.</p>
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

export default EditServiceForm;