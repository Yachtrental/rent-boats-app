import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Key, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PaymentSettings = () => {
  const { toast } = useToast();

  const handleNotImplemented = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 ¡Función no implementada!",
      description: "Esta característica aún no está disponible. ¡Puedes solicitarla en tu próximo prompt! 🚀",
    });
  };

  const handleStripeInfo = (e) => {
    e.preventDefault();
    toast({
      title: "💡 ¿Cómo configurar Stripe?",
      description: (
        <div>
          Para empezar a vender, necesitas configurar Stripe. Consulta{' '}
          <a
            href="https://www.hostinger.com/support/hostinger-horizons-how-to-sell-subscriptions-with-stripe/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-500"
          >
            este artículo
          </a>{' '}
          para obtener una guía paso a paso.
        </div>
      ),
      duration: 10000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-2xl p-6 border border-slate-200"
    >
      <h3 className="text-xl font-bold text-slate-800 mb-2">Configuración de Pagos</h3>
      <p className="text-slate-500 mb-6">Gestiona las pasarelas de pago para tu marketplace.</p>

      <div className="space-y-8">
        {/* Stripe */}
        <div className="border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-slate-800 flex items-center">
                <CreditCard className="mr-3 text-indigo-500" />
                Stripe
              </h4>
              <p className="text-sm text-slate-500 mt-1">Acepta pagos con tarjeta de crédito de forma segura.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">Recomendado</span>
            </div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleStripeInfo}>
            <div>
              <label htmlFor="stripe_pk" className="block text-sm font-medium text-slate-700 mb-1">Clave Publicable (Publishable Key)</label>
              <input type="text" id="stripe_pk" placeholder="pk_test_..." className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="stripe_sk" className="block text-sm font-medium text-slate-700 mb-1">Clave Secreta (Secret Key)</label>
              <input type="password" id="stripe_sk" placeholder="sk_test_..." className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2" size={16} /> Guardar Configuración de Stripe
              </Button>
            </div>
          </form>
        </div>

        {/* PayPal */}
        <div className="border border-slate-200 rounded-xl p-6 opacity-60">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-slate-800 flex items-center">
                <img alt="PayPal Logo" className="w-5 h-5 mr-3" src="https://images.unsplash.com/photo-1642132652860-471b4228023e" />
                PayPal
              </h4>
              <p className="text-sm text-slate-500 mt-1">Permite a tus clientes pagar con su cuenta de PayPal.</p>
            </div>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Próximamente</span>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleNotImplemented}>
            <div>
              <label htmlFor="paypal_id" className="block text-sm font-medium text-slate-700 mb-1">Client ID</label>
              <input type="text" id="paypal_id" disabled className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 cursor-not-allowed" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled>
                <Save className="mr-2" size={16} /> Guardar Configuración de PayPal
              </Button>
            </div>
          </form>
        </div>

        {/* Bank Transfer */}
        <div className="border border-slate-200 rounded-xl p-6 opacity-60">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-slate-800 flex items-center">
                <img alt="Bank Icon" className="w-5 h-5 mr-3" src="https://images.unsplash.com/photo-1649734929640-d0c0f79da545" />
                Transferencia Bancaria
              </h4>
              <p className="text-sm text-slate-500 mt-1">Proporciona tus datos bancarios para recibir pagos directos.</p>
            </div>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Próximamente</span>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleNotImplemented}>
            <div>
              <label htmlFor="bank_details" className="block text-sm font-medium text-slate-700 mb-1">Instrucciones y Datos Bancarios</label>
              <textarea id="bank_details" rows="4" disabled className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 cursor-not-allowed"></textarea>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled>
                <Save className="mr-2" size={16} /> Guardar Datos Bancarios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentSettings;