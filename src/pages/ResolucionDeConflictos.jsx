import React from 'react';

export default function ResolucionDeConflictos() {
  return (
    <main className="container policy">
      <h1>Resolución de Conflictos</h1>
      <p>Última actualización: {new Date().toLocaleDateString()}</p>

      <section>
        <h2>1. Ámbito</h2>
        <p>Este procedimiento aplica a controversias derivadas de reservas, servicios, pagos, reseñas y uso de la Plataforma.</p>
      </section>

      <section>
        <h2>2. Soporte y reclamaciones</h2>
        <p>Contacta primero con soporte en soporte@rentboats.app aportando número de reserva y evidencias. Respondemos normalmente en 48h laborables.</p>
      </section>

      <section>
        <h2>3. Mediación</h2>
        <p>Si no hay acuerdo entre las partes, la Plataforma puede actuar como mediadora evaluando evidencias y políticas aplicables para proponer una solución.</p>
      </section>

      <section>
        <h2>4. Cargos, devoluciones y retenciones</h2>
        <p>Podremos retener o liberar fondos conforme a la política de cancelación, términos del servicio prestado y pruebas aportadas por las partes.</p>
      </section>

      <section>
        <h2>5. Arbitraje y jurisdicción</h2>
        <p>De no resolverse el conflicto, las partes podrán someterse voluntariamente a arbitraje de consumo. En última instancia, los tribunales competentes serán los de la ciudad del consumidor, cuando la normativa lo exija.</p>
      </section>
    </main>
  );
}
