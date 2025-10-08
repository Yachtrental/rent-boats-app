
import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Users, BedDouble, Bath, Wind, Compass, LifeBuoy, Refrigerator, Tv, Wifi, Check, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const featureIcons = {
  gps: { icon: Compass, name: 'GPS' },
  autopilot: { icon: Wind, name: 'Piloto automático' },
  lifesaving: { icon: LifeBuoy, name: 'Chalecos salvavidas' },
  kitchen: { icon: Refrigerator, name: 'Cocina' },
  tv: { icon: Tv, name: 'TV' },
  wifi: { icon: Wifi, name: 'Wi-Fi' },
  air_conditioning: { icon: Wind, name: 'Aire Acondicionado' },
};

const BoatDetailCard = ({ boat, onStartBooking, onViewDetails, isFavorite, onToggleFavorite }) => {
  const mainImage = boat.boat_images?.find(img => img.is_main) || boat.boat_images?.[0];
  
  const getLowestPrice = () => {
    if (!boat.available_slots || boat.available_slots.length === 0) {
      return boat.price_full_day || boat.price;
    }
    const prices = boat.available_slots
      .filter(slot => slot.enabled && slot.price > 0)
      .map(slot => slot.price);
    
    if (prices.length === 0) {
      return boat.price_full_day || boat.price;
    }
    
    return Math.min(...prices);
  };

  const displayPrice = getLowestPrice();

  return (
    <motion.div
      className="bg-white shadow-md rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all group flex flex-col"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-56 cursor-pointer" onClick={() => onViewDetails(boat)}>
        <img 
          src={mainImage?.image_url || 'https://placehold.co/600x400/e2e8f0/94a3b8/png?text=Rent-boats.com'} 
          alt={boat.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center text-white text-sm">
          <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
          {boat.rating || 'N/A'}
        </div>
        <Button size="icon" variant="ghost" className="absolute top-4 right-4 bg-black/30 text-white hover:bg-black/50 hover:text-white" onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}>
          <Heart className={`transition-all ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </Button>
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold text-white">{boat.name}</h3>
          <p className="text-sky-200 text-sm">{boat.model || boat.type}</p>
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex items-center text-slate-600 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{boat.port?.name || boat.location}, {boat.port?.location?.name}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center text-slate-700 text-sm mb-4">
          <div className="flex flex-col items-center"><Users size={20} className="mb-1 text-blue-500"/><span>{boat.capacity}</span></div>
          <div className="flex flex-col items-center"><BedDouble size={20} className="mb-1 text-blue-500"/><span>{boat.cabins || '0'}</span></div>
          <div className="flex flex-col items-center"><Bath size={20} className="mb-1 text-blue-500"/><span>{boat.bathrooms || '0'}</span></div>
        </div>

        {boat.features && boat.features.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-slate-600 mb-2">Equipamiento:</h4>
            <div className="flex flex-wrap gap-2">
              {boat.features.slice(0, 4).map(featureId => {
                const feature = featureIcons[featureId];
                if (!feature) return null;
                const Icon = feature.icon;
                return (
                  <div key={featureId} className="flex items-center bg-slate-100 rounded-full px-2 py-1 text-xs text-slate-700">
                    <Icon size={14} className="mr-1.5 text-blue-500" />
                    {feature.name}
                  </div>
                );
              })}
              {boat.features.length > 4 && (
                <div className="flex items-center bg-slate-100 rounded-full px-2 py-1 text-xs text-slate-700">
                  <Check size={14} className="mr-1.5 text-blue-500" />
                  +{boat.features.length - 4} más
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
          <div>
            <span className="text-slate-500 text-sm">Desde </span>
            <span className="text-2xl font-bold text-slate-800">€{displayPrice}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewDetails(boat)}>
              <Eye size={16} className="mr-2" /> Ver Ficha
            </Button>
            <Button
              onClick={() => onStartBooking(boat)}
              className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
              size="sm"
            >
              Reservar
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BoatDetailCard;