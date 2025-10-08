import React from 'react';

export default function PoliticaDePrivacidad() {
  return (
    <main className="container policy">
      <h1>Política de Privacidad</h1>
      <p>Última actualización: {new Date().toLocaleDateString()}</p>

      <section>
        <h2>1. Introducción</h2>
        <p>En Rent Boats App ("la Plataforma"), respetamos tu privacidad y nos comprometemos a proteger tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD). Esta política describe qué datos tratamos, con qué finalidad, durante cuánto tiempo y cuáles son tus derechos.</p>
      </section>

      <section>
        <h2>2. Responsable del Tratamiento</h2>
        <p>Responsable: Rent Boats App, S.L. ("RBA").<br/>Domicilio: [Dirección Corporativa].<br/>Email: privacidad@rentboats.app.</p>
      </section>

      <section>
        <h2>3. Datos que tratamos</h2>
        <ul>
          <li>Identificación y contacto: nombre, apellidos, email, teléfono.</li>
          <li>Cuenta y verificación: contraseña cifrada, documentos de identidad (cuando aplique).</li>
          <li>Operativos: reservas, pagos, mensajes, reseñas.</li>
          <li>Técnicos: IP, dispositivo, cookies, logs y analítica.</li>
        </ul>
      </section>

      <section>
        <h2>4. Finalidades y base legal</h2>
        <ul>
          <li>Prestación del servicio de intermediación y reservas (ejecución de contrato).</li>
          <li>Atención al cliente y seguridad de la cuenta (interés legítimo y contrato).</li>
          <li>Cumplimiento legal: fiscal, contable, prevención de fraudes (obligación legal).</li>
          <li>Marketing y comunicaciones (consentimiento y/o interés legítimo con derecho de oposición).</li>
          <li>Mejora del producto y analítica (interés legítimo con medidas de minimización).</li>
        </ul>
      </section>

      <section>
        <h2>5. Conservación</h2>
        <p>Conservamos los datos mientras exista la relación contractual y, tras su finalización, durante los plazos necesarios para atender responsabilidades legales. Los datos de marketing se conservarán hasta que retires tu consentimiento o te opongas.</p>
      </section>

      <section>
        <h2>6. Destinatarios</h2>
        <p>Proveedores tecnológicos (hosting, pagos, verificación), aseguradoras, despachos legales y otros Encargados de Tratamiento bajo contratos de confidencialidad y protección de datos. Podrán realizarse transferencias internacionales con garantías adecuadas (cláusulas tipo, proveedores con certificaciones vigentes).</p>
      </section>

      <section>
        <h2>7. Derechos</h2>
        <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad enviando un email a privacidad@rentboats.app, acreditando tu identidad. También puedes reclamar ante la AEPD.</p>
      </section>

      <section>
        <h2>8. Seguridad</h2>
        <p>Aplicamos medidas técnicas y organizativas para proteger la confidencialidad, integridad y disponibilidad de tus datos (cifrado, control de accesos, registros, backups y formación de personal).</p>
      </section>

      <section>
        <h2>9. Cambios</h2>
        <p>Publicaremos actualizaciones de esta política en la Plataforma. Te notificaremos los cambios relevantes.</p>
      </section>
    </main>
  );
}
