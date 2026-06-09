import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StudentCard from './components/StudentCard';
import BottomNav from './components/BottomNav';
import Home from './components/Home';
import Evidencias from './components/Evidencias';
import Reports from './components/Reports';
import Profile from './components/Profile';
import './App.css';
import playeraBlanca from './assets/playera-blanca.jpeg';
import playeraGris from './assets/playera-gris.jpeg';
import playeraDeportiva from './assets/playera-deportiva.jpeg';

const INITIAL_STUDENTS_STATIC = [
  { id: 1, name: "Álvarez, Luis" }, { id: 2, name: "Benítez, Ana" }, { id: 3, name: "Castro, Carlos" },
  { id: 4, name: "Díaz, María" }, { id: 5, name: "Espinosa, Jorge" }, { id: 6, name: "Flores, Sofía" },
  { id: 7, name: "García, Juan" }, { id: 8, name: "Hernández, Elena" }, { id: 9, name: "Jiménez, Pedro" },
  { id: 10, name: "López, Laura" }, { id: 11, name: "Martínez, Diego" }, { id: 12, name: "Navarro, Lucía" },
  { id: 13, name: "Ortiz, Miguel" }, { id: 14, name: "Pérez, Valeria" }, { id: 15, name: "Quintana, Raúl" },
  { id: 16, name: "Ramírez, Sara" }, { id: 17, name: "Sánchez, Javier" }, { id: 18, name: "Torres, Daniela" },
  { id: 19, name: "Uribe, Fernando" }, { id: 20, name: "Vargas, Camila" }, { id: 21, name: "Zamora, Alejandro" },
  { id: 22, name: "Aguilar, Mónica" }, { id: 23, name: "Blanco, Roberto" }, { id: 24, name: "Campos, Patricia" },
  { id: 25, name: "Delgado, Ricardo" }, { id: 26, name: "Fuentes, Gabriela" }, { id: 27, name: "Guzmán, Enrique" },
  { id: 28, name: "Herrera, Natalia" }, { id: 29, name: "Ibarra, Francisco" }, { id: 30, name: "Juárez, Cristina" },
  { id: 31, name: "Mendoza, Arturo" }, { id: 32, name: "Ochoa, Silvia" }, { id: 33, name: "Peña, Gonzalo" },
  { id: 34, name: "Ríos, Beatriz" }, { id: 35, name: "Silva, Hugo" }, { id: 36, name: "Vega, Lorena" }
];

function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const PIN_SECRETO = "1234";

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Estado dinámico para admitir altas de alumnos nuevos en tiempo de ejecución
  const [studentsList, setStudentsList] = useState(() => {
    const saved = localStorage.getItem('aseo_lista_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS_STATIC;
  });

  // Cargar historial desde LocalStorage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('aseo_lista_history');
    return saved ? JSON.parse(saved) : {};
  });

  // Guardar matrícula actualizada automáticamente
  useEffect(() => {
    localStorage.setItem('aseo_lista_students', JSON.stringify(studentsList));
  }, [studentsList]);

  // Guardar historial automáticamente
  useEffect(() => {
    localStorage.setItem('aseo_lista_history', JSON.stringify(history));
  }, [history]);

  // Lógica de rotación automática de 4 en 4 por número de lista
  const getEquipoAsignadoParaFecha = (fechaStr) => {
    const dateObj = new Date(fechaStr + "T00:00:00");
    const dayOfWeek = dateObj.getDay(); 

    if (dayOfWeek === 0 || dayOfWeek === 6) return []; 

    const fechaBase = new Date("2026-01-05T00:00:00"); 
    const diferenciaTiempo = dateObj.getTime() - fechaBase.getTime();
    const diasTotales = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
    
    let semanasCompletas = Math.floor(diasTotales / 7);
    let diasRestantes = diasTotales % 7;
    let diasLaborables = (semanasCompletas * 5) + Math.min(diasRestantes, 5);

    const equipoIndex = Math.abs(diasLaborables) % 9; 
    const tamañoEquipo = 4;
    const inicioIndice = equipoIndex * tamañoEquipo; 

    return studentsList.slice(inicioIndice, inicioIndice + tamañoEquipo).map(s => s.id);
  };

  // Calcular racha de cumplimiento consecutivo
  const calculateStreak = (studentId) => {
    const sortedDates = Object.keys(history).sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    for (let date of sortedDates) {
      const dayData = history[date]?.[studentId];
      if (dayData && dayData.asignado) {
        if (dayData.status === "Cumplió") streak++;
        else if (dayData.status === "No cumplió") break;
      }
    }
    return streak;
  };

  // Mapear el estado actual de los alumnos en la fecha seleccionada
  const getStudentsForCurrentDate = () => {
    const idsAsignadosHoy = getEquipoAsignadoParaFecha(selectedDate);
    const dateData = history[selectedDate] || {};

    return studentsList.map(student => {
      const esAsignado = idsAsignadosHoy.includes(student.id);
      const currentStreak = calculateStreak(student.id);
      
      if (dateData[student.id]) {
        return { ...student, ...dateData[student.id], asignado: esAsignado, streak: currentStreak };
      }
      
      return {
        ...student,
        asignado: esAsignado,
        status: esAsignado ? "Cumplió" : "Pendiente",
        hasComment: false,
        comment: "",
        streak: currentStreak,
        fotoEvidencia: null
      };
    });
  };

  const currentStudents = getStudentsForCurrentDate();
  const alumnosAsignadosHoy = currentStudents.filter(s => s.asignado);

  const filteredStudents = currentStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Guardar actualizaciones de los estudiantes en el estado de historial
  const handleUpdateStudent = (id, updatedFields) => {
    setHistory(prev => {
      const currentDayData = prev[selectedDate] || {};
      const alumnoBase = currentStudents.find(s => s.id === id);
      const currentStudentData = currentDayData[id] || { 
        status: alumnoBase.status, 
        hasComment: alumnoBase.hasComment, 
        comment: alumnoBase.comment,
        asignado: alumnoBase.asignado,
        fotoEvidencia: alumnoBase.fotoEvidencia || null
      };
      
      return {
        ...prev,
        [selectedDate]: {
          ...currentDayData,
          [id]: { ...currentStudentData, ...updatedFields }
        }
      };
    });
  };

  // ACCIÓN PRINCIPAL: DAR DE ALTA UN NUEVO ALUMNO
  const handleAddStudent = (nombreNuevoInput) => {
    if (!nombreNuevoInput.trim()) return;
    const nuevoAlumno = {
      id: Date.now(), 
      name: nombreNuevoInput.trim()
    };
    setStudentsList(prev => [...prev, nuevoAlumno]);
  };

  // CORREGIDO: ELIMINAR COMPLETAMENTE AL ALUMNO DEL SISTEMA
  const handleRemoveStudent = (id) => {
    const estudiante = studentsList.find(s => s.id === id);
    const nombreEstudiante = estudiante ? estudiante.name : "este alumno";

    const confirmar = window.confirm(
      `⚠️ ¡ADVERTENCIA DE ELIMINACIÓN PERMANENTE! ⚠️\n\n` +
      `¿Estás completamente seguro de que deseas borrar a "${nombreEstudiante}" del sistema?\n` +
      `Esto lo quitará de la lista global, las rotaciones y eliminará todo su historial permanentemente.`
    );

    if (confirmar) {
      setStudentsList(prev => prev.filter(s => s.id !== id));
      setHistory(prev => {
        const nuevoHistorial = { ...prev };
        Object.keys(nuevoHistorial).forEach(fecha => {
          if (nuevoHistorial[fecha] && nuevoHistorial[fecha][id]) {
            const { [id]: _, ...restoAlumnos } = nuevoHistorial[fecha];
            nuevoHistorial[fecha] = restoAlumnos;
          }
        });
        return nuevoHistorial;
      });
    }
  };

  // ACCIÓN PRINCIPAL: MODIFICAR / EDITAR NOMBRE DE UN ALUMNO GLOBALMENTE
  const handleUpdateStudentDetails = (id, nuevoNombre) => {
    if (!nuevoNombre.trim()) return;
    setStudentsList(prev => prev.map(s => 
      s.id === id ? { ...s, name: nuevoNombre.trim() } : s
    ));
  };

  const toggleAsignacionManual = (id) => {
    const student = currentStudents.find(s => s.id === id);
    const nuevaAsignacion = !student.asignado;
    handleUpdateStudent(id, {
      asignado: nuevaAsignacion,
      status: nuevaAsignacion ? "Cumplió" : "Pendiente"
    });
  };

  const handleTerminarDia = () => {
    const currentDateObj = new Date(selectedDate + "T00:00:00");
    currentDateObj.setDate(currentDateObj.getDate() + 1);
    const year = currentDateObj.getFullYear();
    const month = String(currentDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(currentDateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyToWhatsApp = () => {
    if (alumnosAsignadosHoy.length === 0) return;
    const dateObj = new Date(selectedDate + "T00:00:00");
    const formattedDate = dateObj.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });

    let textMessage = `*🧹 ROL DE LIMPIEZA - ${formattedDate.toUpperCase()}* \n\n`;
    textMessage += `Hola grupo, hoy le corresponde el aseo al siguiente bloque de la lista:\n\n`;
    
    alumnosAsignadosHoy.forEach(s => {
      const rachaIcon = s.streak >= 2 ? ` 🔥x${s.streak}` : '';
      textMessage += `• *${s.name}* (${s.status})${rachaIcon}\n`;
    });

    navigator.clipboard.writeText(textMessage).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    });
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === PIN_SECRETO) {
      setIsAdmin(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // NUEVA UTILERÍA: Determinar qué playera corresponde al día según la fecha seleccionada en el Header
  const getDiaSemanaNumero = () => {
    const dateObj = new Date(selectedDate + "T00:00:00");
    return dateObj.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
  };

  const diaActualId = getDiaSemanaNumero();

  return (
    <div className="phone-container">
      <Header selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      
      <main className="main-content-wrapper">
        {activeTab === 'inicio' && (
          <Home 
            setTab={setActiveTab} 
            history={history} 
            initialStudents={studentsList} 
            alumnosAsignadosHoy={alumnosAsignadosHoy}
            calculateStreak={calculateStreak}
            fechaSeleccionada={selectedDate}
          />
        )}

        {activeTab === 'evidencias' && (
          <Evidencias 
            alumnosAsignadosHoy={alumnosAsignadosHoy}
            onUpdateStudent={handleUpdateStudent}
          />
        )}
        
        {activeTab === 'limpieza' && (
          !isAdmin ? (
            <div className="lock-screen-container">
              <div className="lock-card">
                <span className="lock-icon">🔒</span>
                <h3>Acceso de Moderador</h3>
                <p>Introduce el PIN para justificar, reportar fallas o modificar el equipo de hoy.</p>
                <form onSubmit={handleVerifyPin} className="lock-form">
                  <input 
                    type="password" 
                    placeholder="PIN de acceso" 
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    maxLength={6}
                  />
                  <button type="submit">Desbloquear Panel</button>
                </form>
                {pinError && <p className="error-message">⚠️ PIN incorrecto.</p>}
              </div>
            </div>
          ) : (
            <div className="limpieza-layout-container">
              <div className="selector-alumnos-card">
                <div className="admin-card-header">
                  <h3>Lista por Orden ({studentsList.length})</h3>
                  <button className="btn-logout-admin" onClick={() => setIsAdmin(false)}>🔒 Bloquear</button>
                </div>
                
                <div style={{ padding: '0 0 10px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '10px' }}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.elements.inputAlta;
                    if(input.value.trim()){
                      handleAddStudent(input.value);
                      alert(`✅ ${input.value} agregado a la matrícula global.`);
                      input.value = '';
                    }
                  }} style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      name="inputAlta"
                      type="text" 
                      placeholder="➕ Registrar nuevo alumno..." 
                      style={{ flexGrow: 1, padding: '8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <button type="submit" style={{ padding: '6px 10px', fontSize: '11px', background: '#0088ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Alta</button>
                  </form>
                </div>

                <div className="search-box-container">
                  <input 
                    type="text" 
                    className="search-student-input"
                    placeholder="🔍 Buscar o forzar alumno extra..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="lista-alumnos-grid">
                  {filteredStudents.map((student) => (
                    <button 
                      key={student.id}
                      className={`alumno-selector-item ${student.asignado ? 'seleccionado' : ''}`}
                      onClick={() => toggleAsignacionManual(student.id)}
                    >
                      <span className="check-indicator">{student.asignado ? "🧹" : "👤"}</span>
                      <span className="student-selector-name">
                        {student.name} {student.streak >= 2 && <span className="streak-badge-mini">🔥{student.streak}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="tarjetas-monitoreo-seccion">
                <div className="monitoreo-header">
                  <h3>Cuadrilla por Número de Lista ({alumnosAsignadosHoy.length})</h3>
                  <div className="monitoreo-actions-group">
                    <button 
                      className={`btn-whatsapp-share ${copiedSuccess ? 'copied' : ''}`} 
                      onClick={handleCopyToWhatsApp}
                    >
                      {copiedSuccess ? "📋 ¡Copiado!" : "📲 WhatsApp"}
                    </button>
                    <button className="btn-terminar-dia" onClick={handleTerminarDia}>
                      ➡️ Siguiente Día
                    </button>
                  </div>
                </div>
                
                {alumnosAsignadosHoy.length === 0 ? (
                  <div className="no-students-box">
                    <p>Fin de semana libre de aseo automático.</p>
                  </div>
                ) : (
                  <div className="cards-container-grid">
                    {alumnosAsignadosHoy.map((student) => (
                      <div key={student.id} className="admin-monitoring-card">
                        <StudentCard 
                          student={student}
                          onUpdate={handleUpdateStudent}
                          onRemoveStudent={handleRemoveStudent}
                          onUpdateStudentDetails={handleUpdateStudentDetails}
                        />
                        
                        {student.fotoEvidencia && (
                          <div className="admin-photo-preview-box">
                            <p className="photo-label-admin">👁️ Evidencia subida:</p>
                            <img 
                              src={student.fotoEvidencia} 
                              alt={`Evidencia de ${student.name}`} 
                              className="admin-img-snapshot"
                              onClick={() => window.open(student.fotoEvidencia, '_blank')}
                              title="Haz clic para abrir la foto original"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {activeTab === 'reportes' && (
          <Reports 
            history={history} 
            initialStudents={studentsList} 
            currentDayStudents={alumnosAsignadosHoy} 
          />
        )}

        {activeTab === 'perfil' && <Profile />}

        {/* SECCIÓN DE PLAYERAS TOTALMENTE MEJORADA, INTELIGENTE Y REDISEÑADA */}
        {activeTab === 'playeras' && (
          <div className="home-screen" style={{ padding: '16px', background: '#f8fafc', minHeight: '100%' }}>
            <div className="horario-playeras" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '8px', background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  👕 Uniforme Escolar Diario
                </h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                  Sincronizado de forma reactiva con el calendario del sistema.
                </p>
                {(diaActualId === 0 || diaActualId === 6) && (
                  <div style={{ marginTop: '10px', background: '#f0fdf4', color: '#16a34a', padding: '6px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', border: '1px solid #bbf7d0' }}>
                    🥳 ¡Hoy es fin de semana! Libre de uniforme.
                  </div>
                )}
              </div>

              {/* CARD 1: PLAYERA BLANCA */}
              <div className="playera-card" style={{
                display: 'flex',
                gap: '16px',
                background: 'white',
                padding: '14px',
                borderRadius: '12px',
                border: (diaActualId === 1 || diaActualId === 4) ? '2px solid #0284c7' : '1px solid #e2e8f0',
                boxShadow: (diaActualId === 1 || diaActualId === 4) ? '0 4px 12px rgba(2, 132, 199, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                position: 'relative',
                transform: (diaActualId === 1 || diaActualId === 4) ? 'scale(1.01)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}>
                {(diaActualId === 1 || diaActualId === 4) && (
                  <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#0284c7', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ Toca Llevar Hoy</span>
                )}
                <img src={playeraBlanca} alt="Playera blanca" style={{ width: '75px', height: '75px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Playera Polo Blanca</h3>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Días correspondientes:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: diaActualId === 1 ? '#0284c7' : '#f1f5f9', color: diaActualId === 1 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Lunes</span>
                    <span style={{ background: diaActualId === 4 ? '#0284c7' : '#f1f5f9', color: diaActualId === 4 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Jueves</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: PLAYERA GRIS */}
              <div className="playera-card" style={{
                display: 'flex',
                gap: '16px',
                background: 'white',
                padding: '14px',
                borderRadius: '12px',
                border: (diaActualId === 2 || diaActualId === 5) ? '2px solid #64748b' : '1px solid #e2e8f0',
                boxShadow: (diaActualId === 2 || diaActualId === 5) ? '0 4px 12px rgba(100, 116, 139, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                position: 'relative',
                transform: (diaActualId === 2 || diaActualId === 5) ? 'scale(1.01)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}>
                {(diaActualId === 2 || diaActualId === 5) && (
                  <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#64748b', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ Toca Llevar Hoy</span>
                )}
                <img src={playeraGris} alt="Playera gris" style={{ width: '75px', height: '75px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Playera Polo Gris</h3>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Días correspondientes:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: diaActualId === 2 ? '#64748b' : '#f1f5f9', color: diaActualId === 2 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Martes</span>
                    <span style={{ background: diaActualId === 5 ? '#64748b' : '#f1f5f9', color: diaActualId === 5 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Viernes</span>
                  </div>
                </div>
              </div>

              {/* CARD 3: PLAYERA DEPORTIVA */}
              <div className="playera-card" style={{
                display: 'flex',
                gap: '16px',
                background: 'white',
                padding: '14px',
                borderRadius: '12px',
                border: diaActualId === 3 ? '2px solid #ea580c' : '1px solid #e2e8f0',
                boxShadow: diaActualId === 3 ? '0 4px 12px rgba(234, 88, 12, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                position: 'relative',
                transform: diaActualId === 3 ? 'scale(1.01)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}>
                {diaActualId === 3 && (
                  <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#ea580c', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ Toca Llevar Hoy</span>
                )}
                <img src={playeraDeportiva} alt="Playera deportiva" style={{ width: '75px', height: '75px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Playera Deportiva (EFE)</h3>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Días correspondientes:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: diaActualId === 3 ? '#ea580c' : '#f1f5f9', color: diaActualId === 3 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Miércoles</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;  