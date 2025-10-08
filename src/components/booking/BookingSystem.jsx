import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ArrowLeft, Star, CheckCircle, AlertTriangle, Clock, Sun, Moon, Sunset, CalendarDays, Minus, Plus, Shield, Package, Anchor, MapPin, BedDouble, Bath, Wind, Compass, LifeBuoy, Refrigerator, Tv, Wifi, ChevronLeft, ChevronRight, Sailboat, ChevronDown, User, FileText, Languages, X, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';

const featureIcons = {
  gps: { icon: Compass, name: 'GPS' },
  autopilot: { icon: Wind, name: 'Piloto automático' },
  lifesaving: { icon: LifeBuoy, name: 'Chalecos salvavidas' },
  kitchen: { icon: Refrigerator, name: 'Cocina' },
  tv: { icon: Tv, name: 'TV' },
  wifi: { icon: Wifi, name: 'Wi-Fi' },
  air_conditioning: { icon: Wind, name: 'Aire Acondicionado' },
};

const PatronProfileModal = ({ patron, onClose }) => {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('patron_reviews')
        .select('*, client:profiles(full_name, avatar_url)')
        .eq('patron_id', patron.id)
        .order('created_at', { ascending: false });
      if (!error) setReviews(data);
    };
    fetchReviews();
  }, [patron.id]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img src={patron.avatar_url || `https://ui-avatars.com/api/?name=${patron.full_name}&background=0284c7&color=fff`} alt={patron.full_name} className="w-24 h-24 rounded-full object-cover border-4 border-sky-200" />
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{patron.full_name}</h2>
              <div className="flex items-center text-slate-500 mt-1">
                <Star size={16} className="mr-1 text-yellow-400 fill-current" /> {patron.rating || 'N/A'}
                <span className="mx-2">|</span>
                <MapPin size={16} className="mr-1" /> {patron.location}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={24} /></Button>
        </div>
        <div className="border-t border-slate-200 my-6"></div>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Experiencia</h3>
            <p className="text-slate-600">{patron.experience || 'No especificada.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2 flex items-center"><FileText size={18} className="mr-2"/>Licencias</h3>
              <ul className="list-disc list-inside text-slate-600">
                {patron.licenses?.map(l => <li key={l}>{l}</li>) || <li>No especificadas.</li>}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2 flex items-center"><Languages size={18} className="mr-2"/>Idiomas</h3>
              <ul className="list-disc list-inside text-slate-600">
                {patron.languages?.map(l => <li key={l}>{l}</li>) || <li>No especificados.</li>}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Valoraciones de Clientes</h3>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg">
                    <img src={review.client.avatar_url || `https://ui-avatars.com/api/?name=${review.client.full_name}&background=e2e8f0&color=334155`} alt={review.client.full_name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{review.client.full_name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'} />)}
                      </div>
                      <p className="text-slate-600 text-sm mt-1">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500">Aún no hay valoraciones para este patrón.</p>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


const BookingSystem = ({ user, item, onViewChange }) => {
  const [step, setStep] = useState(1);
  const [patrons, setPatrons] = useState([]);
  const [extras, setExtras] = useState([]);
  const [services, setServices] = useState([]);
  const [ports, setPorts] = useState([]);
  
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [viewingPatron, setViewingPatron] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableSlots = item?.available_slots?.filter(s => s.enabled) || [];
  const isDailyBookingEnabled = availableSlots.some(s => s.id === 'full_day') || availableSlots.length === 0;
  const defaultBookingType = availableSlots.length > 0 ? 'slot' : 'days';

  const [bookingDetails, setBookingDetails] = useState({
    startDate: null,
    endDate: null,
    guests: 2,
    selectedSlotId: availableSlots.length > 0 ? availableSlots[0].id : null,
    bookingType: defaultBookingType,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const selectedSlot = availableSlots.find(s => s.id === bookingDetails.selectedSlotId);

  const fetchAvailabilities = useCallback(async (patronId, serviceProvidersIds) => {
    const providerIds = [item.owner_id];
    if (patronId) providerIds.push(patronId);
    if (serviceProvidersIds) providerIds.push(...serviceProvidersIds);

    const uniqueProviderIds = [...new Set(providerIds)];

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, availability')
      .in('id', uniqueProviderIds);

    const { data: boat, error: boatError } = await supabase
      .from('boats')
      .select('availability')
      .eq('id', item.id)
      .single();

    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('id, availability')
      .in('provider_id', uniqueProviderIds);

    if (profileError || boatError || servicesError) {
      console.error("Error fetching availabilities");
      return [];
    }

    let allUnavailable = [];
    if (boat?.availability) allUnavailable.push(...boat.availability);
    profiles.forEach(p => {
      if (p.availability) allUnavailable.push(...p.availability);
    });
    servicesData.forEach(s => {
      if (s.availability) allUnavailable.push(...s.availability);
    });

    return [...new Set(allUnavailable)];
  }, [item.id, item.owner_id]);

  useEffect(() => {
    if (!item) {
      toast({ variant: "destructive", title: "Error", description: "No se ha seleccionado ninguna embarcación." });
      onViewChange('marketplace');
      return;
    }

    const fetchOptions = async () => {
      setLoading(true);
      
      const { data: patronPortsData } = await supabase.from('profile_ports').select('profile_id').eq('port_id', item.port_id);
      const patronIds = patronPortsData ? patronPortsData.map(p => p.profile_id) : [];

      const fetchPatrons = supabase.from('profiles').select('*, availability').eq('role', 'patron').eq('status', 'active').in('id', patronIds);
      const fetchExtras = supabase.from('boat_extras').select('*, extra:extras(*)').eq('boat_id', item.id).eq('extra.is_visible_to_client', true);
      const fetchServices = supabase.from('services').select('*, provider:profiles(full_name), service_ports(ports(*, location:locations(*))), availability').eq('status', 'active');
      const fetchPorts = supabase.from('ports').select('*, location:locations(*)');

      const [
        { data: patronsData, error: patronsError },
        { data: extrasData, error: extrasError },
        { data: servicesData, error: servicesError },
        { data: portsData, error: portsError }
      ] = await Promise.all([fetchPatrons, fetchExtras, fetchServices, fetchPorts]);

      if (patronsError || extrasError || servicesError || portsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las opciones de reserva." });
      } else {
        setPatrons(patronsData || []);
        setExtras(extrasData || []);
        setServices(servicesData || []);
        setPorts(portsData || []);
        
        const initialExtras = (extrasData || [])
          .filter(e => e.included || e.is_obligatory)
          .map(e => ({ ...e, quantity: 1 }));
        setSelectedExtras(initialExtras);
      }
      setLoading(false);
    };
    fetchOptions();
  }, [item, toast, onViewChange]);

  useEffect(() => {
    const serviceProvidersIds = selectedServices.map(s => s.provider_id);
    fetchAvailabilities(selectedPatron?.id, serviceProvidersIds).then(dates => {
      setUnavailableDates(dates);
    });
  }, [selectedPatron, selectedServices, fetchAvailabilities]);

  const isDateUnavailable = (date) => {
    if (!date) return false;
    const dateString = new Date(date).toISOString().split('T')[0];
    return unavailableDates.includes(dateString);
  };

  const handleSlotSelection = (slotId) => {
    setBookingDetails(prev => ({
      ...prev,
      selectedSlotId: slotId,
      startDate: null,
      endDate: null,
      bookingType: 'slot',
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (isDateUnavailable(value)) {
      toast({ variant: "destructive", title: "Fecha no disponible", description: "El proveedor no está disponible en esta fecha." });
      return;
    }
    const date = new Date(value);
    date.setHours(0,0,0,0);
    if (date < today) {
      toast({ variant: "destructive", title: "Fecha inválida", description: "No puedes seleccionar una fecha pasada." });
      return;
    }

    if (name === 'startDate') {
      setBookingDetails(prev => ({
        ...prev,
        startDate: value,
        endDate: prev.endDate && new Date(prev.endDate) < new Date(value) ? value : prev.endDate,
      }));
    } else {
      setBookingDetails(prev => ({ ...prev, endDate: value }));
    }
  };

  const handleExtraSelection = (extra) => {
    if (extra.included || extra.is_obligatory) return;
    const isSelected = selectedExtras.some(e => e.extra_id === extra.extra_id);
    if (isSelected) {
      setSelectedExtras(selectedExtras.filter(e => e.extra_id !== extra.extra_id));
    } else {
      setSelectedExtras([...selectedExtras, { ...extra, quantity: 1 }]);
    }
  };

  const handleExtraQuantityChange = (extraId, newQuantity) => {
    const extra = extras.find(e => e.extra_id === extraId);
    if (newQuantity < 1) {
      if (!extra.is_obligatory) {
        handleExtraSelection(selectedExtras.find(e => e.extra_id === extraId));
      }
      return;
    }
    if (extra.max_units && newQuantity > extra.max_units) {
      toast({ variant: "destructive", title: "Límite alcanzado", description: `Solo hay ${extra.max_units} unidades disponibles.` });
      return;
    }
    setSelectedExtras(selectedExtras.map(e => e.extra_id === extraId ? { ...e, quantity: newQuantity } : e));
  };

  const handleServiceSelection = (service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      const defaultDate = bookingDetails.startDate || today.toISOString().split('T')[0];
      const firstAvailablePort = service.service_ports?.[0]?.ports;
      const defaultLocationId = firstAvailablePort?.location?.id || null;
      const defaultPortId = firstAvailablePort?.id || null;
      
      setSelectedServices([...selectedServices, { 
        ...service, 
        date: defaultDate, 
        time: '10:00', 
        location_id: defaultLocationId,
        port_id: defaultPortId,
        quantity: service.min_units || 1,
      }]);
    }
  };

  const handleServiceDetailChange = (serviceId, field, value) => {
    setSelectedServices(selectedServices.map(s => {
      if (s.id === serviceId) {
        const updatedService = { ...s, [field]: value };
        if (field === 'quantity') {
          const newQuantity = parseInt(value, 10);
          const min = s.min_units || 1;
          const max = s.max_units;
          if (newQuantity >= min && (!max || newQuantity <= max)) {
            updatedService.quantity = newQuantity;
          } else if (newQuantity < min) {
            updatedService.quantity = min;
          } else if (max && newQuantity > max) {
            updatedService.quantity = max;
          }
        }
        if (field === 'location_id') {
          updatedService.port_id = null;
        }
        return updatedService;
      }
      return s;
    }));
  };

  const handleBooking = async () => {
    const total_price = calculateTotal();
    const start_date = new Date(bookingDetails.startDate);
    const end_date = new Date(bookingDetails.endDate || bookingDetails.startDate);
    
    if (bookingDetails.bookingType === 'slot' && selectedSlot?.time) {
        const timeParts = selectedSlot.time.split('-');
        if (timeParts.length === 2) {
            const [startHour, startMinute] = timeParts[0].split(':');
            start_date.setHours(parseInt(startHour, 10), parseInt(startMinute, 10));
            const [endHour, endMinute] = timeParts[1].split(':');
            end_date.setHours(parseInt(endHour, 10), parseInt(endMinute, 10));
        }
    } else {
      start_date.setHours(10, 0); // Default start time for daily booking
      end_date.setHours(18, 0); // Default end time for daily booking
    }

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        boat_id: item.id,
        patron_id: selectedPatron?.id,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        guests: bookingDetails.guests,
        total_price,
        status: 'pending_approval',
        selected_slot_id: selectedSlot?.id,
        selected_slot_name: bookingDetails.bookingType === 'days' ? `${calculateDays()} días` : selectedSlot?.name,
        location: item.port?.name || item.location,
      })
      .select().single();

    if (bookingError) {
      toast({ variant: "destructive", title: "Error de reserva", description: bookingError.message });
      return;
    }

    const bookingItems = [];

    bookingItems.push({
      booking_id: bookingData.id,
      item_type: 'boat',
      name: `${item.name} (${bookingDetails.bookingType === 'days' ? `${calculateDays()} días` : selectedSlot?.name})`,
      price: calculateBasePrice(),
      quantity: 1,
    });

    if (selectedPatron) {
      bookingItems.push({
        booking_id: bookingData.id,
        item_type: 'patron',
        name: `Patrón: ${selectedPatron.full_name}`,
        price: calculatePatronPrice(),
        quantity: 1,
      });
    }

    selectedExtras.forEach(extra => {
      if (extra.extra) {
        bookingItems.push({
          booking_id: bookingData.id,
          item_type: 'extra',
          extra_id: extra.extra_id,
          name: extra.extra.name,
          price: extra.included ? 0 : (extra.price_override || extra.extra.recommended_price || 0),
          quantity: extra.quantity,
        });
      }
    });

    selectedServices.forEach(s => {
      const serviceStartDate = new Date(`${s.date}T${s.time}`);
      const servicePort = ports.find(p => p.id === s.port_id);
      bookingItems.push({
        booking_id: bookingData.id,
        item_type: 'service',
        service_id: s.id,
        name: s.name,
        price: s.price,
        quantity: s.quantity,
        start_date: serviceStartDate.toISOString(),
        location: servicePort?.name || s.location,
      });
    });

    if (bookingItems.length > 0) {
      const { error: itemsError } = await supabase.from('booking_items').insert(bookingItems);
      if (itemsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron añadir los detalles de la reserva." });
        await supabase.from('bookings').delete().eq('id', bookingData.id);
        return;
      }
    }

    toast({ title: "¡Solicitud enviada!", description: "Tu reserva está pendiente de confirmación por el propietario y proveedores (24h)." });
    setStep(4);
  };

  const calculateDays = () => {
    if (!bookingDetails.startDate || !bookingDetails.endDate) return 0;
    const start = new Date(bookingDetails.startDate);
    const end = new Date(bookingDetails.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const getPriceForSlot = (provider, slotId) => {
    if (!provider || !provider.available_slots || !slotId) {
      return provider?.price_per_day || provider?.price || 0;
    }
    const slot = provider.available_slots.find(s => s.id === slotId);
    return slot?.price || provider.price_per_day || provider.price || 0;
  };

  const calculateBasePrice = () => {
    if (bookingDetails.bookingType === 'slot' && selectedSlot) {
      return selectedSlot.price || 0;
    } else if (bookingDetails.bookingType === 'days' && isDailyBookingEnabled) {
      const dailyPrice = availableSlots.find(s => s.id === 'full_day')?.price || item.price_full_day || item.price;
      return dailyPrice * calculateDays();
    }
    return 0;
  };

  const calculatePatronPrice = () => {
    if (!selectedPatron) return 0;
    const days = calculateDays();
    const patronPrice = bookingDetails.bookingType === 'slot' 
      ? getPriceForSlot(selectedPatron, bookingDetails.selectedSlotId)
      : (selectedPatron.price_per_day || 150);
    return patronPrice * (bookingDetails.bookingType === 'days' ? days : 1);
  };

  const calculateExtrasPrice = () => {
    let extrasTotal = 0;
    const days = calculateDays();
    selectedExtras.forEach(extra => {
      if (!extra.included && extra.extra) {
        const price = extra.price_override || extra.extra.recommended_price || 0;
        const pricingModel = extra.extra.pricing_model;
        let extraCost = 0;
        if (pricingModel === 'per_day' && bookingDetails.bookingType === 'days' && days > 0) {
          extraCost = price * days * extra.quantity;
        } else if (pricingModel === 'per_slot' && bookingDetails.bookingType === 'slot') {
          extraCost = price * extra.quantity;
        } else { // fixed, per_unit, etc.
          extraCost = price * extra.quantity;
        }
        extrasTotal += extraCost;
      }
    });
    return extrasTotal;
  };

  const calculateServicesPrice = () => {
    return selectedServices.reduce((acc, service) => {
      let servicePrice = service.price || 0;
      if (service.pricing_model !== 'fixed') {
        servicePrice *= service.quantity;
      }
      return acc + servicePrice;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateBasePrice() + calculatePatronPrice() + calculateExtrasPrice() + calculateServicesPrice();
  };

  const calculateTotalDeposit = () => {
    const boatDeposit = item.deposit || 0;
    const extrasDeposit = selectedExtras.reduce((acc, extra) => {
      if (extra.extra?.deposit_amount) {
        return acc + (extra.extra.deposit_amount * extra.quantity);
      }
      return acc;
    }, 0);
    return boatDeposit + extrasDeposit;
  };

  const totalDeposit = calculateTotalDeposit();

  const isPatronAvailable = (patron) => {
    if (bookingDetails.bookingType === 'days') return true;
    if (!selectedSlot) return true;
    return patron.available_slots?.some(s => s.id === selectedSlot.id && s.enabled);
  };

  const isServiceAvailable = (service) => {
    if (bookingDetails.bookingType === 'days') return true;
    if (!selectedSlot) return true;
    return service.available_slots?.some(s => s.id === selectedSlot.id && s.enabled);
  };

  const unitLabel = {
    per_hour: 'hora(s)',
    per_person: 'persona(s)',
    per_day: 'día(s)',
    per_week: 'semana(s)',
    fixed: 'servicio(s)',
  };

  const getServiceAvailableLocations = (service) => {
    if (!service || !service.service_ports) return [];
    const locationIds = new Set();
    const locations = [];
    service.service_ports.forEach(sp => {
      if (sp.ports && sp.ports.location && !locationIds.has(sp.ports.location.id)) {
        locationIds.add(sp.ports.location.id);
        locations.push(sp.ports.location);
      }
    });
    return locations;
  };

  const getServiceAvailablePorts = (service, locationId) => {
    if (!service || !service.service_ports || !locationId) return [];
    return service.service_ports
      .filter(sp => sp.ports && sp.ports.location_id === locationId)
      .map(sp => sp.ports);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!bookingDetails.startDate) {
        toast({ variant: "destructive", title: "Faltan datos", description: "Por favor, selecciona una fecha de inicio." });
        return;
      }
      if (bookingDetails.bookingType === 'days' && !bookingDetails.endDate) {
        toast({ variant: "destructive", title: "Faltan datos", description: "Por favor, selecciona una fecha de fin." });
        return;
      }
    }
    if (step === 2 && item.needs_patron && !selectedPatron) {
      toast({ variant: "destructive", title: "Patrón requerido", description: "Esta embarcación requiere un patrón. Por favor, selecciona uno." });
      return;
    }
    setStep(s => s + 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return null;
    }
  };

  const renderStep1 = () => (
    <>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Paso 1: Elige fechas y extras</h2>
      <div className="space-y-4">
        <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-100 mb-4">
          {availableSlots.length > 0 && <Button onClick={() => setBookingDetails(p => ({...p, bookingType: 'slot', startDate: null, endDate: null}))} className={`flex-1 ${bookingDetails.bookingType === 'slot' ? 'bg-white shadow' : 'bg-transparent text-slate-600'}`} variant="ghost">Por Tramos</Button>}
          {isDailyBookingEnabled && <Button onClick={() => setBookingDetails(p => ({...p, bookingType: 'days', selectedSlotId: null}))} className={`flex-1 ${bookingDetails.bookingType === 'days' ? 'bg-white shadow' : 'bg-transparent text-slate-600'}`} variant="ghost">Por Días</Button>}
        </div>

        {bookingDetails.bookingType === 'slot' ? (
          <div>
            <Label className="block text-slate-700 text-sm font-medium mb-2">Tramo Horario</Label>
            <div className="relative">
              <select value={bookingDetails.selectedSlotId || ''} onChange={(e) => handleSlotSelection(e.target.value)} className="w-full appearance-none p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {availableSlots.map(slot => <option key={slot.id} value={slot.id}>{slot.name} ({slot.time}) - €{slot.price}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-slate-700 text-sm font-medium mb-2">Fecha de inicio</Label>
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="date" name="startDate" value={bookingDetails.startDate || ''} min={today.toISOString().split('T')[0]} onChange={handleDateChange} className={`w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDateUnavailable(bookingDetails.startDate) ? 'bg-red-100' : ''}`} /></div>
            </div>
            <div>
              <Label className="block text-slate-700 text-sm font-medium mb-2">Fecha de fin</Label>
              <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="date" name="endDate" value={bookingDetails.endDate || ''} min={bookingDetails.startDate || today.toISOString().split('T')[0]} onChange={handleDateChange} className={`w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDateUnavailable(bookingDetails.endDate) ? 'bg-red-100' : ''}`} /></div>
            </div>
          </div>
        )}

        {(selectedSlot || (bookingDetails.bookingType === 'days' && bookingDetails.startDate)) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookingDetails.bookingType === 'slot' && (
              <div>
                <Label className="block text-slate-700 text-sm font-medium mb-2">Fecha</Label>
                <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="date" value={bookingDetails.startDate || ''} min={today.toISOString().split('T')[0]} onChange={(e) => { if (!isDateUnavailable(e.target.value)) setBookingDetails(p => ({...p, startDate: e.target.value, endDate: e.target.value})); else toast({variant: 'destructive', title: 'Fecha no disponible'}); }} className={`w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDateUnavailable(bookingDetails.startDate) ? 'bg-red-100' : ''}`} /></div>
              </div>
            )}
            <div>
              <Label className="block text-slate-700 text-sm font-medium mb-2">Invitados (Máx: {item.capacity})</Label>
              <div className="relative"><Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="number" value={bookingDetails.guests} min="1" max={item.capacity} onChange={(e) => setBookingDetails({...bookingDetails, guests: Math.min(item.capacity, parseInt(e.target.value) || 1)})} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            </div>
          </motion.div>
        )}
      </div>
      {extras.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Extras de la embarcación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {extras.map((extra) => {
              if (!extra.extra) return null;
              const isSelected = selectedExtras.some(e => e.extra_id === extra.extra_id);
              const currentExtra = selectedExtras.find(e => e.extra_id === extra.extra_id);
              const isDisabled = extra.included || extra.is_obligatory;
              return (
                <div key={extra.extra_id} className={`p-4 rounded-xl border-2 transition-all ${isSelected ? 'bg-sky-50 border-sky-400' : 'bg-slate-50 border-slate-200'} ${isDisabled ? 'opacity-70' : 'cursor-pointer hover:border-slate-400'}`} onClick={() => handleExtraSelection(extra)}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {extra.image_url ? <img src={extra.image_url} alt={extra.extra.name} className="w-10 h-10 object-cover rounded-md mr-3"/> : <Package className="w-10 h-10 text-slate-400 mr-3"/>}
                      <div>
                        <h3 className="text-slate-800 font-semibold text-sm">{extra.extra.name} {extra.is_obligatory && <span className="text-red-500 text-xs">(Obligatorio)</span>}</h3>
                        <span className="text-slate-800 font-bold">{extra.included ? 'Incluido' : `€${extra.price_override || extra.extra.recommended_price}`}</span>
                      </div>
                    </div>
                    {extra.extra.allow_quantity && isSelected && !isDisabled && (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleExtraQuantityChange(extra.extra_id, currentExtra.quantity - 1);}}><Minus size={14}/></Button>
                        <span className="font-bold">{currentExtra.quantity}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleExtraQuantityChange(extra.extra_id, currentExtra.quantity + 1);}}><Plus size={14}/></Button>
                      </div>
                    )}
                  </div>
                  {(extra.extra.deposit_amount > 0) && <p className="text-xs text-amber-600 mt-2 flex items-center"><Shield size={12} className="mr-1"/> Requiere fianza de €{extra.extra.deposit_amount}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  const renderStep2 = () => (
    <>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Paso 2: {item.needs_patron ? 'Patrón Requerido' : '¿Necesitas Patrón?'}</h2>
      {item.needs_patron && <p className="text-yellow-600 bg-yellow-50 p-3 rounded-lg text-sm flex items-center mb-4"><AlertTriangle size={16} className="mr-2"/>La selección de un patrón es obligatoria para esta embarcación.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patrons.filter(isPatronAvailable).map((patron) => (
          <div key={patron.id} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPatron?.id === patron.id ? 'bg-green-50 border-green-400' : 'bg-slate-50 border-slate-200 hover:border-slate-400'}`} onClick={() => setSelectedPatron(patron.id === selectedPatron?.id ? null : patron)}>
            <div className="flex items-center space-x-3">
              <img src={patron.avatar_url || `https://ui-avatars.com/api/?name=${patron.full_name}&background=0284c7&color=fff`} alt={patron.full_name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h3 className="text-slate-800 font-semibold">{patron.full_name}</h3>
                <p className="text-slate-600 text-sm">{patron.experience || 'Patrón profesional'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-2">
              <Button variant="link" size="sm" className="p-0 h-auto" onClick={(e) => { e.stopPropagation(); setViewingPatron(patron); }}>Más sobre el patrón</Button>
              <span className="text-slate-800 font-bold">€{bookingDetails.bookingType === 'slot' ? getPriceForSlot(patron, bookingDetails.selectedSlotId) : (patron.price_per_day || 150)}/{bookingDetails.bookingType === 'slot' ? 'tramo' : 'día'}</span>
            </div>
          </div>
        ))}
        {patrons.filter(isPatronAvailable).length === 0 && <p className="text-slate-500 md:col-span-2 text-center">No hay patrones disponibles para la selección actual.</p>}
      </div>
    </>
  );

  const renderStep3 = () => {
    const recommendedServices = services.filter(isServiceAvailable).slice(0, 3);
    return (
      <>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Paso 3: Añade Servicios Premium</h2>
        <div className="space-y-4">
          {recommendedServices.map((service) => {
            const isSelected = selectedServices.some(s => s.id === service.id);
            const currentService = selectedServices.find(s => s.id === service.id);
            const availableLocations = getServiceAvailableLocations(service);
            const availablePorts = currentService ? getServiceAvailablePorts(service, currentService.location_id) : [];

            return (
              <div key={service.id} className={`p-4 rounded-xl border-2 transition-all ${isSelected ? 'bg-purple-50 border-purple-400' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-start cursor-pointer" onClick={() => handleServiceSelection(service)}>
                  <div className="flex items-center">
                    <img src={service.image_url || 'https://placehold.co/100x100/e2e8f0/94a3b8/png?text=Servicio'} alt={service.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                    <div>
                      <h3 className="text-slate-800 font-semibold">{service.name}</h3>
                      <p className="text-sm text-slate-500">{service.provider.full_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-sm">Desde</span>
                    <p className="text-slate-800 font-bold text-lg">€{service.price}</p>
                  </div>
                </div>
                <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{height: 0, opacity: 0, marginTop: 0}} animate={{height: 'auto', opacity: 1, marginTop: '1rem'}} exit={{height: 0, opacity: 0, marginTop: 0}} className="overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-purple-200">
                      <div>
                        <Label htmlFor={`service-location-${service.id}`} className="text-xs font-medium text-slate-600">Isla</Label>
                        <select id={`service-location-${service.id}`} value={currentService.location_id || ''} onChange={(e) => handleServiceDetailChange(service.id, 'location_id', Number(e.target.value))} className="w-full p-2 mt-1 bg-white border border-slate-200 rounded-lg text-sm">
                          <option value="">Selecciona una isla</option>
                          {availableLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`service-port-${service.id}`} className="text-xs font-medium text-slate-600">Puerto</Label>
                        <select id={`service-port-${service.id}`} value={currentService.port_id || ''} onChange={(e) => handleServiceDetailChange(service.id, 'port_id', Number(e.target.value))} className="w-full p-2 mt-1 bg-white border border-slate-200 rounded-lg text-sm" disabled={!currentService.location_id}>
                          <option value="">Selecciona un puerto</option>
                          {availablePorts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`service-date-${service.id}`} className="text-xs font-medium text-slate-600">Fecha</Label>
                        <input type="date" id={`service-date-${service.id}`} value={currentService.date} onChange={(e) => handleServiceDetailChange(service.id, 'date', e.target.value)} className="w-full p-2 mt-1 bg-white border border-slate-200 rounded-lg text-sm" min={bookingDetails.startDate || today.toISOString().split('T')[0]} max={bookingDetails.endDate || undefined} />
                      </div>
                      <div>
                        <Label htmlFor={`service-time-${service.id}`} className="text-xs font-medium text-slate-600">Hora</Label>
                        <input type="time" id={`service-time-${service.id}`} value={currentService.time} onChange={(e) => handleServiceDetailChange(service.id, 'time', e.target.value)} className="w-full p-2 mt-1 bg-white border border-slate-200 rounded-lg text-sm" />
                      </div>
                      {service.pricing_model !== 'fixed' && (
                        <div className="md:col-span-2">
                          <Label htmlFor={`service-quantity-${service.id}`} className="text-xs font-medium text-slate-600">Cantidad ({unitLabel[service.pricing_model]})</Label>
                          <div className="flex items-center justify-between bg-white border border-slate-200 p-1 rounded-lg mt-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleServiceDetailChange(service.id, 'quantity', currentService.quantity - 1)} disabled={currentService.quantity <= (service.min_units || 1)}><Minus size={14}/></Button>
                            <span className="font-bold text-sm">{currentService.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleServiceDetailChange(service.id, 'quantity', currentService.quantity + 1)} disabled={service.max_units && currentService.quantity >= service.max_units}><Plus size={14}/></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  if (loading || !item) {
    return <div className="text-center text-slate-500 py-10">Cargando sistema de reservas...</div>;
  }
  
  if (step === 4) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <motion.div 
          className="text-center bg-white rounded-2xl p-12 border border-slate-200 shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle className="mx-auto text-green-500 mb-6" size={80} />
          <h1 className="text-4xl font-bold text-slate-800 mb-4">¡Solicitud de Reserva Enviada!</h1>
          <p className="text-slate-600 text-lg mb-8">Los implicados han sido notificados y tienen 24 horas para confirmar tu aventura.</p>
          <Button onClick={() => onViewChange('dashboard')} className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white py-3 px-8 text-lg font-semibold">
            Ir a mi Panel
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={() => onViewChange('marketplace')} variant="ghost" className="mb-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100"><ArrowLeft size={16} className="mr-2"/> Volver</Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <motion.div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{item.name}</h1>
              <div className="flex items-center space-x-4 text-slate-600">
                <div className="flex items-center"><MapPin size={16} className="mr-2 text-blue-500"/> {item.port?.name || item.location}</div>
                <div className="flex items-center"><Star size={16} className="mr-2 text-yellow-400"/> {item.rating || 'N/A'}</div>
              </div>
            </motion.div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div>
            <motion.div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md sticky top-24" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Resumen de Reserva</h3>
              <div className="space-y-3 pt-4 border-t border-slate-200">
                {(selectedSlot || (bookingDetails.bookingType === 'days' && bookingDetails.startDate && bookingDetails.endDate)) ? (
                  <>
                    <div className="flex justify-between items-center">
                      <p className="text-slate-600">{bookingDetails.bookingType === 'days' ? `${calculateDays()} día(s)` : selectedSlot.name}</p>
                      <span className="text-slate-800 font-medium">€{calculateBasePrice().toFixed(2)}</span>
                    </div>
                    {selectedPatron && <div className="flex justify-between items-center"><div><p className="text-slate-600">Patrón: {selectedPatron.full_name}</p></div><span className="text-slate-800 font-medium">€{calculatePatronPrice().toFixed(2)}</span></div>}
                    {selectedExtras.map((extra) => {
                      if (!extra.extra) return null;
                      const price = extra.price_override || extra.extra.recommended_price || 0;
                      const pricingModel = extra.extra.pricing_model;
                      let extraCost = 0;
                      if (pricingModel === 'per_day' && bookingDetails.bookingType === 'days' && calculateDays() > 0) {
                        extraCost = price * calculateDays() * extra.quantity;
                      } else if (pricingModel === 'per_slot' && bookingDetails.bookingType === 'slot') {
                        extraCost = price * extra.quantity;
                      } else { extraCost = price * extra.quantity; }
                      return (
                        <div key={extra.extra_id} className="flex justify-between items-center">
                          <p className="text-slate-600">{extra.extra.name} {extra.quantity > 1 ? `x${extra.quantity}`: ''}</p>
                          <span className="text-slate-800 font-medium">{extra.included ? 'Incluido' : `€${extraCost.toFixed(2)}`}</span>
                        </div>
                      );
                    })}
                    {selectedServices.map((service) => {
                      let servicePrice = service.price || 0;
                      if (service.pricing_model !== 'fixed') {
                        servicePrice *= service.quantity;
                      }
                      return (
                        <div key={service.id} className="flex justify-between items-center">
                          <p className="text-slate-600">{service.name} (x{service.quantity})</p>
                          <span className="text-slate-800 font-medium">{`€${servicePrice.toFixed(2)}`}</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-slate-200 pt-4 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-slate-800">Total</span>
                        <span className="text-2xl font-bold text-green-600">€{calculateTotal().toFixed(2)}</span>
                      </div>
                      {totalDeposit > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center text-amber-600">
                            <div className="flex items-center">
                              <Shield size={16} className="mr-2"/>
                              <span className="font-semibold">Fianza Total</span>
                            </div>
                            <span className="font-bold">€{totalDeposit.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 text-right">Se paga directamente al proveedor.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-slate-500 py-4">Completa el paso 1 para ver el resumen.</p>
                )}
                <div className="flex gap-2 mt-4">
                  {step > 1 && <Button onClick={() => setStep(s => s - 1)} variant="outline" className="w-full">Atrás</Button>}
                  {step < 3 && <Button onClick={handleNextStep} className="w-full">Siguiente</Button>}
                  {step === 3 && <Button onClick={handleBooking} className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white">Solicitar Reserva</Button>}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    <AnimatePresence>
      {viewingPatron && <PatronProfileModal patron={viewingPatron} onClose={() => setViewingPatron(null)} />}
    </AnimatePresence>
    </>
  );
};

export default BookingSystem;