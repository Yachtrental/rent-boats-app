import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Package, DollarSign, Shield, AlertCircle, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import EditProviderExtraForm from '@/components/dashboards/forms/EditProviderExtraForm';

const ExtrasManager = ({ providerId, providerType, userRole }) => {
  const [allExtras, setAllExtras] = useState([]);
  const [providerExtras, setProviderExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExtra, setEditingExtra] = useState(null);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const { toast } = useToast();

  const getTableName = () => {
    switch (providerType) {
      case 'boat': return 'boat_extras';
      case 'patron': return 'patron_extras';
      case 'service': return 'service_extras';
      default: throw new Error('Invalid provider type');
    }
  };

  const getProviderColumnName = () => {
    switch (providerType) {
      case 'boat': return 'boat_id';
      case 'patron': return 'patron_id';
      case 'service': return 'service_id';
      default: throw new Error('Invalid provider type');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const tableName = getTableName();
    const providerColumn = getProviderColumnName();

    const { data: allExtrasData, error: allExtrasError } = await supabase
      .from('extras')
      .select('*')
      .or(`applicable_to_role.eq.${userRole},applicable_to_role.is.null`);

    const { data: providerExtrasData, error: providerExtrasError } = await supabase
      .from(tableName)
      .select('*, extra:extras(*)')
      .eq(providerColumn, providerId);

    if (allExtrasError || providerExtrasError) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los extras." });
    } else {
      setAllExtras(allExtrasData || []);
      setProviderExtras(providerExtrasData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (providerId) fetchData();
  }, [providerId]);

  const handleAddExtra = async (extraId) => {
    const tableName = getTableName();
    const providerColumn = getProviderColumnName();
    const extraToAdd = allExtras.find(e => e.id === extraId);
    
    const { error } = await supabase.from(tableName).insert({ 
      [providerColumn]: providerId, 
      extra_id: extraId,
      included: false,
      is_obligatory: extraToAdd.is_obligatory,
      price_override: extraToAdd.recommended_price,
      deposit_amount: extraToAdd.deposit_amount,
      max_units: extraToAdd.max_units,
      image_url: extraToAdd.image_url,
    });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo añadir el extra." });
    } else {
      toast({ title: "Éxito", description: "Extra añadido. Ahora puedes configurarlo." });
      fetchData();
      setShowAddExtra(false);
    }
  };

  const handleDeleteExtra = async (extraId) => {
    const tableName = getTableName();
    const providerColumn = getProviderColumnName();
    const { error } = await supabase.from(tableName).delete().eq(providerColumn, providerId).eq('extra_id', extraId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el extra." });
    } else {
      toast({ title: "Éxito", description: "Extra eliminado." });
      fetchData();
    }
  };

  const availableExtrasToAdd = allExtras.filter(
    (extra) => !providerExtras.some((pe) => pe.extra_id === extra.id)
  );

  const pricingModelText = {
    'fixed': 'Fijo',
    'per_day': 'Por día',
    'per_slot': 'Por tramo',
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-2xl p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Extras</h2>
          <Button onClick={() => setShowAddExtra(true)} className="bg-gradient-to-r from-blue-500 to-sky-500 text-white"><Plus size={20} className="mr-2" />Añadir Extra</Button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <p>Cargando extras...</p>
          ) : providerExtras.length > 0 ? (
            providerExtras.map(({ extra, ...config }) => (
              <div key={extra.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-all">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    <img className="w-full h-full object-cover" alt={extra.name} src={config.image_url || extra.image_url || 'https://placehold.co/300x300/e2e8f0/94a3b8/png?text=Extra'} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">{extra.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mt-1">
                      <span className="flex items-center gap-1"><DollarSign size={14} /> {config.included ? 'Incluido' : `€${config.price_override ?? extra.recommended_price}`}</span>
                      <span className="flex items-center gap-1"><Repeat size={14} /> {pricingModelText[extra.pricing_model] || 'Fijo'}</span>
                      {config.deposit_amount > 0 && <span className="flex items-center gap-1"><Shield size={14} /> Fianza: €{config.deposit_amount}</span>}
                      {config.is_obligatory && <span className="flex items-center gap-1 text-red-600 font-medium"><AlertCircle size={14} /> Obligatorio</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button onClick={() => setEditingExtra({ extra, config })} size="sm" variant="outline"><Edit size={16} className="mr-1" />Configurar</Button>
                    <Button onClick={() => handleDeleteExtra(extra.id)} size="sm" variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200"><Trash2 size={16} className="mr-1" />Eliminar</Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-8">No has añadido ningún extra.</p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddExtra && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddExtra(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-md border border-slate-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Añadir un Extra</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableExtrasToAdd.length > 0 ? availableExtrasToAdd.map(extra => (
                  <div key={extra.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <Package className="text-slate-500" />
                      <div>
                        <p className="font-semibold text-slate-800">{extra.name}</p>
                        <p className="text-xs text-slate-500">Precio base: €{extra.recommended_price}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAddExtra(extra.id)}>Añadir</Button>
                  </div>
                )) : <p className="text-center text-slate-500 py-4">No hay más extras disponibles para añadir.</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingExtra && (
          <EditProviderExtraForm
            extraData={editingExtra}
            providerId={providerId}
            providerType={providerType}
            onClose={() => setEditingExtra(null)}
            onSave={() => {
              fetchData();
              setEditingExtra(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ExtrasManager;