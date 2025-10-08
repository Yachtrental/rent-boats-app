import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AvailabilityManager = ({ providerId, providerType, isEditingProfile = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const tableName = providerType === 'boat' ? 'boats' : (providerType === 'service' ? 'services' : 'profiles');
  const idColumn = providerType === 'boat' || providerType === 'service' ? 'id' : 'id';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const availabilityPromise = supabase
        .from(tableName)
        .select('availability')
        .eq(idColumn, providerId)
        .single();

      let bookingsPromise;
      if (providerType === 'patron') {
        bookingsPromise = supabase
          .from('bookings')
          .select('start_date, end_date, status')
          .eq('patron_id', providerId)
          .in('status', ['pending_approval', 'pending_payment', 'confirmed']);
      } else if (providerType === 'armador') {
        bookingsPromise = supabase
          .from('bookings')
          .select('start_date, end_date, status, boat:boats!inner(owner_id)')
          .eq('boat.owner_id', providerId)
          .in('status', ['pending_approval', 'pending_payment', 'confirmed']);
      } else if (providerType === 'servicios') {
         bookingsPromise = supabase
          .from('bookings')
          .select('start_date, end_date, status, booking_items!inner(service:services!inner(provider_id))')
          .eq('booking_items.service.provider_id', providerId)
          .in('status', ['pending_approval', 'pending_payment', 'confirmed']);
      } else {
        bookingsPromise = Promise.resolve({ data: [], error: null });
      }

      const [{ data: availabilityData, error: availabilityError }, { data: bookingsData, error: bookingsError }] = await Promise.all([availabilityPromise, bookingsPromise]);

      if (availabilityError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la disponibilidad." });
      } else if (availabilityData && availabilityData.availability) {
        setUnavailableDates(availabilityData.availability.map(d => new Date(d).toISOString().split('T')[0]));
      }

      if (bookingsError) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las reservas." });
      } else {
        setBookings(bookingsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [providerId, tableName, idColumn, toast, providerType]);

  const getBookingStatusForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    for (const booking of bookings) {
      const start = new Date(booking.start_date).toISOString().split('T')[0];
      const end = new Date(booking.end_date).toISOString().split('T')[0];
      if (dateString >= start && dateString <= end) {
        return booking.status;
      }
    }
    return null;
  };

  const handleDateClick = async (date) => {
    const dateString = date.toISOString().split('T')[0];
    
    if (getBookingStatusForDate(date)) {
      toast({ variant: "destructive", title: "Día Ocupado", description: "No puedes modificar la disponibilidad de un día con una reserva." });
      return;
    }

    const isUnavailable = unavailableDates.includes(dateString);
    let newUnavailableDates;

    if (isUnavailable) {
      newUnavailableDates = unavailableDates.filter(d => d !== dateString);
    } else {
      newUnavailableDates = [...unavailableDates, dateString];
    }

    setUnavailableDates(newUnavailableDates);

    const updatePayload = { availability: newUnavailableDates };
    if (!isEditingProfile) {
        // If not editing profile, we don't want to trigger a review, so we don't change status
    }

    const { error } = await supabase
      .from(tableName)
      .update(updatePayload)
      .eq(idColumn, providerId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar la disponibilidad." });
      setUnavailableDates(unavailableDates);
    } else {
      toast({ title: "Disponibilidad actualizada", description: `El día ${date.toLocaleDateString()} ha sido marcado como ${isUnavailable ? 'disponible' : 'no disponible'}.` });
    }
  };

  const changeMonth = (offset) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isPast = date < today;
      const isManuallyUnavailable = unavailableDates.includes(dateString);
      const bookingStatus = getBookingStatusForDate(date);

      let dayClass = 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer';
      if (isPast) {
        dayClass = 'text-slate-400 bg-slate-100 cursor-not-allowed';
      } else if (bookingStatus) {
        switch (bookingStatus) {
          case 'pending_approval': dayClass = 'bg-red-300 text-red-900 font-bold cursor-not-allowed'; break;
          case 'pending_payment': dayClass = 'bg-blue-300 text-blue-900 font-bold cursor-not-allowed'; break;
          case 'confirmed': dayClass = 'bg-green-300 text-green-900 font-bold cursor-not-allowed'; break;
          default: dayClass = 'bg-slate-200 text-slate-500 cursor-not-allowed';
        }
      } else if (isManuallyUnavailable) {
        dayClass = 'bg-slate-300 text-slate-600 font-semibold line-through cursor-pointer';
      }

      days.push(
        <motion.div
          key={day}
          whileHover={{ scale: isPast || bookingStatus ? 1 : 1.05 }}
          whileTap={{ scale: isPast || bookingStatus ? 1 : 0.95 }}
          onClick={() => !isPast && handleDateClick(date)}
          className={`p-2 text-center rounded-lg transition-colors ${dayClass}`}
        >
          {day}
        </motion.div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center"><Calendar className="mr-3" />Gestionar Disponibilidad</h2>
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg mb-6 flex items-start">
        <Info size={20} className="mr-3 mt-1 flex-shrink-0" />
        <div>
          <p className="font-semibold">Por defecto, todos los días están disponibles.</p>
          <p className="text-sm">Haz clic en un día para marcarlo como <span className="font-bold">NO DISPONIBLE</span>. Los días con reservas se bloquean automáticamente.</p>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}><ChevronLeft /></Button>
        <h3 className="text-xl font-semibold text-slate-700 capitalize">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h3>
        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}><ChevronRight /></Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center font-medium text-slate-500 mb-2">
        <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sá</div>
      </div>
      {loading ? (
        <div className="text-center py-10">Cargando calendario...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {renderCalendar()}
        </div>
      )}
      <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm">
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-green-300 mr-2"></div>Reserva Confirmada</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-blue-300 mr-2"></div>Pendiente de Pago</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-red-300 mr-2"></div>Pendiente Confirmar</div>
        <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-slate-300 mr-2"></div>Bloqueado Manual</div>
      </div>
    </div>
  );
};

export default AvailabilityManager;