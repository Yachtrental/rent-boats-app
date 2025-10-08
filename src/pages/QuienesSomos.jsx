import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer/Footer';
import './QuienesSomos.css';

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
              <li><strong>Confianza:</strong> Verificamos cada embarcación y usuario para garantizar transacciones seguras.</li>
              <li><strong>Excelencia:</strong> Mantenemos los más altos estándares de calidad en nuestro servicio.</li>
              <li><strong>Transparencia:</strong> Precios claros, sin comisiones ocultas.</li>
              <li><strong>Pasión:</strong> Compartimos tu amor por el mar y las experiencias únicas.</li>
              <li><strong>Sostenibilidad:</strong> Promovemos prácticas responsables con el medio ambiente marino.</li>
            </ul>
          </div>

          <div className="content-block">
            <h2>¿Por Qué Elegirnos?</h2>
            <div className="features-grid">
              <div className="feature">
                <span className="icon">🛡️</span>
                <h3>Flota Verificada</h3>
                <p>Todas nuestras embarcaciones pasan rigurosas inspecciones de seguridad y calidad.</p>
              </div>
              <div className="feature">
                <span className="icon">💼</span>
                <h3>Cobertura Completa</h3>
                <p>Seguro integral incluido en cada reserva para tu total tranquilidad.</p>
              </div>
              <div className="feature">
                <span className="icon">🌍</span>
                <h3>Destinos Globales</h3>
                <p>Acceso a embarcaciones premium en más de 100 destinos alrededor del mundo.</p>
              </div>
              <div className="feature">
                <span className="icon">⚓</span>
                <h3>Soporte 24/7</h3>
                <p>Equipo de atención al cliente disponible en múltiples idiomas en todo momento.</p>
              </div>
              <div className="feature">
                <span className="icon">💎</span>
                <h3>Mejor Precio</h3>
                <p>Tarifas competitivas y transparentes, sin cargos sorpresa.</p>
              </div>
              <div className="feature">
                <span className="icon">⭐</span>
                <h3>Reseñas Reales</h3>
                <p>Opiniones verificadas de usuarios reales para decisiones informadas.</p>
              </div>
            </div>
          </div>

          <div className="content-block">
            <h2>Compromiso con la Excelencia</h2>
            <p>
              En Rent-Boats, la excelencia no es solo un objetivo, es nuestro estándar diario. Invertimos continuamente en tecnología, protocolos de seguridad y mejoras en la experiencia del usuario para mantener nuestro liderazgo en el sector del charter náutico.
            </p>
            <p>
              Nuestro equipo trabaja incansablemente para verificar cada listado, apoyar cada reserva y resolver cualquier inquietud con rapidez. No somos solo una plataforma; somos tus aliados en la creación de recuerdos marítimos extraordinarios.
            </p>
          </div>

          <div className="content-block">
            <h2>Sostenibilidad y Responsabilidad</h2>
            <p>
              Reconocemos nuestra responsabilidad de proteger los entornos marinos que tanto valoramos. Rent-Boats está comprometido con la promoción de prácticas náuticas sostenibles:
            </p>
            <ul>
              <li>Colaboramos con propietarios que mantienen embarcaciones eco-responsables</li>
              <li>Educamos a nuestra comunidad sobre navegación responsable y conservación marina</li>
              <li>Apoyamos iniciativas de protección marina y programas de limpieza costera</li>
              <li>Fomentamos el uso de tecnologías verdes y prácticas náuticas sostenibles</li>
            </ul>
          </div>

          <div className="cta-section">
            <h2>Únete a Nuestra Comunidad</h2>
            <p>
              Ya seas propietario de una embarcación que desea compartir su pasión o un aventurero buscando tu próxima experiencia marítima, Rent-Boats te da la bienvenida a nuestra creciente comunidad global.
            </p>
            <div className="cta-buttons">
              <Link to="/marketplace" className="btn-primary">Explorar Embarcaciones</Link>
              <Link to="/owners" className="btn-secondary">Listar mi Embarcación</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default QuienesSomos;
