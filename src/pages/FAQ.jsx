// src/pages/FAQ.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * FAQ page placeholder.
 * This page will eventually contain frequently asked questions and their answers.
 */
export default function FAQ() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Preguntas Frecuentes | Rent-Boats-App</title>
        <meta
          name="description"
          content="Sección de Preguntas Frecuentes de Rent-Boats-App. Encuentra respuestas a las dudas más comunes sobre el alquiler de barcos, patrones y servicios."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes (FAQ)</h1>
      <p className="text-lg text-center max-w-2xl">
        Esta sección está en construcción. Próximamente publicaremos las preguntas más frecuentes y sus respuestas.
      </p>
    </section>
  );
}
