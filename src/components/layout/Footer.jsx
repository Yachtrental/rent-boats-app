import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Mail, Phone, Instagram as Whatsapp } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Footer = ({ onViewChange }) => {
  const { toast } = useToast();
  const handleNotImplemented = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 ¡Próximamente!",
      description: "Esta sección aún no está disponible, ¡pero llegará pronto!",
    });
  };

  const handleLinkClick = (e, view) => {
    e.preventDefault();
    if (onViewChange) {
      onViewChange(view);
    } else {
      handleNotImplemented(e);
    }
  };

  const socialLinks = [
    { icon: <Instagram size={20} />, href: "https://instagram.com", name: "Instagram" },
    { icon: <Facebook size={20} />, href: "https://facebook.com", name: "Facebook" },
    { icon: <Twitter size={20} />, href: "https://twitter.com", name: "Twitter" },
    { icon: <Linkedin size={20} />, href: "https://linkedin.com", name: "LinkedIn" },
    { icon: <Youtube size={20} />, href: "https://youtube.com", name: "YouTube" },
  ];

  const quickLinks = [
    { name: "Inicio", view: "marketplace" },
    { name: "Marketplace", view: "marketplace" },
    { name: "Sobre nosotros", view: null },
    { name: "Contacto", view: null },
    { name: "Blog", view: "blog" },
  ];

  const legalLinks = [
    { name: "Aviso legal", view: null },
    { name: "Política de privacidad", view: null },
    { name: "Política de cookies", view: null },
    { name: "Términos y condiciones", view: null },
  ];

  const resourceLinks = [
    { name: "Guías para navegar", view: null },
    { name: "Seguros náuticos", view: null },
    { name: "Nuestros partners", view: null },
    { name: "Tutoriales", view: null },
  ];

  return (
    <footer className="bg-slate-100 text-slate-600 border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚓</span>
              </div>
              <span className="text-slate-800 font-bold text-xl">Rent-boats.com</span>
            </div>
            <p className="mt-4 text-sm">Tu aventura náutica perfecta empieza aquí. Alquila barcos, contrata patrones y servicios premium.</p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-800 tracking-wider uppercase">Navegación</p>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href="#" onClick={(e) => link.view ? handleLinkClick(e, link.view) : handleNotImplemented(e)} className="hover:text-slate-900 transition-colors">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-800 tracking-wider uppercase">Legal</p>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a href="#" onClick={handleNotImplemented} className="hover:text-slate-900 transition-colors">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <p className="font-semibold text-slate-800 tracking-wider uppercase">Recursos</p>
            <ul className="mt-4 space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <a href="#" onClick={handleNotImplemented} className="hover:text-slate-900 transition-colors">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-800 tracking-wider uppercase">Contacto</p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start">
                <Mail size={18} className="mr-3 mt-1 flex-shrink-0" />
                <a href="mailto:info@rent-boats.com" className="hover:text-slate-900 transition-colors">info@rent-boats.com</a>
              </li>
              <li className="flex items-start">
                <Whatsapp size={18} className="mr-3 mt-1 flex-shrink-0" />
                <a href="https://wa.me/34633141030" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors" aria-label="Chatea con nosotros por WhatsApp">+34 633 14 10 30</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Rent-boats.com. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;