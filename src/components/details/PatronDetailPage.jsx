import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { ArrowLeft, Star, MapPin, Languages, FileText, User, Anchor, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PatronDetailPage = ({ item, user, onStartPatronBooking, onBack }) => {
  const [patron, setPatron] = useState(item);
  const [similarPatrons, setSimilarPatrons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const { data: patronData, error: patronError } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_ports(ports(id, name, location:locations(name))),
          reviews_for_patron:patron_reviews!patron_id(*, client:profiles!client_id(full_name, avatar_url)),
          patron_extras(*, extra:extras(*))
        `)
        .eq('id', item.id)
        .single();

      if (patronError) {
        console.error("Error fetching patron details:", patronError);
      } else {
        // Manually map the aliased reviews back to a familiar key
        const mappedData = { ...patronData, patron_reviews: patronData.reviews_for_patron };
        delete mappedData.reviews_for_patron;
        setPatron(mappedData);

        const portIds = mappedData.profile_ports.map(pp => pp.ports.id);
        if (portIds.length > 0) {
          const { data: similarData, error: similarError } = await supabase
            .from('profiles')
            .select('*, profile_ports!inner(ports(id, name, location:locations(name)))')
            .in('profile_ports.port_id', portIds)
            .neq('id', mappedData.id)
            .eq('role', 'patron')
            .limit(3);
          
          if (similarError) console.error("Error fetching similar patrons:", similarError);
          else setSimilarPatrons(similarData);
        }
      }
      setLoading(false);
    };

    fetchDetails();
  }, [item.id]);

  if (loading) {
    return <div className="text-center p-10">Cargando perfil del patrón...</div>;
  }

  if (!patron) {
    return <div className="text-center p-10">No se pudo encontrar el patrón.</div>;
  }

  const patronPorts = patron.profile_ports.map(pp => pp.ports.name).join(', ');
  const lowestPrice = patron.available_slots?.filter(s => s.enabled).reduce((min, s) => s.price < min ? s.price : min, Infinity) || patron.price_per_day;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2" size={16} /> Volver al Marketplace
        </Button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 text-center">
              <img src={patron.avatar_url || `https://ui-avatars.com/api/?name=${patron.full_name}&background=e2e8f0&color=334155`} alt={patron.full_name} className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-blue-200" />
              <div className="text-center mb-4">
                <p className="text-slate-600">Desde</p>
                <p className="text-5xl font-bold text-slate-800">€{lowestPrice}</p>
              </div>
              <Button onClick={() => onStartPatronBooking(patron)} size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg hover:shadow-xl transition-shadow">
                ¡Contratar Ahora!
              </Button>
            </div>
            <div className="md:col-span-2">
              <h1 className="text-4xl font-bold text-slate-800">{patron.full_name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-600 my-3">
                <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {patron.rating || 'N/A'} ({patron.patron_reviews?.length || 0} reseñas)</div>
              </div>
              <p className="text-slate-600 mb-6">{patron.experience}</p>
              
              <div className="space-y-3 text-slate-700">
                <div className="flex items-start"><MapPin size={18} className="mr-3 mt-1 text-blue-500 flex-shrink-0" /><span className="font-semibold mr-2">Puertos:</span> {patronPorts}</div>
                <div className="flex items-start"><FileText size={18} className="mr-3 mt-1 text-blue-500 flex-shrink-0" /><span className="font-semibold mr-2">Licencias:</span> {patron.licenses?.join(', ')}</div>
                <div className="flex items-start"><Languages size={18} className="mr-3 mt-1 text-blue-500 flex-shrink-0" /><span className="font-semibold mr-2">Idiomas:</span> {patron.languages?.join(', ')}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Tarifas y Horarios</h3>
              <div className="space-y-2">
                {patron.available_slots?.filter(s => s.enabled).map(slot => (
                  <div key={slot.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center"><Clock size={16} className="mr-2 text-blue-500"/><div><p className="font-semibold">{slot.name}</p><p className="text-xs text-slate-500">{slot.time}</p></div></div>
                    <p className="font-bold text-slate-800">€{slot.price}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Extras Personales</h3>
              <div className="space-y-2">
                {patron.patron_extras?.map(({ extra, price_override }) => (
                  <div key={extra.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold">{extra.name}</p>
                    <p className="font-bold text-slate-800">€{price_override || extra.recommended_price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Reseñas de Clientes</h2>
            <div className="space-y-6">
              {patron.patron_reviews && patron.patron_reviews.length > 0 ? patron.patron_reviews.map(review => (
                <div key={review.id} className="flex gap-4 border-b border-slate-100 pb-4">
                  <img src={review.client.avatar_url || `https://ui-avatars.com/api/?name=${review.client.full_name}`} alt={review.client.full_name} className="w-12 h-12 rounded-full" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{review.client.full_name}</p>
                      <div className="flex items-center text-yellow-500">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-current' : ''} />)}</div>
                    </div>
                    <p className="text-slate-600 mt-1">{review.comment}</p>
                  </div>
                </div>
              )) : <p className="text-slate-500">Este patrón aún no tiene reseñas.</p>}
            </div>
          </div>
        </div>

        {similarPatrons.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center"><User className="mr-3 text-yellow-500" /> Patrones Similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarPatrons.map(p => (
                <div key={p.id} className="bg-white shadow-md rounded-2xl p-5 border border-slate-200 text-center">
                  <img src={p.avatar_url || `https://ui-avatars.com/api/?name=${p.full_name}`} alt={p.full_name} className="w-20 h-20 rounded-full mx-auto mb-3" />
                  <h3 className="font-bold">{p.full_name}</h3>
                  <p className="text-sm text-slate-500 truncate">{p.profile_ports.map(pp => pp.ports.name).join(', ')}</p>
                  <Button size="sm" className="mt-4 w-full" onClick={() => window.location.reload()}>Ver Ficha</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatronDetailPage;