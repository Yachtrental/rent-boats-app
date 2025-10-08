import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package, FileText, DollarSign, Briefcase, Tag, Repeat, Shield, Hash, Eye, EyeOff, AlertCircle, Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const EditExtraForm = ({ extra, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: extra.name || '',
    description: extra.description || '',
    recommended_price: extra.recommended_price || extra.price || 0,
    applicable_to_role: extra.applicable_to_role || 'armador',
    category: extra.category || 'general',
    pricing_model: extra.pricing_model || 'fixed',
    deposit_amount: extra.deposit_amount || 0,
    allow_quantity: extra.allow_quantity || false,
    is_obligatory: extra.is_obligatory || false,
    is_visible_to_client: extra.is_visible_to_client === false ? false : true,
    max_units: extra.max_units || null,
    image_url: extra.image_url || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    const fileName = `extras/${Date.now()}-${file.name}`;
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

    const dataToSubmit = {
      ...formData,
      price: formData.recommended_price, // Keep price field for compatibility if needed
    };

    let error;
    if (extra.id) {
      ({ error } = await supabase.from('extras').update(dataToSubmit).eq('id', extra.id));
    } else {
      ({ error } = await supabase.from('extras').insert(dataToSubmit));
    }

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el extra." });
    } else {
      toast({ title: "Éxito", description: `Extra ${extra.id ? 'actualizado' : 'creado'} correctamente.` });
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
        />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-3xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{extra.id ? 'Editar Extra' : 'Crear Nuevo Extra'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput('name', 'Nombre del Extra', 'Ej: Paddle Surf', Package)}
            {renderInput('description', 'Descripción', 'Breve descripción del extra', FileText)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="pricing_model" className="block text-slate-700 text-sm font-medium mb-2">Modelo de Precio</Label>
              <div className="relative">
                <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select id="pricing_model" name="pricing_model" value={formData.pricing_model} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="fixed">Fijo por reserva</option>
                  <option value="per_day">Por día</option>
                  <option value="per_slot">Por tramo horario</option>
                </select>
              </div>
            </div>
            {renderInput('recommended_price', 'Precio Base (€)', 'Ej: 25', DollarSign, 'number')}
            {renderInput('deposit_amount', 'Depósito (Informativo, €)', 'Ej: 200', Shield, 'number')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="category" className="block text-slate-700 text-sm font-medium mb-2">Categoría</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="general">General</option>
                  <option value="equipment">Equipamiento</option>
                  <option value="food_drinks">Comida y Bebida</option>
                  <option value="leisure">Ocio</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="applicable_to_role" className="block text-slate-700 text-sm font-medium mb-2">Aplicable al Rol</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <select id="applicable_to_role" name="applicable_to_role" value={formData.applicable_to_role} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="armador">Armador</option>
                  <option value="patron">Patrón</option>
                  <option value="servicios">Servicios</option>
                </select>
              </div>
            </div>
            {renderInput('max_units', 'Unidades Máximas', 'Ej: 2', Hash, 'number')}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Checkbox id="is_obligatory" checked={formData.is_obligatory} onCheckedChange={(checked) => handleCheckboxChange('is_obligatory', checked)} />
              <Label htmlFor="is_obligatory" className="text-sm font-medium text-slate-800">Extra Obligatorio</Label>
              <AlertCircle className="text-slate-400" size={16} />
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Checkbox id="allow_quantity" checked={formData.allow_quantity} onCheckedChange={(checked) => handleCheckboxChange('allow_quantity', checked)} />
              <Label htmlFor="allow_quantity" className="text-sm font-medium text-slate-800">Permitir al cliente seleccionar cantidad</Label>
              <Hash className="text-slate-400" size={16} />
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Checkbox id="is_visible_to_client" checked={formData.is_visible_to_client} onCheckedChange={(checked) => handleCheckboxChange('is_visible_to_client', checked)} />
              <Label htmlFor="is_visible_to_client" className="text-sm font-medium text-slate-800">Visible para el cliente</Label>
              {formData.is_visible_to_client ? <Eye className="text-slate-400" size={16} /> : <EyeOff className="text-slate-400" size={16} />}
            </div>
          </div>

          <div>
            <Label className="block text-slate-700 text-sm font-medium mb-2">Imagen del Extra</Label>
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

export default EditExtraForm;