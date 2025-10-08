import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Shield, Hash, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const EditProviderExtraForm = ({ extraData, providerId, providerType, onSave, onClose }) => {
  const { extra, config } = extraData;
  const [formData, setFormData] = useState({
    price_override: config?.price_override ?? extra.recommended_price,
    included: config?.included ?? false,
    is_obligatory: config?.is_obligatory ?? extra.is_obligatory,
    max_units: config?.max_units ?? extra.max_units,
    deposit_amount: config?.deposit_amount ?? extra.deposit_amount,
    image_url: config?.image_url ?? extra.image_url,
  });
  const [loading, setLoading] = useState(false);
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

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value ? parseFloat(value) : null) : value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileName = `extras_provider/${providerId}-${extra.id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('boat-images').upload(fileName, file);
    if (error) {
      toast({ variant: "destructive", title: "Error de subida", description: error.message });
    } else {
      const { data } = supabase.storage.from('boat-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      toast({ title: "Éxito", description: "Imagen subida correctamente." });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const tableName = getTableName();
    const providerColumn = getProviderColumnName();

    const dataToSubmit = {
      [providerColumn]: providerId,
      extra_id: extra.id,
      ...formData,
    };

    const { error } = await supabase
      .from(tableName)
      .upsert(dataToSubmit, { onConflict: `${providerColumn},extra_id` });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar la configuración del extra." });
      console.error(error);
    } else {
      toast({ title: "Éxito", description: "Configuración del extra guardada." });
      onSave();
    }
    setLoading(false);
  };

  const renderInput = (name, label, placeholder, Icon, type = "text") => (
    <div>
      <Label htmlFor={name} className="block text-slate-700 text-sm font-medium mb-2">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          disabled={formData.included && name === 'price_override'}
        />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Configurar Extra</h2>
            <p className="text-slate-500">{extra.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <Checkbox id="included" checked={formData.included} onCheckedChange={(checked) => handleCheckboxChange('included', checked)} />
            <Label htmlFor="included" className="text-sm font-medium text-slate-800">Incluido en el precio base</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('price_override', 'Precio Personalizado (€)', `Base: ${extra.recommended_price}`, DollarSign, 'number')}
            {renderInput('deposit_amount', 'Depósito (Informativo, €)', `Base: ${extra.deposit_amount || 0}`, Shield, 'number')}
          </div>
          
          {renderInput('max_units', 'Unidades Disponibles', `Base: ${extra.max_units || '∞'}`, Hash, 'number')}

          <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <Checkbox id="is_obligatory" checked={formData.is_obligatory} onCheckedChange={(checked) => handleCheckboxChange('is_obligatory', checked)} />
            <Label htmlFor="is_obligatory" className="text-sm font-medium text-slate-800">Marcar como Obligatorio</Label>
            <AlertCircle className="text-slate-400" size={16} />
          </div>

          <div>
            <Label className="block text-slate-700 text-sm font-medium mb-2">Imagen Personalizada</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                {formData.image_url ? <img src={formData.image_url} alt="Extra" className="w-full h-full object-cover rounded-lg" /> : <ImageIcon className="text-slate-400" size={32} />}
              </div>
              <label className="cursor-pointer bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Upload size={16} className="inline mr-2" />
                Subir Imagen
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
            <p className="text-xs text-yellow-600 mt-2">⚠️ No subas archivos pesados, el sistema los comprimirá automáticamente para optimizar espacio y velocidad.</p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-sky-500 text-white">
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditProviderExtraForm;