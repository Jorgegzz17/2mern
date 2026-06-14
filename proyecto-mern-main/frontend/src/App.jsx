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

// URL del backend local (de Sergio)
const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const PIN_SECRETO = "1234";

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Estados dinámicos conectados a la Base de Datos
  const [studentsList, setStudentsList] = useState([]);
  const [tasksDay, setTasksDay] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ PETICIÓN: Traer todos los alumnos registrados en el backend al iniciar la app
  useEffect(() => {
    fetch(`${API_BASE_URL}/users?role=ESTUDIANTE`) // Ajustar según el endpoint real de Sergio
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Mapeamos los campos de Sergio (nombre, _id) a los que usa tu interfaz actual
          const formattedStudents = data.map(s => ({
            id: s._id,
            name: s.nombre,
            equipoLimpieza: s.equipoLimpieza || 'SIN EQUIPO',
            grupo: s.grupo
          }));
          setStudentsList(formattedStudents);
        }
      })
      .catch(err => console.error("Error cargando estudiantes:", err));
  }, []);

  // 2️⃣ PETICIÓN: Cada vez que cambie la fecha seleccionada, traer las tareas asignadas para ese día
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/tasks?fecha=${selectedDate}`) // Ajustar según el endpoint de Sergio para filtrar fechas
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasksDay(data);
        } else {
          setTasksDay([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando tareas del día:", err);
        setLoading(false);
      });
  }, [selectedDate]);

  // Racha calculada de forma dinámica basada en tareas previas
  const calculateStreak = (studentId) => {
    // Aquí puedes dejar la lógica local o calcularla si Sergio tiene un endpoint de racha
    return 0; 
  };

  // Mapear los estudiantes uniendo sus datos globales con sus tareas específicas del día actual
  const getStudentsForCurrentDate = () => {
    return studentsList.map(student => {
      // Buscamos si este estudiante tiene una tarea asignada en el día seleccionado
      const tareaAsignadaObj = tasksDay.find(t => t.estudianteAsignado === student.id || t.estudianteAsignado?._id === student.id);
      
      const esAsignado = !!tareaAsignadaObj;
      let statusActual = "Pendiente";
      
      if (esAsignado) {
        if (tareaAsignadaObj.estado === "COMPLETADO") statusActual = "Cumplió";
        if (tareaAsignadaObj.estado === "INCUMPLIDO") statusActual = "No cumplió";
      }

      return {
        ...student,
        asignado: esAsignado,
        status: statusActual,
        hasComment: !!tareaAsignadaObj?.descripcion,
        comment: tareaAsignadaObj?.descripcion || "",
        streak: calculateStreak(student.id),
        fotoEvidencia: tareaAsignadaObj?.fotoEvidencia || null,
        taskId: tareaAsignadaObj?._id // Guardamos el ID de la tarea para poder actualizarla
      };
    });
  };

  const currentStudents = getStudentsForCurrentDate();
  const alumnosAsignadosHoy = currentStudents.filter(s => s.asignado);

  const filteredStudents = currentStudents.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3️⃣ PETICIÓN: Guardar o actualizar el estatus de un alumno (Cumplió/No cumplió) en el servidor de Sergio
  const handleUpdateStudent = (id, updatedFields) => {
    const student = currentStudents.find(s => s.id === id);
    if (!student || !student.taskId) return;

    // Traducimos tus estados visuales a las constantes ENUM de Sergio
    let nuevoEstadoBackend = "PENDIENTE";
    if (updatedFields.status === "Cumplió") nuevoEstadoBackend = "COMPLETADO";
    if (updatedFields.status === "No cumplió") nuevoEstadoBackend = "INCUMPLIDO";

    fetch(`${API_BASE_URL}/tasks/${student.taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: nuevoEstadoBackend,
        descripcion: updatedFields.comment || student.comment
      })
    })
    .then(res => res.json())
    .then(updatedTask => {
      // Actualizamos el estado de la lista de tareas en tiempo real
      setTasksDay(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    })
    .catch(err => console.error("Error al actualizar tarea en backend:", err));
  };

  // 4️⃣ PETICIÓN: Dar de alta un alumno directamente en la base de datos de MongoDB Atlas
  const handleAddStudent = (nombreNuevoInput) => {
    if (!nombreNuevoInput.trim()) return;
    
    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombreNuevoInput.trim(),
        role: 'ESTUDIANTE',
        password: 'password123', // Contraseña por defecto requerida por el modelo de Sergio
        grupo: '4-B' // Grupo base ajustable
      })
    })
    .then(res => res.json())
    .then(newUser => {
      if(newUser._id) {
        setStudentsList(prev => [...prev, {
          id: newUser._id,
          name: newUser.nombre,
          equipoLimpieza: 'SIN EQUIPO',
          grupo: newUser.grupo
        }]);
        alert(`✅ ${newUser.nombre} guardado exitosamente en MongoDB.`);
      }
    })
    .catch(err => console.error("Error al registrar alumno:", err));
  };

  // 5️⃣ PETICIÓN: Eliminar completamente al alumno del servidor
  const handleRemoveStudent = (id) => {
    const estudiante = studentsList.find(s => s.id === id);
    if (!estudiante) return;

    const confirmar = window.confirm(
      `⚠️ ¡ADVERTENCIA DE ELIMINACIÓN PERMANENTE! ⚠️\n\n` +
      `¿Borrar a "${estudiante.name}" de la Base de Datos de MongoDB de forma definitiva?`
    );

    if (confirmar) {
      fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' })
        .then(() => {
          setStudentsList(prev => prev.filter(s => s.id !== id));
        })
        .catch(err => console.error("Error al eliminar alumno del backend:", err));
    }
  };

  const handleUpdateStudentDetails = (id, nuevoNombre) => {
    if (!nuevoNombre.trim()) return;
    fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoNombre.trim() })
    })
    .then(() => {
      setStudentsList(prev => prev.map(s => s.id === id ? { ...s, name: nuevoNombre.trim() } : s));
    })
    .catch(err => console.error("Error al renombrar alumno:", err));
  };

  // 6️⃣ PETICIÓN: Forzar asignación manual creando una nueva tarea en el día actual
  const toggleAsignacionManual = (id) => {
    const student = currentStudents.find(s => s.id === id);
    
    if (student.asignado) {
      // Si ya estaba asignado, borramos la tarea en el backend
      fetch(`${API_BASE_URL}/tasks/${student.taskId}`, { method: 'DELETE' })
        .then(() => {
          setTasksDay(prev => prev.filter(t => t._id !== student.taskId));
        })
        .catch(err => console.error("Error al remover asignación:", err));
    } else {
      // Si no estaba asignado, creamos un documento nuevo en 'tasks'
      fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: 'Aseo asignado manualmente',
          grupo: student.grupo || '4-B',
          estudianteAsignado: id,
          equipoLimpieza: student.equipoLimpieza || 'EQUIPO GENERAL',
          fechaEntrega: selectedDate
        })
      })
      .then(res => res.json())
      .then(newTask => {
        setTasksDay(prev => [...prev, newTask]);
      })
      .catch(err => console.error("Error al crear tarea manual:", err));
    }
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
      textMessage += `• *${s.name}* (${s.status})\n`;
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

  const getDiaSemanaNumero = () => {
    const dateObj = new Date(selectedDate + "T00:00:00");
    return dateObj.getDay();
  };

  const diaActualId = getDiaSemanaNumero();

  if (loading && studentsList.length === 0) {
    return <div className="phone-container" style={{display:'flex', justifyContent:'center', alignItems:'center', color:'#64748b', fontWeight:'700'}}>🔌 Conectando con el Servidor...</div>;
  }

  return (
    <div className="phone-container">
      <Header selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
      
      <main className="main-content-wrapper">
        {activeTab === 'inicio' && (
          <Home 
            setTab={setActiveTab} 
            history={{}} 
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
                <p>Introduce el PIN para gestionar altas, bajas o modificar asignaciones directas en MongoDB.</p>
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
                  <h3>Matrícula en BD ({studentsList.length})</h3>
                  <button className="btn-logout-admin" onClick={() => setIsAdmin(false)}>🔒 Bloquear</button>
                </div>
                
                <div style={{ padding: '0 0 10px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '10px' }}>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.elements.inputAlta;
                    if(input.value.trim()){
                      handleAddStudent(input.value);
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
                    placeholder="🔍 Buscar alumno..." 
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
                      <span className="student-selector-name">{student.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="tarjetas-monitoreo-seccion">
                <div className="monitoreo-header">
                  <h3>Asignados Hoy en BD ({alumnosAsignadosHoy.length})</h3>
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
                    <p>No hay alumnos asignados a limpieza en esta fecha.</p>
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
            history={{}} 
            initialStudents={studentsList} 
            currentDayStudents={alumnosAsignadosHoy} 
          />
        )}

        {activeTab === 'perfil' && <Profile />}

        {activeTab === 'playeras' && (
          <div className="home-screen" style={{ padding: '16px', background: '#f8fafc', minHeight: '100%' }}>
            <div className="horario-playeras" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px', background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>👕 Uniforme Escolar Diario</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Sincronizado reactivamente con el sistema.</p>
              </div>

              {/* CARD 1: BLANCA */}
              <div className="playera-card" style={{ display: 'flex', gap: '16px', background: 'white', padding: '14px', borderRadius: '12px', border: (diaActualId === 1 || diaActualId === 4) ? '2px solid #0284c7' : '1px solid #e2e8f0', position: 'relative' }}>
                {(diaActualId === 1 || diaActualId === 4) && <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#0284c7', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>⚡ Toca Llevar Hoy</span>}
                <img src={playeraBlanca} alt="Playera blanca" style={{ width: '75px', height: '75px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700' }}>Playera Polo Blanca</h3>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: diaActualId === 1 ? '#0284c7' : '#f1f5f9', color: diaActualId === 1 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>Lunes</span>
                    <span style={{ background: diaActualId === 4 ? '#0284c7' : '#f1f5f9', color: diaActualId === 4 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>Jueves</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: GRIS */}
              <div className="playera-card" style={{ display: 'flex', gap: '16px', background: 'white', padding: '14px', borderRadius: '12px', border: (diaActualId === 2 || diaActualId === 5) ? '2px solid #64748b' : '1px solid #e2e8f0', position: 'relative' }}>
                {(diaActualId === 2 || diaActualId === 5) && <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#64748b', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>⚡ Toca Llevar Hoy</span>}
                <img src={playeraGris} alt="Playera gris" style={{ width: '75px', height: '75px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700' }}>Playera Polo Gris</h3>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: diaActualId === 2 ? '#64748b' : '#f1f5f9', color: diaActualId === 2 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>Martes</span>
                    <span style={{ background: diaActualId === 5 ? '#64748b' : '#f1f5f9', color: diaActualId === 5 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>Viernes</span>
                  </div>
                </div>
              </div>

              {/* CARD 3: DEPORTIVA */}
              <div className="playera-card" style={{ display: 'flex', gap: '16px', background: 'white', padding: '14px', borderRadius: '12px', border: diaActualId === 3 ? '2px solid #ea580c' : '1px solid #e2e8f0', position: 'relative' }}>
                {diaActualId === 3 && <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#ea580c', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>⚡ Toca Llevar Hoy</span>}
                <img src={playeraDeportiva} alt="Playera deportiva" style={{ width: '75px', height: '75px', borderRadius: '8px', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700' }}>Playera Deportiva (EFE)</h3>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: diaActualId === 3 ? '#ea580c' : '#f1f5f9', color: diaActualId === 3 ? 'white' : '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>Miércoles</span>
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