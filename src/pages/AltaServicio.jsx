// src/pages/AltaServicio.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * AltaServicio page placeholder.
 * This page will provide information and a form for service providers to register their services on the platform.
 */
export default function AltaServicio() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Alta de Servicio | Rent-Boats-App</title>
        <meta
          name="description"
          content="Página de alta de servicios en Rent-Boats-App. Registra tu empresa de servicios para colaborar con nuestra plataforma."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Alta de Servicios</h1>
      <p className="text-lg text-center max-w-2xl">
        Próximamente podrás registrar tu empresa de servicios y colaborar con Rent-Boats-App. Estamos preparando el formulario de alta.
      </p>
    </section>
  );
}
