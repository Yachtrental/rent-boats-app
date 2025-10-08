import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, User, UserCheck, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const PasswordValidator = ({ password }) => {
  const checks = useMemo(() => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const validationItems = [
    { key: 'length', text: 'Mínimo 8 caracteres' },
    { key: 'lowercase', text: 'Una letra minúscula' },
    { key: 'uppercase', text: 'Una letra mayúscula' },
    { key: 'number', text: 'Un número' },
    { key: 'special', text: 'Un carácter especial' },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
      {validationItems.map(item => (
        <div key={item.key} className={`flex items-center transition-colors ${checks[item.key] ? 'text-green-600' : 'text-slate-500'}`}>
          {checks[item.key] ? <CheckCircle size={14} className="mr-1.5" /> : <XCircle size={14} className="mr-1.5" />}
          {item.text}
        </div>
      ))}
    </div>
  );
};

const RegisterForm = ({ onClose, onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cliente'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const isPasswordValid = useMemo(() => {
    const { password } = formData;
    return password.length >= 8 &&
           /[a-z]/.test(password) &&
           /[A-Z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
  }, [formData.password]);

  const roles = [
    { value: 'cliente', label: 'Cliente', description: 'Quiero alquilar barcos y servicios' },
    { value: 'patron', label: 'Patrón', description: 'Quiero ofrecer mis servicios de navegación' },
    { value: 'armador', label: 'Armador', description: 'Quiero alquilar mis embarcaciones' },
    { value: 'servicios', label: 'Servicios', description: 'Quiero ofrecer servicios náuticos' },
    { value: 'colaborador', label: 'Colaborador', description: 'Quiero gestionar reservas para clientes' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Las contraseñas no coinciden." });
      return;
    }
    if (!isPasswordValid) {
      toast({ variant: "destructive", title: "Contraseña Débil", description: "La contraseña no cumple los requisitos de seguridad." });
      return;
    }
    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, {
      data: { full_name: formData.name, role: formData.role }
    });
    if (!error) {
      onRegisterSuccess();
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-lg border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Crear Cuenta</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tu nombre completo" required />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="tu@email.com" required />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Crea una contraseña segura" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <PasswordValidator password={formData.password} />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">Repetir Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full pl-10 pr-10 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Confirma tu contraseña" required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden.</p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-3">Tipo de Cuenta</label>
            <div className="space-y-2">
              {roles.map((role) => (
                <label key={role.value} className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${formData.role === role.value ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  <input type="radio" name="role" value={role.value} checked={formData.role === role.value} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="sr-only" />
                  <div className="flex items-center">
                    <UserCheck className="text-slate-500 mr-3" size={20} />
                    <div>
                      <div className="text-slate-800 font-medium">{role.label}</div>
                      <div className="text-slate-600 text-sm">{role.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">¿Ya tienes cuenta?{' '}
            <button onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-700 font-semibold">Inicia sesión aquí</button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RegisterForm;