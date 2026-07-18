import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccessMsg('Inicio de sesión exitoso. ¡Bienvenido!');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Registro exitoso. Revisa tu correo, o si no requiere verificación, ya estás dentro.');
      }
    } catch (error) {
      setErrorMsg(error.message || 'Ha ocurrido un error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <motion.div 
        className="glass"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '40px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h2 className="text-gradient" style={{ fontSize: '32px', marginBottom: '24px' }}>
          {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </h2>

        {errorMsg && <p style={{ color: '#E53E3E', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: '#48BB78', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{successMsg}</p>}

        <form onSubmit={handleAuth} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none'
              }}
              placeholder="tu@correo.com"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none'
              }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '16px', background: 'var(--accent)', color: 'black', padding: '14px',
              borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              opacity: loading ? 0.7 : 1, transition: 'all 0.3s'
            }}
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {loading ? 'Procesando...' : (isLogin ? 'Entrar a Rutas' : 'Crear mi cuenta')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isLogin ? "¿No tienes cuenta aún?" : "¿Ya eres aventurero?"} 
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px' }}
            >
              {isLogin ? "Regístrate" : "Inicia Sesión"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
