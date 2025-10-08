import React from 'react';

export default function PoliticaDeCookies() {
  return (
    <main className="container policy">
      <h1>Política de Cookies</h1>
      <p>Última actualización: {new Date().toLocaleDateString()}</p>

      <section>
        <h2>1. ¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos que se almacenan en tu dispositivo para recordar preferencias, mejorar el servicio y realizar analítica. También utilizamos tecnologías similares como píxeles y localStorage.</p>
      </section>

      <section>
        <h2>2. Tipos de cookies que utilizamos</h2>
        <ul>
          <li>Esenciales: necesarias para iniciar sesión, realizar reservas y mantener la seguridad.</li>
          <li>De preferencias: recuerdan idioma, moneda y ajustes de interfaz.</li>
          <li>Analíticas: miden uso y rendimiento para mejorar la Plataforma.</li>
          <li>Publicitarias: personalizan anuncios y miden su eficacia.</li>
        </ul>
      </section>

      <section>
        <h2>3. Gestión y desactivación</h2>
        <p>Puedes gestionar y desactivar cookies desde la configuración de tu navegador y desde nuestro Centro de Preferencias. Ten en cuenta que bloquear ciertas cookies puede afectar a la experiencia del servicio.</p>
      </section>

      <section>
        <h2>4. Base legal</h2>
        <p>Usamos cookies esenciales por interés legítimo, y el resto bajo tu consentimiento, que puedes retirar en cualquier momento.</p>
      </section>

      <section>
        <h2>5. Terceros</h2>
        <p>Colaboramos con terceros de analítica y publicidad que pueden establecer sus propias cookies bajo sus políticas. Revisamos periódicamente el listado para mantenerlo actualizado.</p>
      </section>

      <section>
        <h2>6. Cambios</h2>
        <p>Actualizaremos esta política cuando incorporemos nuevas finalidades o proveedores. Te avisaremos de los cambios relevantes.</p>
      </section>
    </main>
  );
}
