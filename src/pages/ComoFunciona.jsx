import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaCalendarAlt, FaShip, FaCheckCircle } from 'react-icons/fa';

const ComoFunciona = () => {
  const steps = [
    {
      icon: <FaSearch />,
      title: 'Explora y Descubre',
      description: 'Navega por nuestra amplia selección de embarcaciones disponibles. Utiliza nuestros filtros avanzados para encontrar el barco perfecto según tu destino, presupuesto y preferencias.'
    },
    {
      icon: <FaCalendarAlt />,
      title: 'Reserva con Facilidad',
      description: 'Selecciona tus fechas, revisa la disponibilidad y completa tu reserva de forma segura. Nuestro sistema de pago garantiza transacciones protegidas y confirmación instantánea.'
    },
    {
      icon: <FaShip />,
      title: 'Disfruta tu Aventura',
      description: 'Recibe toda la información necesaria del propietario, prepara tu viaje y zarpa hacia una experiencia inolvidable en el mar con total confianza y seguridad.'
    },
    {
      icon: <FaCheckCircle />,
      title: 'Comparte tu Experiencia',
      description: 'Después de tu travesía, comparte tus comentarios y valoraciones. Tu opinión ayuda a otros navegantes a tomar las mejores decisiones para sus próximas aventuras.'
    }
  ];

  return (
    <div className="como-funciona-container">
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <h1>¿Cómo Funciona?</h1>
          <p className="hero-subtitle">
            Alquilar tu embarcación ideal es sencillo y seguro con nuestra plataforma.
            Sigue estos pasos y prepárate para navegar.
          </p>
        </motion.div>
      </section>

      <section className="steps-section">
        <div className="steps-container">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="step-card"
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <h3>Paso {index + 1}: {step.title}</h3>
                <p>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="benefits-section">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="benefits-content"
        >
          <h2>Ventajas de Alquilar con Nosotros</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h4>🔒 Pago Seguro</h4>
              <p>Transacciones protegidas con los más altos estándares de seguridad</p>
            </div>
            <div className="benefit-item">
              <h4>✅ Verificación de Embarcaciones</h4>
              <p>Todos los barcos pasan por un riguroso proceso de validación</p>
            </div>
            <div className="benefit-item">
              <h4>💬 Atención al Cliente 24/7</h4>
              <p>Soporte constante antes, durante y después de tu reserva</p>
            </div>
            <div className="benefit-item">
              <h4>🌟 Opiniones Verificadas</h4>
              <p>Comentarios auténticos de navegantes como tú</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="cta-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="cta-content"
        >
          <h2>¿Listo para Zarpar?</h2>
          <p>Comienza tu aventura marina hoy mismo</p>
          <button className="cta-button" onClick={() => window.location.href = '/marketplace'}>
            Explorar Embarcaciones
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default ComoFunciona;
