import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { culturalData } from '../data';
import { useNavigate } from 'react-router-dom';
import { Play, BookmarkX, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LibraryPage({ session }) {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      fetchSavedRoutes();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchSavedRoutes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_routes')
      .select('item_id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else if (data) {
      // Cruzar IDs de Supabase con data.js
      const allItems = culturalData.flatMap(c => c.items);
      const itemsData = data.map(dbItem => allItems.find(i => i.id === dbItem.item_id)).filter(i => i);
      setSavedItems(itemsData);
    }
    setLoading(false);
  };

  const handleRemove = async (e, itemId) => {
    e.stopPropagation(); // Evitar que dispare la carta
    const { error } = await supabase
      .from('saved_routes')
      .delete()
      .eq('user_id', session.user.id)
      .eq('item_id', itemId);

    if (!error) {
      setSavedItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const handlePlayClick = (item) => {
    localStorage.setItem('lastSelectedWork', item.id);
    navigate(`/experience/${item.id}`);
  };

  const handleExplore = (e, item) => {
    e.stopPropagation();
    localStorage.setItem('lastSelectedWork', item.id);
    navigate('/explore');
  };

  if (!session) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', marginTop: '100px' }}>
        <h2 className="text-gradient" style={{ fontSize: '32px' }}>Inicia sesión para ver tu Biblioteca</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Guarda tus recorridos favoritos y accede a ellos en cualquier momento.</p>
        <button onClick={() => navigate('/auth')} style={{ marginTop: '24px', background: 'var(--accent)', color: 'black', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Ir a Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-gradient" style={{ fontSize: '48px', marginBottom: '8px' }}>Tu Biblioteca</h1>
        <p style={{ color: 'var(--text-muted)' }}>Caminos literarios y fílmicos que has marcado para volver a recorrer.</p>
      </div>

      {loading ? (
        <p>Cargando tus rutas...</p>
      ) : savedItems.length === 0 ? (
        <div style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Tu biblioteca está vacía.</p>
          <button onClick={() => navigate('/')} style={{ marginTop: '16px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Explorar el Catálogo</button>
        </div>
      ) : (
        <div className="cards-grid">
          {savedItems.map((item) => (
            <motion.div 
              className="card" 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handlePlayClick(item)}
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
              <h3 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item.title}
              </h3>
              <p className="card-subtitle">{item.author} • {item.year}</p>
              
              {/* Botones de acción directos en la biblioteca */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button 
                  onClick={(e) => handleExplore(e, item)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '12px' }}
                >
                  <MapPin size={14} /> Mapa
                </button>
                <button 
                  onClick={(e) => handleRemove(e, item.id)}
                  style={{ background: 'rgba(229, 62, 62, 0.2)', border: 'none', color: '#E53E3E', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Quitar de Favoritos"
                >
                  <BookmarkX size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
