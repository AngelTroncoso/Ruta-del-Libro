import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, MapPin, Headphones, Loader, Bookmark, BookmarkCheck } from 'lucide-react';
import { culturalData } from '../data';
import { supabase } from '../supabaseClient';

export default function DetailPage({ session }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);

  // Buscar metadatos básicos en el archivo local de datos
  let content = null;
  culturalData.forEach(section => {
    const found = section.items.find(item => item.id === id);
    if (found) content = found;
  });

  useEffect(() => {
    if (!content) return;
    
    // Verificar si la ruta ya está guardada en la biblioteca del usuario
    if (session) {
      supabase
        .from('saved_routes')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('item_id', id)
        .single()
        .then(({ data }) => {
          if (data) setIsSaved(true);
        });
    }

    // --- CONFIGURACIÓN DE CONEXIÓN A GEMINI (Vía Backend) ---
    // Usamos la variable de entorno VITE_API_URL configurada en Render
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    fetch(`${apiUrl}/api/generate-experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_type: content.type,
        title: content.title,
        author_director: content.author,
        theme: content.theme
      })
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error en el servidor: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json.error) throw new Error(json.error);
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error de conexión:", err);
        setError("No se pudo conectar con la IA de Gemini. Asegúrate de que el backend esté corriendo y la URL sea correcta.");
        setLoading(false);
      });

    // Limpiar audio al salir de la página
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [content, id, session]);

  // Manejador del sintetizador de voz nativo (TTS)
  const toggleAudio = () => {
    if (!data || !data.audio) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const msg = new SpeechSynthesisUtterance(data.audio);
      msg.lang = 'es-CL'; 
      msg.rate = 0.95; 
      
      msg.onend = () => setIsPlayingAudio(false);
      msg.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(msg);
      setIsPlayingAudio(true);
    }
  };

  const handleToggleSave = async () => {
    if (!session) {
      navigate('/auth');
      return;
    }
    setSavingLoading(true);
    
    if (isSaved) {
      const { error } = await supabase.from('saved_routes').delete().eq('user_id', session.user.id).eq('item_id', id);
      if (!error) setIsSaved(false);
    } else {
      const { error } = await supabase.from('saved_routes').insert([{ user_id: session.user.id, item_id: id }]);
      if (!error) setIsSaved(true);
    }
    setSavingLoading(false);
  };

  if (!content) return <div className="p-10">Obra no encontrada</div>;

  return (
    <div className="detail-page" style={{ paddingBottom: '100px' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}
      >
        <ArrowLeft size={20} /> Volver a Inicio
      </button>

      <div style={{ display: 'flex', gap: '32px', marginBottom: '48px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <img 
          src={content.cover} 
          alt={content.title} 
          style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
        />
        <div style={{ flex: 1 }}>
          <h4 style={{ textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '600', letterSpacing: '2px', marginBottom: '8px' }}>
            Ruta Inmersiva
          </h4>
          <h1 style={{ fontSize: '64px', margin: '0 0 16px 0', lineHeight: 1.1 }}>{content.title}</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '24px' }}>{content.author} • {content.year} • {content.theme}</p>
          
          <button 
            onClick={handleToggleSave}
            disabled={savingLoading}
            style={{
              background: isSaved ? 'rgba(72, 187, 120, 0.2)' : 'var(--accent)',
              border: isSaved ? '1px solid #48BB78' : 'none',
              color: isSaved ? '#48BB78' : 'black',
              padding: '12px 24px', borderRadius: '8px', cursor: savingLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.3s'
            }}
          >
            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            {isSaved ? 'Guardado en Biblioteca' : 'Añadir a mi Biblioteca'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '100px 0', color: 'var(--text-muted)' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Loader size={48} color="var(--accent)" />
          </motion.div>
          <h3 style={{ marginTop: '24px' }}>Generando la experiencia con Google AI...</h3>
          <p>Adaptando el entorno cultural al modelo de 7 pasos...</p>
        </div>
      ) : error ? (
        <div style={{ color: '#ff4b4b', padding: '24px', background: 'rgba(255, 75, 75, 0.1)', border: '1px solid #ff4b4b', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚠️ Error de Conexión</p>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '800px' }}>
          
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>📝 Contexto Histórico Integrado</h2>
            <p style={{ fontSize: '18px', color: '#CCC', lineHeight: 1.8 }}>{data.contexto}</p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass" style={{ padding: '32px', borderRadius: '16px', borderLeft: '4px solid var(--accent)' }}>
            <h2 style={{ marginBottom: '16px' }}>👀 Estás allí...</h2>
            <p style={{ fontSize: '20px', fontStyle: 'italic', lineHeight: 1.8, marginBottom: '24px' }}>
              "{data.inmersiva}"
            </p>
            <p style={{ fontSize: '18px', lineHeight: 1.8 }}>{data.historia}</p>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Un encuentro con {data.personaje_nombre}</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', borderLeft: '2px solid white' }}>
              <p style={{ fontSize: '18px', margin: 0 }}>💭 <i>"{data.personaje_dialogo}"</i></p>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}><MapPin /> Ruta Urbana Sugerida</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.ruta && data.ruta.map((pt, i) => (
                <div key={i} className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
                  <h3 style={{ marginBottom: '8px', color: 'var(--accent)' }}>📍 {pt.lugar}</h3>
                  <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Referencia: {pt.obra}</p>
                  <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>{pt.relevancia}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div style={{ background: '#181820', padding: '24px', borderRadius: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button 
                onClick={toggleAudio}
                style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent)', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                {isPlayingAudio ? <Pause fill="black" size={24} /> : <Play fill="black" size={24} />}
              </button>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Headphones size={20} /> Guía Generada</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px', maxWidth: '500px', lineHeight: 1.4 }}>{data.audio}</p>
              </div>
            </div>
          </motion.section>

        </div>
      )}
    </div>
  );
}
