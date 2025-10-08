import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-blue-950 to-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <img 
                src="/logo-rent-boats-white.svg" 
                alt="Rent Boats" 
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-300 text-sm leading-relaxed">
                Tu plataforma de confianza para alquilar barcos y yates. 
                Descubre las mejores experiencias náuticas con total seguridad.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.749.1.118.112.222.083.342-.09.367-.297 1.189-.335 1.355-.049.218-.402.265-.402.265-.402-.265-.402-.265-.402-.265-1.334-.618-2.118-2.507-2.118-4.025 0-3.273 2.376-6.279 6.833-6.279 3.583 0 6.369 2.552 6.369 5.973 0 3.567-2.24 6.445-5.364 6.445-1.049 0-2.037-.547-2.374-1.201l-.648 2.475c-.234.902-.868 2.031-1.294 2.722.975.301 2.006.461 3.074.461 6.624 0 11.99-5.367 11.99-11.99C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-blue-400">Servicios</h3>
            <ul className="space-y-2">
              <li><a href="/barcos" className="text-gray-300 hover:text-white transition-colors text-sm">Alquiler de Barcos</a></li>
              <li><a href="/yates" className="text-gray-300 hover:text-white transition-colors text-sm">Alquiler de Yates</a></li>
              <li><a href="/catamaranes" className="text-gray-300 hover:text-white transition-colors text-sm">Catamaranes</a></li>
              <li><a href="/veleros" className="text-gray-300 hover:text-white transition-colors text-sm">Veleros</a></li>
              <li><a href="/motos-agua" className="text-gray-300 hover:text-white transition-colors text-sm">Motos de Agua</a></li>
              <li><a href="/patron" className="text-gray-300 hover:text-white transition-colors text-sm">Con Patrón</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-blue-400">Empresa</h3>
            <ul className="space-y-2">
              <li><a href="/quienes-somos" className="text-gray-300 hover:text-white transition-colors text-sm">Quiénes Somos</a></li>
              <li><a href="/como-funciona" className="text-gray-300 hover:text-white transition-colors text-sm">Cómo Funciona</a></li>
              <li><a href="/propietarios" className="text-gray-300 hover:text-white transition-colors text-sm">Para Propietarios</a></li>
              <li><a href="/blog" className="text-gray-300 hover:text-white transition-colors text-sm">Blog</a></li>
              <li><a href="/contacto" className="text-gray-300 hover:text-white transition-colors text-sm">Contacto</a></li>
              <li><a href="/ayuda" className="text-gray-300 hover:text-white transition-colors text-sm">Centro de Ayuda</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-blue-400">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/terminos-condiciones" className="text-gray-300 hover:text-white transition-colors text-sm">Términos y Condiciones</a></li>
              <li><a href="/politica-privacidad" className="text-gray-300 hover:text-white transition-colors text-sm">Política de Privacidad</a></li>
              <li><a href="/politica-cookies" className="text-gray-300 hover:text-white transition-colors text-sm">Política de Cookies</a></li>
              <li><a href="/politica-cancelacion" className="text-gray-300 hover:text-white transition-colors text-sm">Política de Cancelación</a></li>
              <li><a href="/aviso-legal" className="text-gray-300 hover:text-white transition-colors text-sm">Aviso Legal</a></li>
            </ul>
          </div>
        </div>

        {/* Línea separadora */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Derechos reservados */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Rent Boats. Todos los derechos reservados.
              </p>
            </div>

            {/* Métodos de pago */}
            <div className="flex justify-center space-x-4">
              <div className="bg-white rounded p-1">
                <img src="/visa.svg" alt="Visa" className="h-6 w-auto" />
              </div>
              <div className="bg-white rounded p-1">
                <img src="/mastercard.svg" alt="Mastercard" className="h-6 w-auto" />
              </div>
              <div className="bg-white rounded p-1">
                <img src="/paypal.svg" alt="PayPal" className="h-6 w-auto" />
              </div>
            </div>

            {/* Certificaciones */}
            <div className="text-center md:text-right">
              <div className="flex justify-center md:justify-end space-x-2">
                <img src="/ssl-secure.svg" alt="SSL Secure" className="h-8 w-auto" />
                <img src="/verified-badge.svg" alt="Verified" className="h-8 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-black/50 py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 text-xs">
              Rent Boats es una plataforma digital que conecta propietarios de embarcaciones con usuarios que desean alquilarlas. 
              Facilitamos el proceso de reserva pero no somos propietarios de las embarcaciones listadas.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
