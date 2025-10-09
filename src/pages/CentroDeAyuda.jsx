// src/pages/CentroDeAyuda.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * CentroDeAyuda is a placeholder page for the help center.
 * This component displays a simple message indicating that the page is under construction.
 */
export default function CentroDeAyuda() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Centro de Ayuda | Rent-Boats-App</title>
        <meta
          name="description"
          content="Página del Centro de Ayuda de Rent-Boats-App. Encuentra respuestas a preguntas frecuentes y soporte para el uso de la plataforma."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
      <p className="text-lg text-center max-w-2xl">
        Estamos preparando nuestro centro de ayuda para ofrecerte toda la información que necesitas.
        Vuelve pronto para encontrar respuestas a las preguntas más frecuentes y recursos útiles.
      </p>
    </section>
  );
}
