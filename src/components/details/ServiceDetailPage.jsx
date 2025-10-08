import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { ArrowLeft, Star, MapPin, Anchor, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ServiceDetailPage = ({ item, user, onBack, onStartServiceBooking }) => {
  const [service, setService] = useState(item);
  const [similarServices, setSimilarServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*, provider:profiles(full_name, avatar_url), service_ports(ports(id, name, location:locations(name))), service_extras(*, extra:extras(*))')
        .eq('id', item.id)
        .single();

      if (serviceError) {
        console.error("Error fetching service details:", serviceError);
      } else {
        setService(serviceData);
        const portIds = serviceData.service_ports.map(sp => sp.ports.id);
        if (portIds.length > 0) {
          const { data: similarData, error: similarError } = await supabase
            .from('services')
            .select('*, service_ports!inner(ports(id, name, location:locations(name)))')
            .in('service_ports.port_id', portIds)
            .neq('id', serviceData.id)
            .limit(3);
          
          if (similarError) console.error("Error fetching similar services:", similarError);
          else setSimilarServices(similarData);
        }
      }
      setLoading(false);
    };

    fetchDetails();
  }, [item.id]);

  if (loading) {
    return <div className="text-center p-10">Cargando detalles del servicio...</div>;
  }

  if (!service) {
    return <div className="text-center p-10">No se pudo encontrar el servicio.</div>;
  }

  const servicePorts = service.service_ports.map(sp => sp.ports.name).join(', ');

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2" size={16} /> Volver al Marketplace
        </Button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-80 md:h-auto bg-slate-200">
              <img src={service.image_url || 'https://placehold.co/600x400/e2e8f0/94a3b8/png?text=Servicio'} alt={service.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 flex flex-col">
              <h1 className="text-3xl font-bold text-slate-800">{service.name}</h1>
              <p className="text-slate-500 mb-4 capitalize">{service.type}</p>
              <p className="text-slate-600 flex-grow mb-6">{service.description}</p>
              
              <div className="space-y-2 text-slate-700 mb-6">
                <div className="flex items-center"><MapPin size={16} className="mr-2 text-blue-500" /> {servicePorts}</div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-200">
                <div className="text-center mb-4">
                  <p className="text-slate-600">Precio</p>
                  <p className="text-5xl font-bold text-slate-800">€{service.price}</p>
                </div>
                <Button onClick={() => onStartServiceBooking(service)} size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-shadow">
                  ¡Contratar Servicio!
                </Button>
              </div>
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Extras Disponibles</h3>
            <div className="space-y-2">
              {service.service_extras?.map(({ extra, price_override }) => (
                <div key={extra.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-semibold">{extra.name}</p>
                  <p className="font-bold text-slate-800">€{price_override || extra.recommended_price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {similarServices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center"><Briefcase className="mr-3 text-sky-500" /> Servicios Similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarServices.map(s => (
                <div key={s.id} className="bg-white shadow-md rounded-2xl p-5 border border-slate-200">
                  <img src={s.image_url || 'https://placehold.co/600x400/e2e8f0/94a3b8/png?text=Servicio'} alt={s.name} className="w-full h-32 object-cover rounded-lg mb-4" />
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{s.service_ports.map(sp => sp.ports.name).join(', ')}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold">€{s.price}</span>
                    <Button size="sm" variant="outline" onClick={() => window.location.reload()}>Ver Ficha</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailPage;