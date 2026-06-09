import React from 'react';

export default function Reports({ history, initialStudents, currentDayStudents }) {
  
  // Calcular asistencias y faltas por texto
  const studentStats = initialStudents.map(student => {
    let asistencias = 0;
    let faltas = 0;
    let comentarios = [];

    Object.keys(history).forEach(date => {
      const dayData = history[date]?.[student.id];
      if (dayData && dayData.asignado) {
        if (dayData.status === "Cumplió") asistencias++;
        if (dayData.status === "No cumplió") faltas++;
        if (dayData.hasComment && dayData.comment.trim() !== "") {
          comentarios.push({ date, text: dayData.comment });
        }
      }
    });

    return { ...student, asistencias, faltas, comentarios };
  });

  const leaderboard = [...studentStats].sort((a, b) => {
    if (b.asistencias !== a.asistencias) return b.asistencias - a.asistencias;
    return a.faltas - b.faltas;
  });

  const todosLosComentarios = studentStats.reduce((acc, student) => {
    student.comentarios.forEach(com => {
      acc.push({ name: student.name, date: com.date, text: com.text });
    });
    return acc;
  }, []).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Cálculo de KPIs rápidos para las tarjetas superiores de métricas
  const totalAsistenciasGral = studentStats.reduce((sum, s) => sum + s.asistencias, 0);
  const totalFaltasGral = studentStats.reduce((sum, s) => sum + s.faltas, 0);
  const totalAcciones = totalAsistenciasGral + totalFaltasGral;
  const porcentajeEfectividad = totalAcciones > 0 
    ? Math.round((totalAsistenciasGral / totalAcciones) * 100) 
    : 100;

  return (
    <div className="reports-screen">
      {/* Encabezado Principal */}
      <div className="welcome-section">
        <h1>Estadísticas e <span>Historial</span></h1>
      </div>

      {/* BLOQUE INTERMEDIO: Tarjeta de Porcentaje General de Eficiencia */}
      <div className="progress-section-card">
        <div className="percentage-display">
          <div>
            <span className="big-percentage">{porcentajeEfectividad}%</span>
            <div className="progress-info-text">Eficiencia general del grupo en el aseo</div>
          </div>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${porcentajeEfectividad}%` }}
          ></div>
        </div>
      </div>

      {/* GRID DE MÉTRICAS RÁPIDAS (KPIs) */}
      <div className="metrics-row-three">
        <div className="metric-box box-green">
          <h4>Tareas Cumplidas</h4>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
            {totalAsistenciasGral}
          </span>
        </div>
        <div className="metric-box box-red">
          <h4>Inasistencias</h4>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
            {totalFaltasGral}
          </span>
        </div>
        <div className="metric-box box-yellow">
          <h4>Reportes Emitidos</h4>
          <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
            {todosLosComentarios.length}
          </span>
        </div>
      </div>

      {/* ESTRUCTURA DE DOS COLUMNAS (Equipo de hoy y Muro de la fama) */}
      <div className="reports-grid-layout">
        
        {/* Columna Izquierda: Alumnos Asignados Hoy */}
        <div className="ranking-card">
          <h3>📅 Equipo Asignado Hoy</h3>
          {currentDayStudents.length === 0 ? (
            <div className="no-students-box" style={{ padding: '30px 20px' }}>
              <p>Sin asignaciones automáticas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {currentDayStudents.map(s => (
                <div key={s.id} className="report-team-row">
                  <span><strong>{s.name}</strong></span>
                  <span className={`status-badge ${s.status === 'Cumplió' ? 'badge-success' : s.status === 'No cumplió' ? 'badge-danger' : 'badge-warning'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Muro de la Fama / Tabla de Posiciones */}
        <div className="ranking-card">
          <h3>🏆 Tabla de Cumplimiento</h3>
          <div className="ranking-table-container">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>Pos</th>
                  <th>Alumno</th>
                  <th style={{ textAlign: 'center' }}>Cumplió</th>
                  <th style={{ textAlign: 'center' }}>Falló</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((student, index) => (
                  <tr key={student.id} className={index < 3 ? 'top-three' : ''}>
                    <td style={{ textAlign: 'center', fontWeight: '800' }}>
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                    </td>
                    <td>{student.name}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0369a1' }}>{student.asistencias}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#f43f5e' }}>{student.faltas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: Muro de Observaciones Estilo Cronología (Timeline) */}
      <div className="comments-log-card">
        <h3>💬 Muro de Observaciones y Novedades</h3>
        {todosLosComentarios.length === 0 ? (
          <div className="no-students-box" style={{ border: 'none', padding: '20px' }}>
            <span>No hay comentarios ni reportes por el momento.</span>
          </div>
        ) : (
          <ul className="log-list">
            {todosLosComentarios.map((c, i) => (
              <li key={i} className="log-item">
                <div className="log-item-content">
                  <span className="log-item-timestamp">📅 {c.date} — {c.name}</span>
                  <p className="log-item-text">"{c.text}"</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}