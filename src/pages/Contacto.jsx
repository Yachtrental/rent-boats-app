// File: src/pages/Contacto.jsx

import React from "react";
import { Helmet } from "react-helmet";

export default function Contacto() {
  return (
    <section className="bg-[#0b1220] text-[#e6edf3] min-h-screen py-16 px-6 flex flex-col items-center">
      {/* SEO META TAGS */}
      <Helmet>
        <title>Contacto | Rent-Boats-App</title>
        <meta
          name="description"
          content="Ponte en contacto con el equipo de Rent-Boats-App. Estamos disponibles para consultas, colaboraciones, soporte a armadores y clientes en todo el Mediterráneo."
        />
        <meta
          name="keywords"
          content="contacto, alquiler de yates, rent-boats, servicio náutico, atención al cliente, Baleares"
        />
      </Helmet>

      {/* ENCABEZADO */}
      <div className="text-center mb-12 max-w-3xl">
        <h1 className="text-5xl font-extrabold text-[#2fb4ff] mb-4">
          📧 Contacto
        </h1>
        <p className="text-lg text-[#aab3c5] leading-relaxed">
          Estamos aquí para ayudarte. Ya seas armador, patrón, proveedor de servicios o cliente, nuestro equipo está disponible para responder tus consultas.
        </p>
      </div>

      {/* FORMULARIO DE CONTACTO */}
      <div className="bg-[#121a2b] border border-[#24324d] rounded-2xl shadow-lg p-8 max-w-3xl w-full mb-12">
        <form
          action="https://formsubmit.co/info@rent-boats.com"
          method="POST"
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-semibold text-[#aab3c5] mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Introduce tu nombre"
              className="w-full bg-[#0e1628] border border-[#24324d] rounded-lg px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2fb4ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#aab3c5] mb-1">
              Correo electrónico *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tucorreo@ejemplo.com"
              className="w-full bg-[#0e1628] border border-[#24324d] rounded-lg px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2fb4ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#aab3c5] mb-1">
              Teléfono de contacto
            </label>
            <input
              type="tel"
              name="telefono"
              placeholder="+34 600 000 000"
              className="w-full bg-[#0e1628] border border-[#24324d] rounded-lg px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2fb4ff]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#aab3c5] mb-1">
              Asunto *
            </label>
            <select
              name="asunto"
              required
              className="w-full bg-[#0e1628] border border-[#24324d] rounded-lg px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2fb4ff]"
            >
              <option value="">-- Selecciona un asunto --</option>
              <option value="consulta_general">Consulta general</option>
              <option value="alta_armador">Alta como armador</option>
              <option value="alta_patron">Alta como patrón</option>
              <option value="alta_servicio">Alta como proveedor de servicios</option>
              <option value="soporte_tecnico">Soporte técnico</option>
              <option value="colaboracion">Propuesta de colaboración</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#aab3c5] mb-1">
              Mensaje *
            </label>
            <textarea
              name="mensaje"
              required
              rows="6"
              placeholder="Escribe tu mensaje aquí..."
              className="w-full bg-[#0e1628] border border-[#24324d] rounded-lg px-4 py-3 text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#2fb4ff] resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#2fb4ff] to-[#1e90ff] hover:from-[#1e90ff] hover:to-[#2fb4ff] text-white font-bold py-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
          >
            Enviar mensaje
          </button>
        </form>
      </div>

      {/* INFORMACIÓN DE CONTACTO */}
      <div className="bg-[#121a2b] border border-[#24324d] rounded-2xl shadow-lg p-8 max-w-3xl w-full mb-12">
        <h2 className="text-3xl font-bold text-[#2fb4ff] mb-6">Información de contacto</h2>
        <div className="space-y-4 text-[#aab3c5]">
          <div className="flex items-start">
            <span className="text-2xl mr-4">📍</span>
            <div>
              <p className="font-semibold text-[#e6edf3]">Oficina central</p>
              <p>Paseo Marítimo, 101 - Puerto de Palma</p>
              <p>07015 Palma de Mallorca, Islas Baleares, España</p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-2xl mr-4">📧</span>
            <div>
              <p className="font-semibold text-[#e6edf3]">Email corporativo</p>
              <p>
                <a href="mailto:info@rent-boats.com" className="text-[#2fb4ff] hover:underline">
                  info@rent-boats.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-2xl mr-4">📞</span>
            <div>
              <p className="font-semibold text-[#e6edf3]">Teléfono de atención</p>
              <p>
                <a href="tel:+34971123456" className="text-[#2fb4ff] hover:underline">
                  +34 971 123 456
                </a>
              </p>
              <p className="text-sm mt-1">Lunes a Viernes: 9:00 - 19:00 | Sábados: 10:00 - 14:00</p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-2xl mr-4">⚓</span>
            <div>
              <p className="font-semibold text-[#e6edf3]">Departamento comercial</p>
              <p>
                <a href="mailto:comercial@rent-boats.com" className="text-[#2fb4ff] hover:underline">
                  comercial@rent-boats.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="text-2xl mr-4">🛟</span>
            <div>
              <p className="font-semibold text-[#e6edf3]">Soporte técnico</p>
              <p>
                <a href="mailto:soporte@rent-boats.com" className="text-[#2fb4ff] hover:underline">
                  soporte@rent-boats.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAPA EMBEBIDO */}
      <div className="bg-[#121a2b] border border-[#24324d] rounded-2xl shadow-lg p-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-[#2fb4ff] mb-6">Nuestra ubicación</h2>
        <div className="overflow-hidden rounded-lg">
          <iframe
            title="Ubicación Rent-Boats-App"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3075.123456789!2d2.6471!3d39.5696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMznCsDM0JzEwLjYiTiAywrAzOCc0OS42IkU!5e0!3m2!1ses!2ses!4v1234567890123!5m2!1ses!2ses"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* ENLACES RÁPIDOS */}
      <div className="mt-12 text-center">
        <p className="text-sm text-[#aab3c5] mb-4">
          ¿Necesitas ayuda inmediata? Visita nuestro{" "}
          <a href="/centro-de-ayuda" className="text-[#2fb4ff] hover:underline font-semibold">
            Centro de Ayuda
          </a>{" "}
          o consulta las{" "}
          <a href="/faq" className="text-[#2fb4ff] hover:underline font-semibold">
            Preguntas Frecuentes
          </a>
          .
        </p>
      </div>
    </section>
  );
}
