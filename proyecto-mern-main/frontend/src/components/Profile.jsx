import React, { useState } from 'react';

export default function Profile() {
  // Estados para simular interactividad dentro del perfil
  const [salon, setSalon] = useState("3° Año - Grupo B");
  const [notificaciones, setNotificaciones] = useState(true);

  return (
    <div className="reports-screen profile-page-container">
      
      {/* ================= HEADER TARJETA DE PERFIL PREMIUM ================= */}
      <div className="welcome-section profile-header-card" style={{
        background: 'var(--clean-bg-gradient)',
        padding: '36px 30px',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        boxShadow: 'var(--shadow-premium)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '40px',
          background: 'rgba(255, 255, 255, 0.2)',
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(5px)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          marginBottom: '4px'
        }}>
          👨&zwj;🏫
        </div>
        <h2 style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '800' }}>
          Prof. Sergio Juárez
        </h2>
        <span className="status-badge badge-warning" style={{ 
          background: 'rgba(255, 255, 255, 0.2)', 
          color: 'white', 
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontSize: '11px',
          fontWeight: '700'
        }}>
          🛡️ Administrador de Aseo
        </span>
        <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '13px', fontWeight: '500' }}>
          🏫 Instituto Escolar General Escobedo
        </p>
      </div>

      {/* ================= CONFIGURACIÓN Y PARÁMETROS ================= */}
      <div className="ranking-card" style={{ marginTop: '24px', width: '100%' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>⚙️ Configuración del Salón</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Selector de Grupo */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px'
          }}>
            <label htmlFor="salon-select" style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              color: '#475569' 
            }}>
              Grupo Asignado bajo Gestión:
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <select 
                id="salon-select" 
                value={salon} 
                onChange={(e) => setSalon(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitAppearance: 'none'
                }}
              >
                <option value="3° Año - Grupo A">3° Año - Grupo A</option>
                <option value="3° Año - Grupo B">3° Año - Grupo B</option>
                <option value="4° Año - Grupo A">4° Año - Grupo A</option>
              </select>
              <span style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                pointerEvents: 'none',
                fontSize: '12px'
              }}>🔽</span>
            </div>
          </div>

          {/* Selector de Notificaciones (Toggle Swapper) */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '14px 16px',
            background: '#f8fafc',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Alertas de Incumplimiento</span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Notificar incidencias o inasistencias críticas</span>
            </div>
            <button 
              onClick={() => setNotificaciones(!notificaciones)}
              className="status-badge"
              style={{ 
                cursor: 'pointer',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                backgroundColor: notificaciones ? '#ecfdf5' : '#f1f5f9',
                color: notificaciones ? '#059669' : '#64748b',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}
            >
              {notificaciones ? "🟢 Activadas 自由" : "⚪ Silenciadas 🔕"}
            </button>
          </div>

        </div>
      </div>

      {/* ================= METADATOS DEL SOFTWARE ================= */}
      <div className="ranking-card" style={{ marginTop: '24px', width: '100%' }}>
        <h3 style={{ margin: '0 0 16px 0' }}>📊 Información del Sistema</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingBottom: '10px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Versión del Core</span>
            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '700' }}>v1.0.0 (Estable)</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Almacenamiento Global</span>
            <span className="status-badge" style={{ background: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: '700' }}>
              💻 Local (React State)
            </span>
          </div>
        </div>
      </div>

      {/* ================= BOTÓN DE SALIDA ================= */}
      <button 
        className="comment-btn" 
        onClick={() => alert("Simulando cierre de sesión... ¡Volviendo a cargar sistema!")}
        style={{ 
          width: '100%', 
          marginTop: '28px', 
          padding: '14px', 
          fontSize: '13px',
          fontWeight: '700',
          color: '#dc2626',
          backgroundColor: '#fef2f2',
          border: '1px dashed #fca5a5',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#fee2e2';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#fef2f2';
        }}
      >
        Cerrar Sesión del Sistema 🚪
      </button>

    </div>
  );
}