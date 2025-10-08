
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { ArrowLeft, Star, MapPin, Users, BedDouble, Bath, Wind, Compass, LifeBuoy, Refrigerator, Tv, Wifi, Check, Sailboat, FileText, Shield, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BoatDetailCard from '@/components/marketplace/BoatDetailCard';
import ImageLightbox from '@/components/details/ImageLightbox';

const featureIcons = {
  gps: { icon: Compass, name: 'GPS' },
  autopilot: { icon: Wind, name: 'Piloto automático' },
  lifesaving: { icon: LifeBuoy, name: 'Chalecos salvavidas' },
  kitchen: { icon: Refrigerator, name: 'Cocina' },
  tv: { icon: Tv, name: 'TV' },
  wifi: { icon: Wifi, name: 'Wi-Fi' },
  air_conditioning: { icon: Wind, name: 'Aire Acondicionado' },
};

const variants = {
  enter: (direction) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

const BoatDetailPage = ({ item, user, onStartBooking, onBack }) => {
  const [boat, setBoat] = useState(item);
  const [similarBoats, setSimilarBoats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [[page, direction], setPage] = useState([0, 0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const { data: boatData, error: boatError } = await supabase
        .from('boats')
        .select('*, owner:owner_id(full_name, avatar_url), boat_images(*), port:ports(*, location:locations(*)), reviews(*, client:profiles(full_name, avatar_url)), boat_extras(*, extra:extras(*))')
        .eq('id', item.id)
        .single();

      if (boatError) {
        console.error("Error fetching boat details:", boatError);
      } else {
        setBoat(boatData);
        if (boatData.port_id) {
          const { data: similarData, error: similarError } = await supabase
            .from('boats')
            .select('*, boat_images(image_url, is_main), port:ports(name, location:locations(name))')
            .eq('port_id', boatData.port_id)
            .neq('id', boatData.id)
            .limit(3);
          
          if (similarError) console.error("Error fetching similar boats:", similarError);
          else setSimilarBoats(similarData);
        }
      }
      setLoading(false);
    };

    fetchDetails();
  }, [item.id]);

  const allImages = boat?.boat_images?.sort((a, b) => (a.is_main ? -1 : 1)).map(img => img.image_url) || [];
  const imageIndex = page % (allImages.length || 1);

  const paginate = (newDirection) => {
    setPage([(page + newDirection + allImages.length) % allImages.length, newDirection]);
  };
  
  const openLightbox = () => {
    if (allImages.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Cargando detalles de la embarcación...</div>;
  }

  if (!boat) {
    return <div className="text-center p-10">No se pudo encontrar la embarcación.</div>;
  }

  const lowestPrice = boat.available_slots?.filter(s => s.enabled).reduce((min, s) => s.price < min ? s.price : min, Infinity) || boat.price;

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2" size={16} /> Volver al Marketplace
          </Button>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="lg:col-span-3 relative h-64 md:h-96 lg:h-[500px] bg-slate-200 overflow-hidden cursor-pointer" onClick={openLightbox}>
                <AnimatePresence initial={false} custom={direction}>
                  <motion.img
                    key={page}
                    src={allImages[imageIndex] || 'https://placehold.co/800x600'}
                    alt={`${boat.name} - imagen ${imageIndex + 1}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                      e.stopPropagation();
                      const swipe = swipePower(offset.x, velocity.x);
                      if (swipe < -swipeConfidenceThreshold) {
                        paginate(1);
                      } else if (swipe > swipeConfidenceThreshold) {
                        paginate(-1);
                      }
                    }}
                    className="absolute w-full h-full object-cover"
                  />
                </AnimatePresence>
                {allImages.length > 1 && (
                  <>
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
                      <Button size="icon" variant="secondary" className="rounded-full bg-white/70 hover:bg-white" onClick={(e) => { e.stopPropagation(); paginate(-1); }}>
                        <ChevronLeft />
                      </Button>
                    </div>
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10">
                      <Button size="icon" variant="secondary" className="rounded-full bg-white/70 hover:bg-white" onClick={(e) => { e.stopPropagation(); paginate(1); }}>
                        <ChevronRight />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            const newDirection = i > imageIndex ? 1 : -1;
                            setPage([i, newDirection]);
                          }}
                          className={`w-2 h-2 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-2 p-6 flex flex-col">
                <h1 className="text-3xl font-bold text-slate-800">{boat.name}</h1>
                <p className="text-slate-500 mb-2">{boat.model} ({boat.year})</p>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1"><MapPin size={14} /> {boat.port.name}, {boat.port.location.name}</div>
                  <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500" /> {boat.rating || 'N/A'} ({boat.reviews?.length || 0} reseñas)</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center text-slate-700 my-4">
                  <div className="flex flex-col items-center"><Users size={24} className="mb-1 text-blue-500"/><span>{boat.capacity} Pasajeros</span></div>
                  <div className="flex flex-col items-center"><BedDouble size={24} className="mb-1 text-blue-500"/><span>{boat.cabins || '0'} Camarotes</span></div>
                  <div className="flex flex-col items-center"><Bath size={24} className="mb-1 text-blue-500"/><span>{boat.bathrooms || '0'} Baños</span></div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200">
                  <div className="text-center mb-4">
                    <p className="text-slate-600">Desde</p>
                    <p className="text-5xl font-bold text-slate-800">€{lowestPrice}</p>
                  </div>
                  <Button onClick={() => onStartBooking(boat)} size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg hover:shadow-xl transition-shadow">
                    ¡Reservar Ahora!
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Acerca de esta embarcación</h2>
                  <p className="text-slate-600 whitespace-pre-wrap mb-6">{boat.description}</p>

                  <h3 className="text-xl font-bold text-slate-800 mt-6 mb-4">Equipamiento</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {boat.features?.map(featureId => {
                      const feature = featureIcons[featureId];
                      if (!feature) return null;
                      return <div key={featureId} className="flex items-center"><feature.icon size={20} className="mr-2 text-blue-500" /><span className="text-slate-700">{feature.name}</span></div>;
                    })}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Tarifas y Horarios</h3>
                  <div className="space-y-2">
                    {boat.available_slots?.filter(s => s.enabled).map(slot => (
                      <div key={slot.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center"><Clock size={16} className="mr-2 text-blue-500"/><div><p className="font-semibold">{slot.name}</p><p className="text-xs text-slate-500">{slot.time}</p></div></div>
                        <p className="font-bold text-slate-800">€{slot.price}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Extras Disponibles</h3>
                  <div className="space-y-2">
                    {boat.boat_extras?.map(({ extra, price_override }) => (
                      <div key={extra.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="font-semibold">{extra.name}</p>
                        <p className="font-bold text-slate-800">€{price_override || extra.recommended_price}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Armador</h3>
                    <div className="flex items-center gap-4">
                      <img src={boat.owner.avatar_url || `https://ui-avatars.com/api/?name=${boat.owner.full_name}`} alt={boat.owner.full_name} className="w-16 h-16 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-800">{boat.owner.full_name}</p>
                        <p className="text-sm text-slate-500">Miembro desde {new Date(boat.created_at).getFullYear()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">Información Adicional</h3>
                    <div className="flex items-start"><FileText size={18} className="mr-3 mt-1 text-blue-500 flex-shrink-0" /><span className="font-semibold mr-2">Política de cancelación:</span> {boat.cancellation_policy || 'Consultar con el armador.'}</div>
                    <div className="flex items-start"><Shield size={18} className="mr-3 mt-1 text-blue-500 flex-shrink-0" /><span className="font-semibold mr-2">Fianza:</span> €{boat.deposit || '0'}</div>
                  </div>
                </div>
              </div>
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Reseñas de Clientes</h2>
                <div className="space-y-6">
                  {boat.reviews && boat.reviews.length > 0 ? boat.reviews.map(review => (
                    <div key={review.id} className="flex gap-4 border-b border-slate-100 pb-4">
                      <img src={review.client.avatar_url || `https://ui-avatars.com/api/?name=${review.client.full_name}`} alt={review.client.full_name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{review.client.full_name}</p>
                          <div className="flex items-center text-yellow-500">{[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-current' : ''} />)}</div>
                        </div>
                        <p className="text-slate-600 mt-1">{review.comment}</p>
                      </div>
                    </div>
                  )) : <p className="text-slate-500">Esta embarcación aún no tiene reseñas.</p>}
                </div>
              </div>
            </div>
          </div>

          {similarBoats.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center"><Sailboat className="mr-3 text-blue-500" /> Similares en {boat.port.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {similarBoats.map(similarBoat => <BoatDetailCard key={similarBoat.id} boat={similarBoat} onStartBooking={onStartBooking} onViewDetails={() => window.location.reload()} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages}
        startIndex={imageIndex}
      />
    </>
  );
};

export default BoatDetailPage;