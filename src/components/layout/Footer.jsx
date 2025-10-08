import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';
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
    { icon: <Instagram size={24} />, href: "https://www.instagram.com/rent_boat_oficial/", name: "Instagram" },
    { icon: <Facebook size={24} />, href: "https://facebook.com/", name: "Facebook" },
    { icon: <Twitter size={24} />, href: "https://twitter.com/rentboats", name: "Twitter" },
    { icon: <Linkedin size={24} />, href: "https://linkedin.com/company/rentboats", name: "LinkedIn" },
    { icon: <Youtube size={24} />, href: "https://youtube.com/c/rentboats", name: "YouTube" },
  ];

  const quickLinks = [
    { name: "Inicio", view: "marketplace", href: "/" },
    { name: "Marketplace", view: "marketplace", href: "/marketplace" },
    { name: "Sobre nosotros", view: "about", href: "/about" },
    { name: "Cómo funciona", view: "how-it-works", href: "/how-it-works" },
    { name: "Propietarios", view: "owners", href: "/owners" },
    { name: "Blog", view: "blog", href: "/blog" },
  ];

  const legalLinks = [
    { name: "Política de Privacidad", href: "/privacy-policy" },
    { name: "Términos y Condiciones", href: "/terms-conditions" },
    { name: "Política de Cookies", href: "/cookie-policy" },
    { name: "Términos de Uso", href: "/terms-of-use" },
    { name: "Cancelaciones", href: "/cancellation-policy" },
    { name: "Política de Reembolso", href: "/refund-policy" },
  ];

  const serviceLinks = [
    { name: "Alquiler de Yates", href: "/yacht-rental" },
    { name: "Alquiler de Barcos", href: "/boat-rental" },
    { name: "Alquiler de Veleros", href: "/sailboat-rental" },
    { name: "Alquiler de Catamaranes", href: "/catamaran-rental" },
    { name: "Alquiler de Lanchas", href: "/speedboat-rental" },
    { name: "Charters Privados", href: "/private-charters" },
  ];

  const destinationLinks = [
    { name: "Mallorca", href: "/destinations/mallorca" },
    { name: "Ibiza", href: "/destinations/ibiza" },
    { name: "Costa Brava", href: "/destinations/costa-brava" },
    { name: "Canarias", href: "/destinations/canarias" },
    { name: "Marbella", href: "/destinations/marbella" },
    { name: "Valencia", href: "/destinations/valencia" },
  ];

  const currentYear = new Date().getFullYear();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rent Boats",
    "description": "Plataforma líder de alquiler de barcos y yates en España. Descubre embarcaciones únicas para tus vacaciones perfectas.",
    "url": "https://rent-boats.com",
    "logo": "https://rent-boats.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+34-900-123-456",
      "contactType": "customer service",
      "availableLanguage": ["Spanish", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Paseo Marítimo, 123",
      "addressLocality": "Barcelona",
      "postalCode": "08003",
      "addressCountry": "ES"
    },
    "sameAs": [
      "https://facebook.com/rentboats",
      "https://instagram.com/rentboats",
      "https://twitter.com/rentboats",
      "https://linkedin.com/company/rentboats",
      "https://youtube.com/c/rentboats"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
        {/* Newsletter Section */}
        <div className="bg-blue-600 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">¡Mantente al día con las mejores ofertas!</h3>
              <p className="text-blue-100 mb-6">Suscríbete a nuestro newsletter y recibe descuentos exclusivos en alquileres de barcos</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Suscribirse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Rent Boats</h2>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                La plataforma líder de alquiler de barcos y yates en España. 
                Conectamos propietarios con navegantes para crear experiencias únicas en el mar.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Phone size={16} className="mr-3 text-blue-400" />
                  <span>+34 900 123 456</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail size={16} className="mr-3 text-blue-400" />
                  <span>info@rent-boats.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin size={16} className="mr-3 text-blue-400" />
                  <span>Paseo Marítimo, 123, Barcelona</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock size={16} className="mr-3 text-blue-400" />
                  <span>Lun-Dom: 8:00 - 22:00</span>
                </div>
              </div>

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

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Enlaces Rápidos</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.view)}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Servicios</h3>
              <ul className="space-y-3">
                {serviceLinks.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Destinations */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Destinos Populares</h3>
              <ul className="space-y-3">
                {destinationLinks.map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                      whileHover={{ x: 5 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-wrap justify-center gap-6 mb-4">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-slate-950 border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-gray-400 mb-4 md:mb-0">
                © {currentYear} Rent Boats. Todos los derechos reservados.
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>🇪🇸 España</span>
                <span>💳 Pago Seguro</span>
                <span>📱 App Móvil</span>
                <span>🛡️ Seguro Incluido</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Keywords for internal linking */}
        <div className="sr-only">
          <p>Alquiler de barcos España, rent boats, yacht rental, charter náutico, alquiler yates, barcos de alquiler, rent boats Spain, boat rental Barcelona, yacht charter Mallorca, alquiler embarcaciones</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
