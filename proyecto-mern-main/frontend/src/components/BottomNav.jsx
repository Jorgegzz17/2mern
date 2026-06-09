import React from 'react';

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav-bar">
      {/* 1. INICIO */}
      <button 
        className={`nav-item-btn ${activeTab === 'inicio' ? 'active' : ''}`}
        onClick={() => setActiveTab('inicio')}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Inicio</span>
      </button>

      {/* 2. EVIDENCIAS (Para los muchachos) */}
      <button 
        className={`nav-item-btn ${activeTab === 'evidencias' ? 'active' : ''}`}
        onClick={() => setActiveTab('evidencias')}
      >
        <span className="nav-icon">📸</span>
        <span className="nav-label">Evidencias</span>
      </button>

      {/* 3. LIMPIEZA (Panel Moderador con PIN) */}
      <button 
        className={`nav-item-btn ${activeTab === 'limpieza' ? 'active' : ''}`}
        onClick={() => setActiveTab('limpieza')}
      >
        <span className="nav-icon">🧹</span>
        <span className="nav-label">Limpieza</span>
      </button>

      {/* 4. HISTORIAL (Tabla de posiciones y reportes) */}
      <button 
        className={`nav-item-btn ${activeTab === 'reportes' ? 'active' : ''}`}
        onClick={() => setActiveTab('reportes')}
      >
        <span className="nav-icon">📊</span>
        <span className="nav-label">Historial</span>
      </button>

      {/* 5. PERFIL */}
      <button 
        className={`nav-item-btn ${activeTab === 'perfil' ? 'active' : ''}`}
        onClick={() => setActiveTab('perfil')}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Perfil</span>
      </button>

      {/* 6. HORARIO DE PLAYERAS */}
      <button 
        className={`nav-item-btn ${activeTab === 'playeras' ? 'active' : ''}`}
        onClick={() => setActiveTab('playeras')}
      >
        <span className="nav-icon">👕</span>
        <span className="nav-label">Horario de playeras</span>
      </button>
    </nav>
  );
}