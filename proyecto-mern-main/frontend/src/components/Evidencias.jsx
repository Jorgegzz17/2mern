import React, { useState } from 'react';

export default function Evidencias({ alumnosAsignadosHoy, onUpdateStudent }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const dateObj = new Date(todayStr + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString('es-ES', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  // Lista de tareas requeridas para el aseo del aula
  const TAREAS_LIMPIEZA = [
    { id: 'basura', texto: 'Recoger la basura del salón' },
    { id: 'bote', texto: 'Tirar el bote de basura al contenedor principal al terminar' },
    { id: 'filas', texto: 'Acomodar perfectamente las filas de bancos' },
    { id: 'pizarron', texto: 'Borrar por completo el pizarrón' }
  ];

  // Estado local para manejar las tareas hechas por cada alumno
  const [tareasCheck, setTareasCheck] = useState({});

  // Función para marcar/desmarcar tareas de forma independiente por alumno
  const toggleTarea = (studentId, tareaId) => {
    const clave = `${studentId}-${tareaId}`;
    setTareasCheck(prev => ({
      ...prev,
      [clave]: !prev[clave]
    }));
  };

  // Captura la foto usando la cámara del celular y la convierte en texto temporal
  const handleFileChange = (studentId, e) => {
    const file = e.target.files[0];
    if (file) {
      // Feedback visual para el usuario: Indica que la imagen se está procesando
      const cardInner = e.target.closest('.student-card-inner');
      if (cardInner) {
        cardInner.style.opacity = '0.5';
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Al completar la lectura, actualiza el estado del alumno con la imagen en Base64
        onUpdateStudent(studentId, { fotoEvidencia: reader.result });
        
        // Restaura la opacidad y muestra un mensaje de confirmación
        if (cardInner) {
          cardInner.style.opacity = '1';
        }
        alert("¡Evidencia de foto cargada correctamente! Tu reporte está completo.");
      };
      
      // Manejo de errores en la lectura del archivo
      reader.onerror = () => {
        if (cardInner) {
          cardInner.style.opacity = '1';
        }
        alert("Hubo un error al intentar leer la imagen. Por favor, inténtalo de nuevo.");
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="reports-screen evidencias-page-container">
      
      {/* Banner Principal - Zona de Auto-Reporte */}
      <div className="welcome-section evidences-banner" style={{
        background: 'var(--clean-bg-gradient)',
        padding: '24px 30px',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        boxShadow: 'var(--shadow-premium)',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>📸</span>
          <h1 style={{ color: 'white', margin: 0, fontSize: '26px' }}>Zona de Auto-Reporte</h1>
        </div>
        <p style={{ margin: '2px 0 0 0', textTransform: 'capitalize', fontWeight: '600', opacity: 0.95, fontSize: '14px' }}>
          {formattedDate}
        </p>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '12px' }}>
          Espacio exclusivo para el equipo encargado del aseo diario
        </p>
      </div>

      {alumnosAsignadosHoy.length === 0 ? (
        <div className="no-students-box" style={{ marginTop: '24px' }}>
          <p>🏝️ ¡Hoy es fin de semana o día libre!</p>
          <span>No hay aseo programado ni asignaciones automáticas para hoy.</span>
        </div>
      ) : (
        <div className="ranking-card" style={{ marginTop: '24px', width: '100%' }}>
          
          {/* Encabezado de la sección */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>👥 Lista de Verificación del Equipo</h3>
            <span className="status-badge badge-warning" style={{ animation: 'pulse 2s infinite' }}>
              🔴 Modo Auto-Asistencia Abierto
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.5' }}>
            Busca tu nombre en la lista, confirma tu asistencia, marca las tareas realizadas y tómate una foto limpiando tu área asignada antes de retirarte del salón.
          </p>
          
          {/* Grid de Alumnos Asignados */}
          <div className="reports-grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {alumnosAsignadosHoy.map(s => (
              <div key={s.id} className="student-card" style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Contenedor interno con clase para feedback visual */}
                <div className="student-card-inner" style={{ transition: 'opacity 0.3s ease', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  
                  {/* Barra indicadora de color superior según estado */}
                  <div style={{ 
                    height: '5px', 
                    width: '100%', 
                    background: s.status === 'Cumplió' ? '#10b981' : s.status === 'No cumplió' ? '#ef4444' : '#f59e0b' 
                  }}></div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
                    
                    {/* Fila superior: Nombre y Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{s.name}</span>
                      <span className={`status-badge ${s.status === 'Cumplió' ? 'badge-success' : s.status === 'No cumplió' ? 'badge-danger' : 'badge-warning'}`}>
                        {s.status === 'Cumplió' ? "✅ Presente" : s.status === 'No cumplió' ? "❌ Ausente" : "⏳ Pendiente"}
                      </span>
                    </div>

                    {/* Acciones de Selección de Asistencia */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button 
                        className={`action-self-btn yes ${s.status === 'Cumplió' ? 'active' : ''}`}
                        onClick={() => onUpdateStudent(s.id, { status: "Cumplió" })}
                        style={{
                          padding: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          border: s.status === 'Cumplió' ? '2px solid #10b981' : '1px solid #cbd5e1',
                          background: s.status === 'Cumplió' ? '#ecfdf5' : 'white',
                          color: s.status === 'Cumplió' ? '#065f46' : '#64748b',
                          transition: 'all 0.2s'
                        }}
                      >
                        🙋‍♂️ Llegué
                      </button>
                      <button 
                        className={`action-self-btn no ${s.status === 'No cumplió' ? 'active' : ''}`}
                        onClick={() => onUpdateStudent(s.id, { status: "No cumplió" })}
                        style={{
                          padding: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          border: s.status === 'No cumplió' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                          background: s.status === 'No cumplió' ? '#fef2f2' : 'white',
                          color: s.status === 'No cumplió' ? '#991b1b' : '#64748b',
                          transition: 'all 0.2s'
                        }}
                      >
                        🚫 No vine
                      </button>
                    </div>

                    {/* LISTA DE TAREAS PENDIENTES */}
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📋 Actividades Requeridas:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {TAREAS_LIMPIEZA.map((tarea) => {
                          const completada = !!tareasCheck[`${s.id}-${tarea.id}`];
                          return (
                            <label 
                              key={tarea.id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                fontSize: '12px', 
                                color: completada ? '#94a3b8' : '#334155',
                                textDecoration: completada ? 'line-through' : 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <input 
                                type="checkbox" 
                                checked={completada} 
                                onChange={() => toggleTarea(s.id, tarea.id)}
                                style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                              />
                              <span>{tarea.texto}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                  {/* Contenedor Multimedia / Foto de Evidencia */}
                    <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                      {s.fotoEvidencia ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                            <img 
                              src={s.fotoEvidencia} 
                              alt="Evidencia de aseo" 
                              className="evidence-img-preview" 
                              style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                          <label className="change-photo-label" style={{
                            fontSize: '11px',
                            color: '#0284c7',
                            fontWeight: '600',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'block',
                            padding: '4px'
                          }}>
                            📸 Cambiar Foto o Evidencia
                            {/* Input con capture="environment" para abrir la cámara trasera */}
                            <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(s.id, e)} style={{ display: 'none' }} />
                          </label>
                        </div>
                      ) : (
                        <label className="upload-photo-btn" style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px',
                          background: 'white',
                          border: '2px dashed #cbd5e1',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#475569',
                          transition: 'all 0.2s'
                        }}>
                          📷 Tomar Foto de Evidencia
                          {/* Input con capture="environment" para abrir la cámara trasera */}
                          <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(s.id, e)} style={{ display: 'none' }} />
                        </label>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}