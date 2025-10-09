// src/pages/marketplace/GestionDeResenas.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * Marketplace Gestión de Reseñas page placeholder.
 * This page will explain how to manage reviews within the marketplace.
 */
export default function GestionDeResenas() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Gestión de Reseñas | Rent-Boats-App</title>
        <meta
          name="description"
          content="Página de gestión de reseñas del Marketplace de Rent-Boats-App. Aprende cómo gestionar y responder a las reseñas de tus servicios."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Gestión de Reseñas</h1>
      <p className="text-lg text-center max-w-2xl">
        Esta sección está en desarrollo. Aquí encontrarás información sobre cómo gestionar las reseñas y comentarios en el marketplace.
      </p>
    </section>
  );
}
