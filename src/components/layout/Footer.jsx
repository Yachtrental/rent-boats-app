import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
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

  // Social media links - BLOQUE 1
  const socialLinks = [
    { icon: <Instagram size={24} />, href: "https://www.instagram.com/rentboats", name: "Instagram" },
    { icon: <Facebook size={24} />, href: "https://www.facebook.com/rentboats", name: "Facebook" },
    { icon: <Linkedin size={24} />, href: "https://www.linkedin.com/company/rentboats", name: "LinkedIn" },
  ];

  // BLOQUE 2 – Explorar
  const explorarLinks = [
    { name: "Inicio", href: "/" },
    { name: "¿Quiénes somos?", href: "/quienes-somos" },
    { name: "¿Cómo funciona?", href: "/como-funciona" },
    { name: "Blog & Noticias", href: "/blog" },
    { name: "Contacto", href: "/contacto" },
  ];

  // BLOQUE 3 – Legal
  const legalLinks = [
    { name: "Aviso Legal", href: "/legal/aviso-legal" },
    { name: "Política de Privacidad", href: "/legal/politica-de-privacidad" },
    { name: "Política de Cookies", href: "/legal/politica-de-cookies" },
    { name: "Términos y Condiciones", href: "/legal/terminos-y-condiciones" },
    { name: "Resolución de Conflictos", href: "/legal/resolucion-de-conflictos" },
  ];

  // BLOQUE 4 – Marketplace / Soporte
  const marketplaceLinks = [
    { name: "Centro de ayuda", href: "/marketplace/centro-de-ayuda" },
    { name: "Gestión de reseñas", href: "/marketplace/gestion-de-resenas" },
    { name: "Posicionamiento de anuncios", href: "/marketplace/posicionamiento-de-anuncios" },
    { name: "Políticas de cancelación", href: "/marketplace/politicas-de-cancelacion" },
    { name: "Preguntas frecuentes (FAQ)", href: "/marketplace/faq" },
  ];

  // BLOQUE 5 – Profesionales
  const profesionalesLinks = [
    { name: "Alta de armador", href: "/marketplace/alta-armador" },
    { name: "Alta de patrón", href: "/marketplace/alta-patron" },
    { name: "Alta de empresa de servicios", href: "/marketplace/alta-servicio" },
    { name: "Programa de colaboradores", href: "/colaboradores" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          
          {/* BLOQUE 1 – Rent-Boats.com */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">Rent-Boats.com</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Marketplace náutico de Baleares. Alquila, navega y disfruta con seguridad, transparencia y experiencias únicas.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-3 rounded-full text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* BLOQUE 2 – Explorar */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Explorar</h3>
            <ul className="space-y-3">
              {explorarLinks.map((link, index) => (
                <li key={index}>
                  <motion.a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                    whileHover={{ x: 5 }}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* BLOQUE 3 – Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <motion.a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                    whileHover={{ x: 5 }}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* BLOQUE 4 – Marketplace / Soporte */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Marketplace</h3>
            <ul className="space-y-3">
              {marketplaceLinks.map((link, index) => (
                <li key={index}>
                  <motion.a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                    whileHover={{ x: 5 }}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* BLOQUE 5 – Profesionales */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Profesionales</h3>
            <ul className="space-y-3">
              {profesionalesLinks.map((link, index) => (
                <li key={index}>
                  <motion.a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                    whileHover={{ x: 5 }}
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* BLOQUE FINAL – Pie inferior */}
      <div className="bg-slate-950 border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center text-center">
            <div className="text-sm text-gray-400">
              © {currentYear} Rent-Boats.com · Todos los derechos reservados · Diseñado en Mallorca 🌊
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
