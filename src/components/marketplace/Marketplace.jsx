
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Users, Anchor, Calendar, Sailboat, User, ChevronDown, Heart, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import BoatDetailCard from '@/components/marketplace/BoatDetailCard';
import { Button } from '@/components/ui/button';

const Marketplace = ({ onStartBooking, onStartPatronBooking, onStartServiceBooking, onViewDetails, user }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [boats, setBoats] = useState([]);
  const [services, setServices] = useState([]);
  const [patrons, setPatrons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [ports, setPorts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState({
    locationId: '',
    portId: '',
    startDate: '',
    endDate: '',
    guests: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const fetchBoats = supabase.from('boats').select(`*, profiles (full_name), boat_images(image_url, is_main), port:ports(name, location:locations(id, name))`).eq('status', 'active');
      const fetchServices = supabase.from('services').select(`*, profiles (full_name), service_ports(ports(id, name, location:locations(id, name)))`);
      const fetchPatrons = supabase.from('profiles').select(`*, profile_ports(ports(id, name, location:locations(id, name)))`).eq('role', 'patron');
      const fetchBookings = supabase.from('bookings').select('boat_id, patron_id, start_date, end_date').in('status', ['confirmed', 'completed', 'pending_payment', 'pending_approval']);
      const fetchLocations = supabase.from('locations').select('*');
      const fetchPorts = supabase.from('ports').select('*');
      const fetchFavorites = user ? supabase.from('favorites').select('*').eq('user_id', user.id) : Promise.resolve({ data: [], error: null });

      const [
        { data: boatsData, error: boatsError },
        { data: servicesData, error: servicesError },
        { data: patronsData, error: patronsError },
        { data: bookingsData, error: bookingsError },
        { data: locationsData, error: locationsError },
        { data: portsData, error: portsError },
        { data: favoritesData, error: favoritesError },
      ] = await Promise.all([fetchBoats, fetchServices, fetchPatrons, fetchBookings, fetchLocations, fetchPorts, fetchFavorites]);

      if (boatsError) console.error('Error fetching boats:', boatsError); else setBoats(boatsData || []);
      if (servicesError) console.error('Error fetching services:', servicesError); else setServices(servicesData || []);
      if (patronsError) console.error('Error fetching patrons:', patronsError); else setPatrons(patronsData || []);
      if (bookingsError) console.error('Error fetching bookings:', bookingsError); else setBookings(bookingsData || []);
      if (locationsError) console.error('Error fetching locations:', locationsError); else setLocations(locationsData || []);
      if (portsError) console.error('Error fetching ports:', portsError); else setPorts(portsData || []);
      if (favoritesError) console.error('Error fetching favorites:', favoritesError); else setFavorites(favoritesData || []);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'locationId') {
        newState.portId = ''; // Reset port when island changes
      }
      return newState;
    });
  };

  const isDateRangeAvailable = (itemId, itemType, searchStart, searchEnd) => {
    if (!searchStart || !searchEnd) return true;

    const itemBookings = bookings.filter(booking => {
        if (itemType === 'boat') return booking.boat_id === itemId;
        if (itemType === 'patron') return booking.patron_id === itemId;
        return false;
    });

    return !itemBookings.some(booking => {
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        return searchStart < bookingEnd && searchEnd > bookingStart;
    });
  };

  const handleToggleFavorite = async (itemId, itemType) => {
    if (!user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para guardar favoritos." });
      return;
    }

    const existingFavorite = favorites.find(f => f[`${itemType}_id`] === itemId);

    if (existingFavorite) {
      const { error } = await supabase.from('favorites').delete().eq('id', existingFavorite.id);
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo quitar de favoritos." });
      } else {
        setFavorites(prev => prev.filter(f => f.id !== existingFavorite.id));
        toast({ title: "Eliminado de favoritos" });
      }
    } else {
      const { data, error } = await supabase.from('favorites').insert({ user_id: user.id, [`${itemType}_id`]: itemId }).select().single();
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo añadir a favoritos." });
      } else {
        setFavorites(prev => [...prev, data]);
        toast({ title: "Añadido a favoritos" });
      }
    }
  };

  const filteredBoats = useMemo(() => {
    return boats.filter(boat => {
      const { locationId, portId, startDate, endDate, guests } = searchCriteria;
      if (locationId && boat.port?.location?.id !== parseInt(locationId)) return false;
      if (portId && boat.port_id !== parseInt(portId)) return false;
      if (guests && boat.capacity < parseInt(guests)) return false;
      if (startDate && endDate && !isDateRangeAvailable(boat.id, 'boat', new Date(startDate), new Date(endDate))) return false;
      return true;
    });
  }, [boats, bookings, searchCriteria]);
  
  const filteredPatrons = useMemo(() => {
    return patrons.filter(patron => {
        const { locationId, portId, startDate, endDate } = searchCriteria;
        const patronPorts = patron.profile_ports.map(pp => pp.ports).filter(Boolean);
        if (locationId && !patronPorts.some(p => p.location && p.location.id === parseInt(locationId))) return false;
        if (portId && !patronPorts.some(p => p.id === parseInt(portId))) return false;
        if (startDate && endDate && !isDateRangeAvailable(patron.id, 'patron', new Date(startDate), new Date(endDate))) return false;
        return true;
    });
  }, [patrons, bookings, searchCriteria]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
        const { locationId, portId } = searchCriteria;
        const servicePorts = service.service_ports.map(sp => sp.ports).filter(Boolean);
        if (locationId && !servicePorts.some(p => p.location && p.location.id === parseInt(locationId))) return false;
        if (portId && !servicePorts.some(p => p.id === parseInt(portId))) return false;
        return true;
    });
  }, [services, searchCriteria]);

  const availablePorts = useMemo(() => {
    if (!searchCriteria.locationId) return [];
    return ports.filter(p => p.location_id === parseInt(searchCriteria.locationId));
  }, [ports, searchCriteria.locationId]);

  const categories = [
    { id: 'all', name: 'Todo', icon: '🌊' },
    { id: 'boats', name: 'Embarcaciones', icon: '⛵' },
    { id: 'patrons', name: 'Patrones', icon: '👨‍✈️' },
    { id: 'services', name: 'Servicios', icon: '🎯' }
  ];

  const renderBoats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredBoats.map((boat) => (
        <BoatDetailCard 
          key={boat.id} 
          boat={boat} 
          onStartBooking={onStartBooking}
          onViewDetails={() => onViewDetails(boat, 'boat')}
          isFavorite={favorites.some(f => f.boat_id === boat.id)}
          onToggleFavorite={() => handleToggleFavorite(boat.id, 'boat')}
        />
      ))}
    </div>
  );

  const renderServices = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredServices.map((service) => {
        const isFavorite = favorites.some(f => f.service_id === service.id);
        const servicePorts = service.service_ports.map(sp => sp.ports?.name).filter(Boolean).join(', ');
        return (
          <motion.div key={service.id} className="bg-white shadow-md rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all group relative" whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button size="icon" variant="ghost" className="absolute top-2 right-2 z-10 bg-black/20 text-white hover:bg-black/40" onClick={() => handleToggleFavorite(service.id, 'service')}>
              <Heart className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} size={20} />
            </Button>
            <div className="relative h-56">
              <img src={service.image_url || 'https://placehold.co/600x400/e2e8f0/94a3b8/png?text=Servicio'} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white">{service.name}</h3>
                <p className="text-sky-200 text-sm">{service.type}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-slate-600 text-sm mb-4 h-10 overflow-hidden">{service.description}</p>
              <div className="flex items-center text-slate-600 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{servicePorts}</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-slate-800">€{service.price}</span>
                  <span className="text-slate-500 text-sm">/servicio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onViewDetails(service, 'service')}>
                    <Eye size={16} className="mr-2" /> Ver Ficha
                  </Button>
                  <Button onClick={() => onStartServiceBooking(service)} className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white" size="sm">
                    Contratar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  );

  const getLowestPatronPrice = (patron) => {
    const prices = [];
    if (patron.price_per_day) prices.push(patron.price_per_day);
    if (patron.available_slots) {
        patron.available_slots.forEach(slot => {
            if (slot.enabled && slot.price) prices.push(slot.price);
        });
    }
    if (prices.length === 0) return 150; // Default price
    return Math.min(...prices);
  };

  const renderPatrons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPatrons.map((patron) => {
        const isAvailable = isDateRangeAvailable(patron.id, 'patron', new Date(searchCriteria.startDate), new Date(searchCriteria.endDate));
        const lowestPrice = getLowestPatronPrice(patron);
        const patronPorts = patron.profile_ports.map(pp => pp.ports?.name).filter(Boolean).join(', ');
        const isFavorite = favorites.some(f => f.patron_id === patron.id);
        return (
            <motion.div key={patron.id} className="bg-white shadow-md rounded-2xl p-5 border border-slate-200 hover:shadow-xl transition-all group text-center flex flex-col relative" whileHover={{ y: -5 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 z-10 bg-slate-100/50 text-slate-600 hover:bg-slate-200/70" onClick={() => handleToggleFavorite(patron.id, 'patron')}>
                <Heart className={`${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} size={20} />
              </Button>
              <img src={patron.avatar_url || `https://ui-avatars.com/api/?name=${patron.full_name}&background=e2e8f0&color=334155`} alt={patron.full_name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-200 group-hover:border-blue-400 transition-all object-cover" />
              <h3 className="text-xl font-bold text-slate-800">{patron.full_name}</h3>
              <div className="flex justify-center items-center text-yellow-500 my-2">
                <Star size={16} className="mr-1" />
                <span>{patron.rating || 'N/A'}</span>
              </div>
              <p className="text-slate-600 text-sm mb-2">{patron.experience || 'Patrón profesional'}</p>
              <div className="flex items-center justify-center text-slate-600 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{patronPorts || 'Ubicaciones no especificadas'}</span>
              </div>
              <div className="flex justify-between items-center w-full mt-auto pt-4 border-t border-slate-100">
                <div>
                    <span className="text-slate-500 text-sm">Desde </span>
                    <span className="text-lg font-bold text-slate-800">€{lowestPrice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onViewDetails(patron, 'patron')}>
                    <Eye size={16} className="mr-2" /> Ficha
                  </Button>
                  <Button onClick={() => onStartPatronBooking(patron)} disabled={!isAvailable} className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white disabled:opacity-50 disabled:bg-slate-300" size="sm">
                    {isAvailable ? 'Contratar' : 'No disponible'}
                  </Button>
                </div>
              </div>
            </motion.div>
        );
      })}
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="text-center text-slate-500 py-10">Cargando el paraíso náutico...</div>;
    switch (selectedCategory) {
      case 'boats': return renderBoats();
      case 'services': return renderServices();
      case 'patrons': return renderPatrons();
      default:
        return (
          <div className="space-y-12">
            {filteredBoats.length > 0 && <div><h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center"><Sailboat className="mr-3 text-blue-500" />Embarcaciones Destacadas</h2>{renderBoats()}</div>}
            {filteredPatrons.length > 0 && <div><h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center"><User className="mr-3 text-yellow-500" />Patrones Profesionales</h2>{renderPatrons()}</div>}
            {filteredServices.length > 0 && <div><h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center"><Anchor className="mr-3 text-sky-500" />Servicios Premium</h2>{renderServices()}</div>}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Tu Aventura Náutica <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-sky-500">Perfecta</span></h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Descubre el marketplace náutico más completo. Alquila barcos, contrata patrones y servicios premium.</p>
        </motion.div>

        <motion.div className="bg-white shadow-lg rounded-2xl p-4 mb-8 border border-slate-200" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select name="locationId" value={searchCriteria.locationId} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                <option value="">Selecciona una isla</option>
                {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
            <div className="relative">
              <Anchor className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select name="portId" value={searchCriteria.portId} onChange={handleSearchChange} disabled={!searchCriteria.locationId} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="">Selecciona un puerto</option>
                {availablePorts.map(port => <option key={port.id} value={port.id}>{port.name}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="date" name="startDate" value={searchCriteria.startDate} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" min={new Date().toISOString().split("T")[0]} /></div>
            <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} /><input type="date" name="endDate" value={searchCriteria.endDate} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" min={searchCriteria.startDate || new Date().toISOString().split("T")[0]} /></div>
            <Button onClick={() => {}} className="w-full h-full text-lg lg:col-span-1 bg-gradient-to-r from-blue-500 to-sky-500">Buscar</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-3 py-1.5 rounded-lg transition-all text-sm flex items-center space-x-2 ${selectedCategory === category.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`}>
                <span>{category.icon}</span><span>{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default Marketplace;