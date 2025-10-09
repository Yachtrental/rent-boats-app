// src/pages/Colaboradores.jsx
import React from "react";
import { Helmet } from "react-helmet";

/**
 * Colaboradores page placeholder.
 * This page will provide information about the collaborators program.
 */
export default function Colaboradores() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-8">
      <Helmet>
        <title>Programa de Colaboradores | Rent-Boats-App</title>
        <meta
          name="description"
          content="Información sobre el programa de colaboradores de Rent-Boats-App. Conoce cómo unirte y los beneficios de colaborar con nuestra plataforma."
        />
      </Helmet>
      <h1 className="text-4xl font-bold mb-4">Programa de Colaboradores</h1>
      <p className="text-lg text-center max-w-2xl">
        El programa de colaboradores se encuentra en desarrollo. Vuelve pronto para descubrir cómo colaborar con Rent-Boats-App y obtener beneficios exclusivos.
      </p>
    </section>
  );
}
