// src/pages/AltaArmador.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * AltaArmador page placeholder.
 * This page will provide information and a form for boat owners to register on the platform.
 */
export default function AltaArmador() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Alta de Armador | Rent-Boats-App</title>
        <meta
          name="description"
          content="Página de alta de armador de Rent-Boats-App. Regístrate como armador y ofrece tu embarcación en nuestra plataforma."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Alta de Armador</h1>
      <p className="text-lg text-center max-w-2xl">
        Estamos trabajando en el formulario de registro para armadores. Pronto podrás registrar tu embarcación en Rent-Boats-App.
      </p>
    </section>
  );
}
