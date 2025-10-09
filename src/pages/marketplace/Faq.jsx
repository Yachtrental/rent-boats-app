// src/pages/marketplace/Faq.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * Marketplace FAQ page placeholder.
 * This page will contain frequently asked questions specific to the marketplace.
 */
export default function MarketplaceFaq() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>FAQ del Marketplace | Rent-Boats-App</title>
        <meta
          name="description"
          content="Preguntas frecuentes sobre el Marketplace de Rent-Boats-App. Información sobre cómo alquilar, contratar servicios y más."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes del Marketplace</h1>
      <p className="text-lg text-center max-w-2xl">
        Próximamente encontrarás aquí las respuestas a las preguntas más habituales sobre el funcionamiento del marketplace.
      </p>
    </section>
  );
}
