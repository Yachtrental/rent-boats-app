import React from 'react';

const QuienesSomos = () => {
  return (
    <div className="quienes-somos">
      <section className="hero-section">
        <div className="hero-content">
          <h1>¿Quiénes Somos?</h1>
          <p className="subtitle">Líderes en alquiler de embarcaciones de lujo</p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="content-block">
            <h2>Nuestra Historia</h2>
            <p>
              Rent-Boats nació de una pasión compartida por el mar y el deseo de democratizar el acceso a experiencias náuticas únicas. Desde nuestros inicios, nos hemos dedicado a conectar a propietarios de embarcaciones con personas que buscan vivir aventuras inolvidables en el agua.
            </p>
            <p>
              Con presencia en los principales destinos náuticos del mundo, hemos construido una plataforma confiable que facilita miles de experiencias marítimas cada año, consolidándonos como referente en el sector del alquiler de embarcaciones.
            </p>
          </div>

          <div className="content-block">
            <h2>Nuestra Misión</h2>
            <p>
              Facilitar experiencias náuticas excepcionales mediante una plataforma segura, transparente y accesible que conecta a propietarios de embarcaciones con aventureros del mar, garantizando la máxima calidad en cada reserva.
            </p>
          </div>

          <div className="content-block">
            <h2>Nuestros Valores</h2>
            <ul className="values-list">
              <li>
                <strong>Confianza:</strong> Verificamos cada embarcación y propietario para garantizar la seguridad de nuestros usuarios.
              </li>
              <li>
                <strong>Transparencia:</strong> Información clara y completa en cada anuncio, sin sorpresas desagradables.
              </li>
              <li>
                <strong>Excelencia:</strong> Nos esforzamos por superar las expectativas en cada experiencia.
              </li>
              <li>
                <strong>Pasión por el mar:</strong> Compartimos el amor por la navegación y lo transmitimos en nuestro servicio.
              </li>
            </ul>
          </div>

          <div className="content-block">
            <h2>¿Por qué elegirnos?</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>Variedad de embarcaciones</h3>
                <p>Desde lanchas rápidas hasta yates de lujo, tenemos la embarcación perfecta para cada ocasión.</p>
              </div>
              <div className="feature-item">
                <h3>Proceso simple y seguro</h3>
                <p>Reserva en minutos con nuestro sistema de pago seguro y protección integral.</p>
              </div>
              <div className="feature-item">
                <h3>Soporte 24/7</h3>
                <p>Nuestro equipo está siempre disponible para ayudarte antes, durante y después de tu experiencia.</p>
              </div>
              <div className="feature-item">
                <h3>Mejores destinos</h3>
                <p>Opera en las ubicaciones más espectaculares del mundo para experiencias inolvidables.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuienesSomos;
