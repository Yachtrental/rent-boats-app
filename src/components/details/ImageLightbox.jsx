
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const lightboxVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const imageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const ImageLightbox = ({ isOpen, onClose, images, startIndex = 0 }) => {
  const [[page, direction], setPage] = useState([startIndex, 0]);

  useEffect(() => {
    if (isOpen) {
      setPage([startIndex, 0]);
    }
  }, [isOpen, startIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!images || images.length === 0) return null;

  const imageIndex = page % images.length;

  const paginate = (newDirection) => {
    setPage([(page + newDirection + images.length) % images.length, newDirection]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={lightboxVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 z-50"
            onClick={onClose}
          >
            <X size={32} />
          </Button>

          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-4 sm:left-8 text-white/70 hover:text-white hover:bg-white/10 z-50 h-12 w-12"
              onClick={() => paginate(-1)}
            >
              <ChevronLeft size={40} />
            </Button>

            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={page}
                src={images[imageIndex]}
                alt={`Imagen ampliada ${imageIndex + 1}`}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="max-w-[90vw] max-h-[90vh] object-contain"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x > 100) paginate(-1);
                  else if (offset.x < -100) paginate(1);
                }}
              />
            </AnimatePresence>
            
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 sm:right-8 text-white/70 hover:text-white hover:bg-white/10 z-50 h-12 w-12"
              onClick={() => paginate(1)}
            >
              <ChevronRight size={40} />
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
            {imageIndex + 1} / {images.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;