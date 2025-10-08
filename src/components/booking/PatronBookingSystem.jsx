import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ArrowLeft, Star, CheckCircle, Clock, ChevronDown, Minus, Plus, Shield, Package, MapPin, FileText, Languages, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const PatronBookingSystem = ({ user, patron, onViewChange }) => {
  const [extras, setExtras] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availablePorts, setAvailablePorts] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableSlots = patron?.available_slots?.filter(s => s.enabled) || [];
  const isDailyBookingEnabled = availableSlots.some(s => s.id === 'full_day') || availableSlots.length === 0;
  const defaultBookingType = availableSlots.length > 0 ? 'slot' : 'days';

  const [bookingDetails, setBookingDetails] = useState({
    startDate: null,
    endDate: null,
    guests: 1,
    selectedSlotId: availableSlots.length > 0 ? availableSlots[0].id : null,
    bookingType: defaultBookingType,
    location: '',
    selectedLocationId: null,
    selectedPortId: null,
  });
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState(1);
  const { toast } = useToast();

  const selectedSlot = availableSlots.find(s => s.id === bookingDetails.selectedSlotId);

  useEffect(() => {
    if (!patron) {
      toast({ variant: "destructive", title: "Error", description: "No se ha seleccionado ningún patrón." });
      onViewChange('marketplace');
      return;
    }

    const fetchOptions = async () => {
      setLoading(true);
      const fetchExtras = supabase.from('patron_extras').select('*, extras(*)').eq('patron_id', patron.id).eq('extras.is_visible_to_client', true);
      const fetchReviews = supabase.from('patron_reviews').select('*, client:profiles!patron_reviews_client_id_fkey(full_name, avatar_url)').eq('patron_id', patron.id).order('created_at', { ascending: false });
      const fetchPorts = supabase.from('profile_ports').select('ports(*, location:locations(*))').eq('profile_id', patron.id);

      const [
        { data: extrasData, error: extrasError },
        { data: reviewsData, error: reviewsError },
        { data: portsData, error: portsError },
      ] = await Promise.all([fetchExtras, fetchReviews, fetchPorts]);

      if (extrasError || reviewsError || portsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las opciones de reserva." });
      } else {
        setExtras(extrasData || []);
        setReviews(reviewsData || []);
        
        const allPorts = portsData.map(p => p.ports).filter(Boolean);
        const uniqueLocations = [...new Map(allPorts.map(p => p.location).filter(Boolean).map(l => [l.id, l])).values()];
        
        setAvailablePorts(allPorts);
        setAvailableLocations(uniqueLocations);

        const initialExtras = (extrasData || []).filter(e => e.included || e.is_obligatory).map(e => ({ ...e, quantity: 1 }));
        setSelectedExtras(initialExtras);
        if (uniqueLocations.length > 0) {
          setBookingDetails(prev => ({ ...prev, selectedLocationId: uniqueLocations[0].id }));
        }
      }
      setLoading(false);
    };
    fetchOptions();
  }, [patron, toast, onViewChange]);

  const handleSlotSelection = (slotId) => {
    setBookingDetails(prev => ({ ...prev, selectedSlotId: slotId, startDate: null, endDate: null, bookingType: 'slot' }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const date = new Date(value);
    date.setHours(0,0,0,0);
    if (date < today) {
      toast({ variant: "destructive", title: "Fecha inválida", description: "No puedes seleccionar una fecha pasada." });
      return;
    }
    if (name === 'startDate') {
      setBookingDetails(prev => ({ ...prev, startDate: value, endDate: prev.endDate && new Date(prev.endDate) < new Date(value) ? value : prev.endDate }));
    } else {
      setBookingDetails(prev => ({ ...prev, endDate: value }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e) => {
    const locId = parseInt(e.target.value, 10);
    setBookingDetails(prev => ({ ...prev, selectedLocationId: locId, selectedPortId: null }));
  };

  const handlePortChange = (e) => {
    const portId = parseInt(e.target.value, 10);
    setBookingDetails(prev => ({ ...prev, selectedPortId: portId }));
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

  const handleBooking = async () => {
    if (!bookingDetails.startDate) {
      toast({ variant: "destructive", title: "Faltan datos", description: "Por favor, selecciona una fecha de inicio." });
      return;
    }
    if (bookingDetails.bookingType === 'days' && !bookingDetails.endDate) {
      toast({ variant: "destructive", title: "Faltan datos", description: "Por favor, selecciona una fecha de fin." });
      return;
    }
    if (!bookingDetails.selectedPortId) {
      toast({ variant: "destructive", title: "Faltan datos", description: "Por favor, indica el puerto de encuentro." });
      return;
    }

    const selectedPortName = availablePorts.find(p => p.id === bookingDetails.selectedPortId)?.name || 'Puerto no especificado';

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
      start_date.setHours(10, 0);
      end_date.setHours(18, 0);
    }

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        patron_id: patron.id,
        start_date: start_date.toISOString(),
        end_date: end_date.toISOString(),
        guests: bookingDetails.guests,
        total_price,
        status: 'pending_approval',
        selected_slot_id: selectedSlot?.id,
        selected_slot_name: bookingDetails.bookingType === 'days' ? `${calculateDays()} días` : selectedSlot?.name,
        location: selectedPortName,
      })
      .select().single();

    if (bookingError) {
      toast({ variant: "destructive", title: "Error de reserva", description: bookingError.message });
      return;
    }

    const bookingItems = [
      {
        booking_id: bookingData.id,
        item_type: 'patron',
        name: `Servicio de patrón: ${patron.full_name}`,
        price: bookingDetails.bookingType === 'slot' ? selectedSlot.price : (availableSlots.find(s => s.id === 'full_day')?.price || patron.price_per_day || 0) * calculateDays(),
        quantity: 1,
      },
      ...selectedExtras.map(e => ({
        booking_id: bookingData.id,
        extra_id: e.extra_id,
        item_type: 'extra',
        name: e.extra?.name || 'Extra sin nombre',
        price: (e.included || (e.is_obligatory && e.included)) ? 0 : (e.price_override || e.extra?.recommended_price || 0),
        quantity: e.quantity
      }))
    ];

    const { error: itemsError } = await supabase.from('booking_items').insert(bookingItems);
    if (itemsError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron añadir los detalles de la reserva." });
      await supabase.from('bookings').delete().eq('id', bookingData.id);
      return;
    }

    toast({ title: "¡Solicitud enviada!", description: "Tu reserva está pendiente de confirmación por el patrón (24h)." });
    setBookingStep(2);
  };

  const calculateDays = () => {
    if (!bookingDetails.startDate || !bookingDetails.endDate) return 0;
    const start = new Date(bookingDetails.startDate);
    const end = new Date(bookingDetails.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const calculateTotal = () => {
    let total = 0;
    const days = calculateDays();

    if (bookingDetails.bookingType === 'slot' && selectedSlot) {
      total = selectedSlot.price || 0;
    } else if (bookingDetails.bookingType === 'days' && isDailyBookingEnabled) {
      const dailyPrice = availableSlots.find(s => s.id === 'full_day')?.price || patron.price_per_day || 0;
      total = dailyPrice * days;
    }

    selectedExtras.forEach(extra => {
      if (!extra.included && extra.extra) {
        const price = extra.price_override || extra.extra.recommended_price || 0;
        const pricingModel = extra.extra.pricing_model;
        let extraCost = 0;
        if (pricingModel === 'per_day' && bookingDetails.bookingType === 'days' && days > 0) {
          extraCost = price * days * extra.quantity;
        } else {
          extraCost = price * extra.quantity;
        }
        total += extraCost;
      }
    });
    return total;
  };

  if (loading || !patron) {
    return <div className="text-center text-slate-500 py-10">Cargando sistema de reservas...</div>;
  }
  
  if (bookingStep === 2) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-slate-50">
        <motion.div className="text-center bg-white rounded-2xl p-12 border border-slate-200 shadow-lg" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle className="mx-auto text-green-500 mb-6" size={80} />
          <h1 className="text-4xl font-bold text-slate-800 mb-4">¡Solicitud de Contratación Enviada!</h1>
          <p className="text-slate-600 text-lg mb-8">El patrón ha sido notificado y tiene 24 horas para confirmar el servicio.</p>
          <Button onClick={() => onViewChange('dashboard')} className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white py-3 px-8 text-lg font-semibold">
            Ir a mi Panel
          </Button>
        </motion.div>
      </div>
    );
  }

  const filteredPorts = availablePorts.filter(p => p.location_id === bookingDetails.selectedLocationId);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={() => onViewChange('marketplace')} variant="ghost" className="mb-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100"><ArrowLeft size={16} className="mr-2"/> Volver al Marketplace</Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <img src={patron.avatar_url || `https://ui-avatars.com/api/?name=${patron.full_name}&background=0284c7&color=fff`} alt={patron.full_name} className="w-32 h-32 rounded-full object-cover border-4 border-sky-200 flex-shrink-0" />
                <div className="text-center sm:text-left">
                  <h1 className="text-4xl font-bold text-slate-900">{patron.full_name}</h1>
                  <div className="flex items-center justify-center sm:justify-start space-x-4 text-slate-600 mt-2">
                    <div className="flex items-center"><MapPin size={16} className="mr-2 text-blue-500"/> {patron.location}</div>
                    <div className="flex items-center"><Star size={16} className="mr-2 text-yellow-400"/> {patron.rating || 'N/A'}</div>
                  </div>
                  <p className="text-slate-600 mt-4">{patron.experience || 'Patrón profesional con amplia experiencia en navegación.'}</p>
                </div>
              </div>
              <div className="border-t border-slate-200 my-6"></div>
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
            </motion.div>

            {extras.length > 0 && (
              <motion.div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Extras del Patrón</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extras.map((extra) => {
                    if (!extra.extra) return null;
                    const isSelected = selectedExtras.some(e => e.extra_id === extra.extra_id);
                    const currentExtra = selectedExtras.find(e => e.extra_id === extra.extra_id);
                    const isDisabled = extra.included || extra.is_obligatory;
                    return (
                      <div key={extra.extra_id} className={`p-4 rounded-xl border-2 transition-all ${isSelected ? 'bg-sky-50 border-sky-400' : 'bg-slate-50 border-slate-200'} ${isDisabled ? 'opacity-70' : 'cursor-pointer hover:border-slate-400'}`} onClick={() => handleExtraSelection(extra)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-slate-800 font-semibold">{extra.extra.name} {extra.is_obligatory && <span className="text-red-500 text-xs">(Obligatorio)</span>}</h3>
                            <span className="text-slate-800 font-bold">{extra.included ? 'Incluido' : `€${extra.price_override || extra.extra.recommended_price}`}</span>
                          </div>
                          {extra.extra.allow_quantity && isSelected && !isDisabled && (
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleExtraQuantityChange(extra.extra_id, currentExtra.quantity - 1);}}><Minus size={14}/></Button>
                              <span className="font-bold">{currentExtra.quantity}</span>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); handleExtraQuantityChange(extra.extra_id, currentExtra.quantity + 1);}}><Plus size={14}/></Button>
                            </div>
                          )}
                        </div>
                        {extra.deposit_amount > 0 && <p className="text-xs text-amber-600 mt-2 flex items-center"><Shield size={12} className="mr-1"/> Requiere depósito de €{extra.deposit_amount} (pago al proveedor)</p>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <motion.div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Valoraciones de Clientes</h2>
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
            </motion.div>
          </div>

          <div>
            <motion.div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md sticky top-24" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Resumen de Contratación</h3>
              <div className="space-y-4">
                <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-100 mb-4">
                  {availableSlots.length > 0 && <Button onClick={() => setBookingDetails(p => ({...p, bookingType: 'slot', startDate: null, endDate: null}))} className={`flex-1 ${bookingDetails.bookingType === 'slot' ? 'bg-white shadow' : 'bg-transparent text-slate-600'}`} variant="ghost">Por Tramos</Button>}
                  {isDailyBookingEnabled && <Button onClick={() => setBookingDetails(p => ({...p, bookingType: 'days', selectedSlotId: null}))} className={`flex-1 ${bookingDetails.bookingType === 'days' ? 'bg-white shadow' : 'bg-transparent text-slate-600'}`} variant="ghost">Por Días</Button>}
                </div>

                {bookingDetails.bookingType === 'slot' ? (
                  <div>
                    <label className="block text-slate-700 text-sm font-medium mb-2">Tramo Horario</label>
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
                      <label className="block text-slate-700 text-sm font-medium mb-2">Fecha de inicio</label>
                      <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="date" name="startDate" value={bookingDetails.startDate || ''} min={today.toISOString().split('T')[0]} onChange={handleDateChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    </div>
                    <div>
                      <label className="block text-slate-700 text-sm font-medium mb-2">Fecha de fin</label>
                      <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="date" name="endDate" value={bookingDetails.endDate || ''} min={bookingDetails.startDate || today.toISOString().split('T')[0]} onChange={handleDateChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    </div>
                  </div>
                )}

                {(selectedSlot || (bookingDetails.bookingType === 'days' && bookingDetails.startDate)) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-4">
                    {bookingDetails.bookingType === 'slot' && (
                      <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">Fecha</label>
                        <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="date" value={bookingDetails.startDate || ''} min={today.toISOString().split('T')[0]} onChange={(e) => setBookingDetails(p => ({...p, startDate: e.target.value, endDate: e.target.value}))} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">Isla</label>
                        <div className="relative">
                          <select onChange={handleLocationChange} value={bookingDetails.selectedLocationId || ''} className="w-full appearance-none p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Selecciona una isla</option>
                            {availableLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">Puerto</label>
                        <div className="relative">
                          <select onChange={handlePortChange} value={bookingDetails.selectedPortId || ''} disabled={!bookingDetails.selectedLocationId} className="w-full appearance-none p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                            <option value="">Selecciona un puerto</option>
                            {filteredPorts.map(port => <option key={port.id} value={port.id}>{port.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  {(selectedSlot || (bookingDetails.bookingType === 'days' && bookingDetails.startDate && bookingDetails.endDate)) ? (
                    <>
                      <div className="flex justify-between items-center">
                        <p className="text-slate-600">{bookingDetails.bookingType === 'days' ? `${calculateDays()} día(s)` : selectedSlot.name}</p>
                        <span className="text-slate-800 font-medium">€{bookingDetails.bookingType === 'days' ? (availableSlots.find(s => s.id === 'full_day')?.price || patron.price_per_day || 0) * calculateDays() : selectedSlot.price}</span>
                      </div>
                      {selectedExtras.map((extra) => {
                        if (!extra.extra) return null;
                        const price = extra.price_override || extra.extra.recommended_price || 0;
                        const pricingModel = extra.extra.pricing_model;
                        let extraCost = 0;
                        if (pricingModel === 'per_day' && bookingDetails.bookingType === 'days' && calculateDays() > 0) {
                          extraCost = price * calculateDays() * extra.quantity;
                        } else { extraCost = price * extra.quantity; }
                        return (
                          <div key={extra.extra_id} className="flex justify-between items-center">
                            <p className="text-slate-600">{extra.extra.name} {extra.quantity > 1 ? `x${extra.quantity}`: ''}</p>
                            <span className="text-slate-800 font-medium">{extra.included ? 'Incluido' : `€${extraCost}`}</span>
                          </div>
                        );
                      })}
                      <div className="border-t border-slate-200 pt-4 mt-3"><div className="flex justify-between items-center"><span className="text-xl font-bold text-slate-800">Total</span><span className="text-2xl font-bold text-green-600">€{calculateTotal().toFixed(0)}</span></div></div>
                    </>
                  ) : (
                    <p className="text-center text-slate-500 py-4">Selecciona un plan para ver el resumen.</p>
                  )}
                  <Button onClick={handleBooking} disabled={!bookingDetails.startDate || !bookingDetails.selectedPortId || (bookingDetails.bookingType === 'slot' && !selectedSlot) || (bookingDetails.bookingType === 'days' && !bookingDetails.endDate)} className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white py-3 text-lg font-semibold disabled:opacity-50">Solicitar Contratación</Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatronBookingSystem;