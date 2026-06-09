import React from 'react';

export default function Header({ selectedDate, setSelectedDate }) {
  // Formatear la fecha elegida para mostrarla bonita
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateObj = new Date(selectedDate + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString('es-ES', options);

  return (
    <header className="app-header">
      <div className="header-top">
        <button className="back-btn">❮</button>
        <h2>Sistema de Registro de Aseo</h2>
        <div className="calendar-wrapper">
          <label htmlFor="global-calendar">📆 Cambiar Fecha: </label>
          <input 
            type="date" 
            id="global-calendar"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="header-date-input"
          />
        </div>
      </div>
      
      <div className="header-date-section">
        <h3 style={{ textTransform: 'capitalize' }}>{formattedDate}</h3>
        <p className="privacy-badge">
          <span className="check-icon">✓</span> Persistencia Activa (Guardado Local Automático)
        </p>
      </div>
    </header>
  );
}