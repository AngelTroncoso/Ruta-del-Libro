import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Compass, Map as MapIcon, Library, LogIn, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import HomePage from './pages/Home';
import DetailPage from './pages/Detail';
import MapPage from './pages/MapPage';
import AuthPage from './pages/Auth';
import LibraryPage from './pages/Library';
import './index.css';

function Sidebar({ session }) {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div>
        <div className="logo" style={{ marginBottom: '40px' }}>
          <Compass size={28} />
          RUTAS
        </div>
        
        <div className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={24} />
            Inicio
          </Link>
          <Link to="/explore" className={`nav-item ${location.pathname === '/explore' ? 'active' : ''}`}>
            <MapIcon size={24} />
            Mapa
          </Link>
          <Link to="/library" className={`nav-item ${location.pathname === '/library' ? 'active' : ''}`}>
            <Library size={24} />
            Tu Biblioteca
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
        {session ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              👤 {session.user.email}
            </p>
            <button 
              onClick={handleLogout}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', width: '100%' }}
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        ) : (
          <Link to="/auth" className="nav-item" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
            <LogIn size={20} />
            Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Suscribirse a cambios de sesión de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Sidebar session={session} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<MapPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/library" element={<LibraryPage session={session} />} />
            <Route path="/experience/:id" element={<DetailPage session={session} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
