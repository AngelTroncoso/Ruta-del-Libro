import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { culturalData } from '../data';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function HomePage() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = React.useState({});
  
  // Arreglo de referencias para los sliders de "Netflix mode"
  const rowRefs = useRef([]);

  const handlePlayClick = (item) => {
    localStorage.setItem('lastSelectedWork', item.id);
    navigate(`/experience/${item.id}`);
  };

  const toggleSection = (category) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const scrollLeft = (index) => {
    if (rowRefs.current[index]) {
      rowRefs.current[index].scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const scrollRight = (index) => {
    if (rowRefs.current[index]) {
      rowRefs.current[index].scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      <div className="header">
        <motion.h1 
          className="text-gradient"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Buenas tardes
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Descubre el alma de Chile a través de sus historias.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {culturalData.map((section, index) => {
          const isExpanded = expandedSections[section.category];
          
          return (
          <div className="section-wrapper" key={index} style={{ position: 'relative' }}>
            <div className="section-title">
              <h2>{section.category}</h2>
              <button 
                onClick={() => toggleSection(section.category)} 
                className="see-all" 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                {isExpanded ? 'Contraer' : 'Mostrar todos'}
              </button>
            </div>
            
            <div style={{ position: 'relative' }} className="slider-container">
              {/* Flecha Izquierda (estilo Netflix) */}
              {!isExpanded && (
                <button 
                  className="slider-arrow left-arrow" 
                  onClick={() => scrollLeft(index)}
                >
                  <ChevronLeft size={36} color="white" />
                </button>
              )}

              <div 
                className={isExpanded ? "cards-grid" : "cards-container"}
                ref={el => rowRefs.current[index] = el}
              >
                {section.items.map((item) => (
                  <motion.div 
                    className="card" 
                    key={item.id}
                    variants={itemVariants}
                  >
                    <div className="card-image-wrapper">
                      <img src={item.cover} alt={item.title} className="card-image" />
                      <button 
                        className="play-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayClick(item);
                        }}
                      >
                        <Play fill="black" size={24} />
                      </button>
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-subtitle">{item.author} • {item.year}</p>
                  </motion.div>
                ))}
              </div>

              {/* Flecha Derecha (estilo Netflix) */}
              {!isExpanded && (
                <button 
                  className="slider-arrow right-arrow" 
                  onClick={() => scrollRight(index)}
                >
                  <ChevronRight size={36} color="white" />
                </button>
              )}
            </div>
          </div>
          );
        })}
      </motion.div>
    </div>
  );
}
