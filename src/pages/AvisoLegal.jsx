// src/pages/AvisoLegal.jsx

import React from "react";
import { Helmet } from "react-helmet";

export default function AvisoLegal() {
  return (
    <section className="bg-[#0b1220] text-[#e6edf3] min-h-screen py-16 px-6 md:px-16 font-inter leading-relaxed">
      {/* SEO META TAGS */}
      <Helmet>
        <title>Aviso Legal | Rent-Boats-App</title>
        <meta
          name="description"
          content="Aviso legal de Rent-Boats-App. Información corporativa, condiciones de uso, propiedad intelectual y datos legales de nuestra plataforma de alquiler de yates en Baleares."
        />
        <meta
          name="keywords"
          content="aviso legal, información legal, rent-boats, alquiler de yates, condiciones de uso, propiedad intelectual, Baleares"
        />
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {/* ENCABEZADO */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-[#2fb4ff] mb-4">
            ⚖️ Aviso Legal
          </h1>
          <p className="text-lg text-[#aab3c5]">
            Información legal y condiciones de uso de Rent-Boats-App
          </p>
        </header>

        {/* 1. INFORMACIÓN CORPORATIVA */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-[#2fb4ff] mb-4">
            1. Identificación del titular del sitio web
          </h2>
          <p className="mb-4">
            En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los usuarios de los siguientes datos:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-1">
            <li>
              <strong>Razón social:</strong> Rent Boats Mediterráneo S.L.
            </li>
            <li>
              <strong>Nombre comercial:</strong> Rent-Boats-App
            </li>
            <li>
              <strong>CIF:</strong> B07123456
            </li>
            <li>
              <strong>Domicilio social:</strong> Paseo Marítimo, 101 - Puerto de Palma, 07015 Palma de Mallorca, Islas Baleares, España
            </li>
            <li>
              <strong>Correo electrónico:</strong>{" "}
              <a href="mailto:info@rent-boats.com" className="text-[#2fb4ff] hover:underline">
                info@rent-boats.com
              </a>
            </li>
            <li>
              <strong>Teléfono de contacto:</strong>{" "}
              <a href="tel:+34971123456" className="text-[#2fb4ff] hover:underline">
                +34 971 123 456
              </a>
            </li>
            <li>
              <strong>Registro Mercantil:</strong> Inscrita en el Registro Mercantil de Palma de Mallorca, Tomo 3456, Folio 89, Sección 8, Hoja B-123456
            </li>
          </ul>
        </section>

        {/* 2. OBJETO DEL SITIO WEB */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-[#2fb4ff] mb-4">
            2. Objeto del sitio web
          </h2>
          <p className="mb-4">
            <strong>Rent-Boats-App</strong> es una plataforma digital que facilita el alquiler de embarcaciones de recreo (yates, veleros, lanchas, catamaranes) en el ámbito del Mediterráneo, con especial presencia en las Islas Baleares.
          </p>
          <p className="mb-4">
            A través de esta plataforma, los armadores pueden ofertar sus embarcaciones, los patrones pueden ofrecer sus servicios de navegación, y los usuarios pueden buscar, comparar y reservar experiencias náuticas de forma segura y profesional.
          </p>
          <p>
            El sitio web también integra servicios complementarios como proveedores de combustible, varaderos, amarres, limpieza, mantenimiento y otros servicios relacionados con la actividad náutica.
          </p>
        </section>

        {/* 3. CONDICIONES DE USO */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-[#2fb4ff] mb-4">
            3. Condiciones de uso
          </h2>
          <p className="mb-4">
            El acceso y uso de este sitio web atribuye la condición de usuario y supone la aceptación plena y sin reservas de todas las disposiciones incluidas en este Aviso Legal, así como de la Política de Privacidad y de la Política de Cookies.
          </p>
          <p className="mb-4">
            El usuario se compromete a:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Hacer un uso lícito y responsable del sitio web.</li>
            <li>No utilizar la plataforma con fines fraudulentos o ilícitos.</li>
            <li>No alterar, dañar o inutilizar el sitio web o sus contenidos.</li>
            <li>Proporcionar información veraz, exacta y actualizada.</li>
            <li>Respetar los derechos de propiedad intelectual e industrial del titular y de terceros.</li>
          </ul>
        </section>

        {/* 4. PROPIEDAD INTELECTUAL E INDUSTRIAL */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-[#2fb4ff] mb-4">
            4. Propiedad intelectual e industrial
          </h2>
          <p className="mb-4">
            Todos los contenidos del sitio web (textos, imágenes, diseños, gráficos, código fuente, bases de datos, logotipos, marcas y cualquier otro elemento susceptible de protección) son propiedad exclusiva de <strong>Rent Boats Mediterráneo S.L.</strong> o de terceros que han autorizado su uso, y están protegidos por las leyes españolas e internacionales de propiedad intelectual e industrial.
          </p>
          <p className="mb-4">
            Queda expresamente prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra forma de explotación de los contenidos sin autorización previa y por escrito del titular.
          </p>
        </section>

        {/* 5. RESPONSABILIDAD DEL USUARIO */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-[#2fb4ff] mb-4">
            5. Responsabilidad del usuario
          </h2>
          <p className="mb-4">
            El usuario es el único responsable de las infracciones en que pueda incurrir o de los perjuicios que pueda causar por el uso indebido de este sitio web. <strong>Rent Boats Mediterráneo S.L.</strong> no se hace responsable de:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>La veracidad, exactitud, adecuación, actualidad o exhaustividad de los contenidos publicados por terceros (armadores, patrones o proveedores de servicios).</li>
            <li>Los daños derivados del uso indebido, negligente o fraudulento de la plataforma por parte de los usuarios.</li>
            <li>Las interrupciones, retrasos o errores técnicos en el acceso o funcionamiento del sitio web, siempre que no sean imputables a la empresa.</li>
            <li>Los contenidos y servicios ofrecidos por terceros a través de enlaces externos.</li>
          </ul>
        </section>

        {/* 6. ENLACES A TERCEROS */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-[#2fb4ff] mb-4">
            6. Enlaces a sitios web de terceros
          </h2>
          <p className="mb-4">
            El sitio web puede contener enlaces a otros sitios de terceros. <strong>Rent Boats Mediterráneo S.L.</strong> no controla ni asume responsabilidad alguna sobre el contenido, políticas de privacidad o prácticas de sitios web de terceros.
          </p>
          <p>
            Se recomienda al usuario revisar los términos y condiciones y políticas de privacidad de cualquier sitio web externo antes de facilitar información personal.
          </p>
        </section>

        {/* 7. MODIFICACIÓN DEL AVISO LEGAL */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-[#2fb4ff] mb-4">
            7. Modificación del aviso legal
          </h2>
          <p className="mb-4">
            <strong>Rent Boats Mediterráneo S.L.</strong> se reserva el derecho a modificar este Aviso Legal en cualquier momento, con el fin de adaptarlo a cambios legislativos, jurisprudenciales o técnicos, así como a la propia evolución de la plataforma.
          </p>
          <p>
            Se recomienda a los usuarios revisar periódicamente esta página para estar al tanto de posibles cambios.
          </p>
        </section>

        {/* 8. LEY APLICABLE Y JURISDICCIÓN */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-[#2fb4ff] mb-4">
            8. Ley aplicable y jurisdicción
          </h2>
          <p className="mb-4">
            Este Aviso Legal se rige por la legislación española vigente. Para la resolución de cualquier controversia derivada del uso de este sitio web, las partes se someten expresamente a los juzgados y tribunales de <strong>Palma de Mallorca</strong>, con renuncia a cualquier otro fuero que pudiera corresponderles.
          </p>
        </section>

        {/* ENLACES RÁPIDOS */}
        <footer className="mt-12 pt-8 border-t border-[#24324d] text-center">
          <p className="text-sm text-[#aab3c5] mb-4">
            Documentos legales relacionados:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/politica-de-privacidad" className="text-[#2fb4ff] hover:underline">
              Política de Privacidad
            </a>
            <a href="/politica-de-cookies" className="text-[#2fb4ff] hover:underline">
              Política de Cookies
            </a>
            <a href="/terminos-y-condiciones" className="text-[#2fb4ff] hover:underline">
              Términos y Condiciones
            </a>
            <a href="/resolucion-de-conflictos" className="text-[#2fb4ff] hover:underline">
              Resolución de Conflictos
            </a>
            <a href="/contacto" className="text-[#2fb4ff] hover:underline">
              Contacto
            </a>
          </div>
          <p className="text-xs text-[#6b7a93] mt-6">
            Última actualización: Octubre 2025
          </p>
        </footer>
      </div>
    </section>
  );
}
