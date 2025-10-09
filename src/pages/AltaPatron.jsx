// src/pages/AltaPatron.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * AltaPatron page placeholder.
 * This page will provide information and a form for skippers/patrons to register on the platform.
 */
export default function AltaPatron() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Alta de Patrón | Rent-Boats-App</title>
        <meta
          name="description"
          content="Página de alta de patrón de Rent-Boats-App. Regístrate como patrón para ofrecer tus servicios en nuestras embarcaciones."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Alta de Patrón</h1>
      <p className="text-lg text-center max-w-2xl">
        Esta sección está en construcción. Pronto podrás registrarte como patrón y ofrecer tus servicios en la plataforma.
      </p>
    </section>
  );
}
