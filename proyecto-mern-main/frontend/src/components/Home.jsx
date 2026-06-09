import React from 'react';
// IMPORTACIÓN DEL LOGO DE CLEAN CLASS
import logoCleanClass from '../assets/logo.jpg'; 

export default function Home({ setTab, history, initialStudents, alumnosAsignadosHoy, calculateStreak, fechaSeleccionada }) {
  
  // SOLUCIÓN AL CONGELAMIENTO: Procesamos de forma segura la fecha seleccionada en el Header
  const baseDate = fechaSeleccionada ? new Date(fechaSeleccionada + "T00:00:00") : new Date();
  const formattedDate = baseDate.toLocaleDateString('es-ES', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  // Calcular las mejores rachas del salón para el podio
  const topStreaks = initialStudents
    .map(s => ({ ...s, streak: calculateStreak(s.id) }))
    .filter(s => s.streak >= 2)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  return (
    <div className="home-screen">
      
      {/* ================= HERO BANNER PREMIUM CLEAN CLASS ================= */}
      <div className="welcome-section" style={{
        background: 'var(--clean-bg-gradient)',
        padding: '36px 40px',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        boxShadow: 'var(--shadow-premium)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '12px'
      }}>
        {/* Círculo del Logo de Clean Class */}
        <div style={{
          width: '70px',
          height: '70px',
          backgroundColor: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          padding: '4px'
        }}>
          <img 
            src={logoCleanClass} 
            alt="Clean Class Logo" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
          />
        </div>

        <h1 style={{ color: 'white', margin: 0, fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>
          Clean Class
        </h1>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>
          ¡Un aula limpia, un futuro brillante!
        </p>
        
        {/* TEXTO DINÁMICO REPARADO */}
        <span className="privacy-badge" style={{ textTransform: 'capitalize', color: 'var(--text-orange-hover)', marginTop: '4px', fontWeight: 'bold' }}>
          📅 {formattedDate}
        </span>
        
        <p style={{ margin: '8px 0 0 0', opacity: 0.8, fontSize: '13px', maxWidth: '540px', lineHeight: '1.5' }}>
          La plataforma interactiva diseñada para organizar, motivar y mantener nuestros espacios de estudio impecables. ¡El orden lo hacemos todos!
        </p>
      </div>

      {/* ================= VISTA RÁPIDA: ENCARGADOS DE HOY ================= */}
      <div className="ranking-card" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>🧹 Equipo Responsable de Hoy</h3>
          <span className="status-badge badge-success">Asignación Automática</span>
        </div>
        
        {alumnosAsignadosHoy.length === 0 ? (
          <div className="no-students-box" style={{ padding: '40px 20px' }}>
            <p>🏝️ ¡Día libre de aseo!</p>
            <span>Hoy no hay roles programados en la lista.</span>
          </div>
        ) : (
          <div className="cards-container-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {alumnosAsignadosHoy.map(s => (
              <div key={s.id} className="student-card" style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{s.name}</span>
                    {calculateStreak(s.id) >= 2 && (
                      <span style={{ background: '#fff7ed', color: '#ea580c', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: '800' }}>
                        🔥 x{calculateStreak(s.id)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Estado:</span>
                    <span className={`status-badge ${s.status === 'Cumplió' ? 'badge-success' : s.status === 'No cumplió' ? 'badge-danger' : 'badge-warning'}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= SECCIÓN DE RANKING Y ACCESOS ================= */}
      <div className="reports-grid-layout" style={{ gap: '24px' }}>
        
        {/* PODIO DE RACHAS */}
        <div className="ranking-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', textAlign: 'center' }}>🔥 Líderes de Cumplimiento</h3>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 20px 0', textAlign: 'center' }}>
            Alumnos con más asistencias consecutivas perfectas:
          </p>
          
          {topStreaks.length === 0 ? (
            <div className="no-students-box" style={{ border: 'none', padding: '10px', background: 'transparent' }}>
              <p style={{ fontSize: '14px' }}>Sin rachas activas todavía.</p>
              <span>¡Cumple tus guardias para encender tu fuego! 💪</span>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '20px', width: '100%', padding: '10px 0' }}>
              {topStreaks.map((s, index) => {
                const order = index === 0 ? 2 : index === 1 ? 1 : 3;
                const height = index === 0 ? '110px' : index === 1 ? '90px' : '75px';
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";

                return (
                  <div key={s.id} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    order: order,
                    width: '30%'
                  }}>
                    <span style={{ fontSize: '20px', marginBottom: '4px' }}>{medal}</span>
                    <p style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      margin: '0 0 6px 0', 
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}>
                      {s.name.split(',')[1] || s.name}
                    </p>
                    <div style={{ 
                      width: '100%', 
                      height: height, 
                      background: index === 0 ? 'var(--clean-bg-gradient)' : '#e2e8f0',
                      color: index === 0 ? 'white' : '#475569',
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '13px',
                      boxShadow: '0 -4px 12px rgba(0,0,0,0.02)'
                    }}>
                      <span>🔥</span>
                      <span>{s.streak}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="ranking-card" style={{ display: 'flex', flexDirection: 'column', justifyItems: 'center' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>⚡ Accesos del Sistema</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', justifyContent: 'center' }}>
            <button 
              className="main-action-btn" 
              onClick={() => setTab('evidencias')}
              style={{ padding: '16px', fontSize: '13px' }}
            >
              📸 Subir Evidencia Fotográfica
            </button>
            <button 
              className="comment-btn" 
              onClick={() => setTab('limpieza')}
              style={{ 
                padding: '16px', 
                fontSize: '13px', 
                backgroundColor: 'white',
                border: '2px dashed var(--text-orange)'
              }}
            >
              🔒 Panel de Moderación (Control)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}