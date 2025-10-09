// src/pages/marketplace/CentroDeAyuda.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * Marketplace Centro de Ayuda page placeholder.
 * This page is part of the marketplace section and will contain help resources for marketplace users.
 */
export default function CentroDeAyudaMarketplace() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Centro de Ayuda del Marketplace | Rent-Boats-App</title>
        <meta
          name="description"
          content="Sección de ayuda del Marketplace de Rent-Boats-App. Encuentra información sobre cómo usar el marketplace y resolver dudas frecuentes."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Centro de Ayuda del Marketplace</h1>
      <p className="text-lg text-center max-w-2xl">
        Próximamente encontrarás aquí artículos y recursos para resolver tus dudas sobre el marketplace.
      </p>
    </section>
  );
}
