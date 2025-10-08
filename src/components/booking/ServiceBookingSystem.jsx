import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, ArrowLeft, CreditCard, CheckCircle, AlertTriangle, Minus, Plus, Hourglass, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const ServiceBookingSystem = ({ user, service, onViewChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedPort, setSelectedPort] = useState(null);
  const [quantity, setQuantity] = useState(service.min_units || 1);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availablePorts, setAvailablePorts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*, service_ports(ports(*, location:locations(*))), service_extras(extra:extras(*), price_override, included, is_obligatory)')
        .eq('id', service.id)
        .single();

      if (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la información del servicio." });
        onViewChange('marketplace');
      } else {
        setServiceData(data);
        
        const locationIds = new Set();
        const locations = [];
        data.service_ports.forEach(sp => {
          if (sp.ports && sp.ports.location && !locationIds.has(sp.ports.location.id)) {
            locationIds.add(sp.ports.location.id);
            locations.push(sp.ports.location);
          }
        });
        setAvailableLocations(locations);

        if (locations.length > 0) {
          const firstLocationId = locations[0].id;
          setSelectedLocation(firstLocationId);
          const portsForFirstLocation = data.service_ports
            .filter(sp => sp.ports && sp.ports.location_id === firstLocationId)
            .map(sp => sp.ports);
          setAvailablePorts(portsForFirstLocation);
          if (portsForFirstLocation.length > 0) {
            setSelectedPort(portsForFirstLocation[0].id);
          }
        }
      }
      setLoading(false);
    };

    fetchServiceDetails();
  }, [service.id, toast, onViewChange]);

  useEffect(() => {
    if (serviceData && selectedLocation) {
      const portsForLocation = serviceData.service_ports
        .filter(sp => sp.ports && sp.ports.location_id === selectedLocation)
        .map(sp => sp.ports);
      setAvailablePorts(portsForLocation);
      if (!portsForLocation.some(p => p.id === selectedPort)) {
        setSelectedPort(portsForLocation.length > 0 ? portsForLocation[0].id : null);
      }
    }
  }, [selectedLocation, serviceData, selectedPort]);

  const unitLabel = {
    per_hour: 'hora(s)',
    per_person: 'persona(s)',
    per_day: 'día(s)',
    per_week: 'semana(s)',
    fixed: 'servicio(s)',
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    const min = serviceData.min_units || 1;
    const max = serviceData.max_units;
    if (newQuantity >= min && (!max || newQuantity <= max)) {
      setQuantity(newQuantity);
    } else if (newQuantity < min) {
      setQuantity(min);
    } else if (max && newQuantity > max) {
      setQuantity(max);
    }
  };

  const handleExtraChange = (extraConfig) => {
    setSelectedExtras(prev => {
      const isSelected = prev.some(e => e.extra.id === extraConfig.extra.id);
      if (isSelected) {
        return prev.filter(e => e.extra.id !== extraConfig.extra.id);
      } else {
        return [...prev, extraConfig];
      }
    });
  };

  const calculateTotalPrice = useCallback(() => {
    if (!serviceData) return 0;
    let servicePrice = serviceData.price || 0;
    let calculatedQuantity = quantity;
    if (serviceData.pricing_model !== 'fixed') {
      servicePrice *= calculatedQuantity;
    }

    const extrasPrice = selectedExtras.reduce((total, extraConfig) => {
      return total + (extraConfig.price_override || extraConfig.extra.recommended_price);
    }, 0);

    return servicePrice + extrasPrice;
  }, [serviceData, quantity, selectedExtras]);

  const totalPrice = calculateTotalPrice();

  const handleBooking = async () => {
    setLoading(true);
    
    let bookingEndDate = new Date(selectedDate);
    if (serviceData.pricing_model === 'per_day') {
      bookingEndDate.setDate(bookingEndDate.getDate() + quantity - 1);
    } else if (serviceData.pricing_model === 'per_week') {
      bookingEndDate.setDate(bookingEndDate.getDate() + (quantity * 7) - 1);
    }

    const portName = availablePorts.find(p => p.id === selectedPort)?.name || serviceData.location;

    const bookingData = {
      client_id: user.id,
      start_date: selectedDate.toISOString(),
      end_date: bookingEndDate.toISOString(),
      guests: serviceData.pricing_model === 'per_person' ? quantity : 1,
      total_price: totalPrice,
      status: 'pending_approval',
      location: portName,
    };

    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      toast({ variant: "destructive", title: "Error en la reserva", description: bookingError.message });
      setLoading(false);
      return;
    }

    const itemsToInsert = [
      {
        booking_id: newBooking.id,
        service_id: serviceData.id,
        item_type: 'service',
        name: serviceData.name,
        price: serviceData.price,
        quantity: quantity,
        start_date: selectedDate.toISOString(),
        location: portName,
      },
      ...selectedExtras.map(extraConfig => ({
        booking_id: newBooking.id,
        extra_id: extraConfig.extra.id,
        item_type: 'extra',
        name: extraConfig.extra.name,
        price: extraConfig.price_override || extraConfig.extra.recommended_price,
        quantity: 1,
      }))
    ];

    const { error: itemError } = await supabase.from('booking_items').insert(itemsToInsert);

    if (itemError) {
      toast({ variant: "destructive", title: "Error al añadir ítems", description: itemError.message });
      await supabase.from('bookings').delete().eq('id', newBooking.id);
      setLoading(false);
      return;
    }

    setBookingDetails({ ...newBooking, total_price: totalPrice });
    setStep(2);
    setLoading(false);
  };

  if (loading || !serviceData) {
    return <div className="text-center text-slate-500 py-10">Cargando...</div>;
  }

  const renderStep1 = () => (
    <>
      <div className="p-6 sm:p-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-4" onClick={() => onViewChange('marketplace')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{serviceData.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden mb-4">
              <img className="w-full h-full object-cover" alt={serviceData.name} src={serviceData.image_url || "https://images.unsplash.com/photo-1690721606848-ac5bdcde45ea"} />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Descripción</h2>
            <p className="text-slate-600">{serviceData.description}</p>
            
            {serviceData.service_extras && serviceData.service_extras.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Extras Disponibles</h3>
                <div className="space-y-3">
                  {serviceData.service_extras.map(extraConfig => (
                    <div key={extraConfig.extra.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                      <div className="flex items-center">
                        <Checkbox id={`extra-${extraConfig.extra.id}`} onCheckedChange={() => handleExtraChange(extraConfig)} />
                        <Label htmlFor={`extra-${extraConfig.extra.id}`} className="ml-3">
                          <span className="font-medium">{extraConfig.extra.name}</span>
                          <p className="text-xs text-slate-500">{extraConfig.extra.description}</p>
                        </Label>
                      </div>
                      <span className="font-semibold">€{(extraConfig.price_override || extraConfig.extra.recommended_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Configura tu servicio</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location-select" className="flex items-center text-slate-600 mb-2"><MapPin className="mr-2" size={20} /> Isla</Label>
                  <select id="location-select" value={selectedLocation || ''} onChange={e => setSelectedLocation(Number(e.target.value))} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg">
                    <option value="">Selecciona una isla</option>
                    {availableLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="port-select" className="flex items-center text-slate-600 mb-2"><MapPin className="mr-2" size={20} /> Puerto</Label>
                  <select id="port-select" value={selectedPort || ''} onChange={e => setSelectedPort(Number(e.target.value))} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg" disabled={!selectedLocation}>
                    <option value="">Selecciona un puerto</option>
                    {availablePorts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label className="flex items-center text-slate-600 mb-2"><Calendar className="mr-2" size={20} /> Fecha del servicio</Label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg"
                />
              </div>

              {serviceData.pricing_model !== 'fixed' && (
                <div>
                  <Label className="flex items-center text-slate-600 mb-2">
                    {serviceData.pricing_model === 'per_hour' && <Hourglass className="mr-2" size={20} />}
                    {serviceData.pricing_model === 'per_person' && <Users className="mr-2" size={20} />}
                    {(serviceData.pricing_model === 'per_day' || serviceData.pricing_model === 'per_week') && <Calendar className="mr-2" size={20} />}
                    Cantidad
                  </Label>
                  <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg">
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= (serviceData.min_units || 1)}>
                      <Minus />
                    </Button>
                    <span className="text-lg font-semibold w-24 text-center">{quantity} {unitLabel[serviceData.pricing_model]}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} disabled={serviceData.max_units && quantity >= serviceData.max_units}>
                      <Plus />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    Mín: {serviceData.min_units || 1}. {serviceData.max_units && `Máx: ${serviceData.max_units}`}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-slate-600">Total a pagar:</span>
                <span className="text-3xl font-bold text-slate-800">€{totalPrice.toFixed(2)}</span>
              </div>
              <Button onClick={handleBooking} disabled={loading || !selectedPort} className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-sky-500 text-white">
                {loading ? 'Procesando...' : 'Solicitar Reserva'}
              </Button>
              <p className="text-xs text-slate-500 mt-2 text-center flex items-center justify-center">
                <AlertTriangle size={14} className="mr-1 text-orange-500" />
                La reserva está sujeta a la confirmación del proveedor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <div className="p-6 sm:p-8 text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
      </motion.div>
      <h1 className="mt-6 text-3xl font-bold text-slate-800">¡Solicitud Enviada!</h1>
      <p className="mt-2 text-slate-600 max-w-md mx-auto">
        Tu solicitud de reserva ha sido enviada al proveedor. Recibirás una notificación por correo electrónico cuando sea confirmada.
      </p>
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-md border border-slate-200 max-w-lg mx-auto text-left">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Resumen de la Solicitud</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Servicio:</span>
            <span className="font-medium text-slate-800">{serviceData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ubicación:</span>
            <span className="font-medium text-slate-800">{bookingDetails.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha:</span>
            <span className="font-medium text-slate-800">{new Date(bookingDetails.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cantidad:</span>
            <span className="font-medium text-slate-800">{quantity} {unitLabel[serviceData.pricing_model]}</span>
          </div>
          {selectedExtras.length > 0 && (
            <div className="pt-3 border-t">
              <h3 className="text-slate-500 mb-2">Extras:</h3>
              {selectedExtras.map(extraConfig => (
                <div key={extraConfig.extra.id} className="flex justify-between text-sm">
                  <span>{extraConfig.extra.name}</span>
                  <span className="font-medium">€{(extraConfig.price_override || extraConfig.extra.recommended_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <span className="text-lg font-medium text-slate-600">Total:</span>
            <span className="text-2xl font-bold text-slate-800">€{bookingDetails.total_price.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <Button variant="outline" onClick={() => onViewChange('marketplace')}>Volver al Marketplace</Button>
        <Button onClick={() => onViewChange('dashboard')}>Ir a mi Dashboard</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 1 ? 0 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 ? renderStep1() : renderStep2()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ServiceBookingSystem;