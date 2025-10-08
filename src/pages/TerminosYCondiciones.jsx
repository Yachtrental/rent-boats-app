import React from 'react';

export default function TerminosYCondiciones() {
  return (
    <main className="container policy">
      <h1>Términos y Condiciones</h1>
      <p>Última actualización: {new Date().toLocaleDateString()}</p>

      <section>
        <h2>1. Objeto</h2>
        <p>Estos términos regulan el acceso y uso de Rent Boats App (la "Plataforma") por parte de Armadores, Patrones y Usuarios, así como las reservas y pagos realizados.</p>
      </section>

      <section>
        <h2>2. Cuentas de usuario</h2>
        <p>Debes proporcionar información veraz, mantener la confidencialidad de tus credenciales y notificar accesos no autorizados. Podemos verificar identidad y habilitaciones profesionales.</p>
      </section>

      <section>
        <h2>3. Publicación de anuncios</h2>
        <p>Los Armadores son responsables de la veracidad de la información de la embarcación, documentación, seguros y cumplimiento normativo marítimo.</p>
      </section>

      <section>
        <h2>4. Reservas y pagos</h2>
        <p>Las reservas quedan confirmadas tras el pago. Los fondos se custodian y se liberan según política de cancelación y cumplimiento del servicio.</p>
      </section>

      <section>
        <h2>5. Cancelaciones</h2>
        <p>Las cancelaciones se regirán por las Políticas de Cancelación aplicables al anuncio y comunicadas antes de reservar.</p>
      </section>

      <section>
        <h2>6. Seguros y responsabilidades</h2>
        <p>Los Armadores deben contar con coberturas adecuadas. La Plataforma no es parte de los contratos de transporte o chárter entre las partes.</p>
      </section>

      <section>
        <h2>7. Conducta y contenidos</h2>
        <p>Está prohibido publicar contenido ilícito, infractor o engañoso. Nos reservamos el derecho a moderar o retirar contenido y suspender cuentas.</p>
      </section>

      <section>
        <h2>8. Propiedad intelectual</h2>
        <p>La Plataforma y su contenido están protegidos. Concedes licencia para mostrar tus anuncios y reseñas en la Plataforma y canales de marketing.</p>
      </section>

      <section>
        <h2>9. Limitación de responsabilidad</h2>
        <p>En la medida permitida por la ley, no seremos responsables de daños indirectos. La responsabilidad total agregada se limita a las tarifas pagadas por el usuario en los 12 meses previos.</p>
      </section>

      <section>
        <h2>10. Ley aplicable y jurisdicción</h2>
        <p>Estos términos se rigen por la ley española. Para controversias, ver la sección de Resolución de Conflictos.</p>
      </section>
    </main>
  );
}
