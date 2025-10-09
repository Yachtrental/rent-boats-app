// src/pages/marketplace/PoliticasDeCancelacion.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * Marketplace Políticas de Cancelación page placeholder.
 * This page will outline cancellation policies for bookings and services.
 */
export default function PoliticasDeCancelacion() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Políticas de Cancelación | Rent-Boats-App</title>
        <meta
          name="description"
          content="Consulta las políticas de cancelación del Marketplace de Rent-Boats-App para alquileres y servicios."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Políticas de Cancelación</h1>
      <p className="text-lg text-center max-w-2xl">
        Estamos preparando el contenido relativo a las políticas de cancelación. Vuelve pronto para obtener todos los detalles.
      </p>
    </section>
  );
}
