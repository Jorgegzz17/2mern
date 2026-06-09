import React, { useState } from 'react';

export default function StudentCard({ 
  student, 
  
  onUpdate, 
  onRemoveStudent,       
  onUpdateStudentDetails 
}) {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentText, setCommentText] = useState(student.comment || "");
  
  // Estados para la edición/modificación del nombre del alumno
  const [isEditingName, setIsEditingName] = useState(false);
  const [newNameText, setNewNameText] = useState(student.name);

  const handleSaveComment = (e) => {
    e.preventDefault();
    onUpdate(student.id, { 
      comment: commentText, 
      hasComment: commentText.trim() !== "" 
    });
    setIsEditingComment(false);
  };

  // CORREGIDO: Guarda correctamente el cambio llamando a la función global
  const handleSaveName = (e) => {
    e.preventDefault();
    if (!newNameText.trim()) return;
    onUpdateStudentDetails(student.id, newNameText.trim());
    setIsEditingName(false);
  };

  // CORREGIDO: Llama directamente al borrado global de App_3.jsx
  const handleBaja = () => {
    onRemoveStudent(student.id);
  };

  // Mapeo preciso de clases basadas en el estado
  let statusBarColor = "#e2e8f0"; 
  let badgeClass = "badge-warning"; 
  
  if (student.status === "Cumplió") {
    statusBarColor = "#10b981";
    badgeClass = "badge-success";
  } else if (student.status === "No cumplió") {
    statusBarColor = "#ef4444";
    badgeClass = "badge-danger";
  } else if (student.status === "Justificado") {
    statusBarColor = "#f59e0b";
    badgeClass = "badge-warning";
  }

  return (
    <div className="student-card" style={{ 
      background: 'white', 
      border: '1px solid #e2e8f0', 
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Barra superior de estado fluida */}
      <div style={{ height: '5px', width: '100%', background: statusBarColor, transition: 'background 0.3s' }}></div>
      
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
        
        {/* FILA SUPERIOR: Botones de Administración Críticos (Editar / Dar de Baja de forma definitiva) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Gestión Matrícula</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => setIsEditingName(!isEditingName)} 
              style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600', color: '#0284c7' }}
            >
              ✏️ {isEditingName ? "Cerrar" : "Modificar"}
            </button>
            <button 
              onClick={handleBaja} 
              style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer', fontWeight: '700', color: '#dc2626' }}
            >
              🗑️ Eliminar Sistema
            </button>
          </div>
        </div>

        {/* SUB-FORMULARIO: Panel para Modificar Nombre */}
        {isEditingName && (
          <form onSubmit={handleSaveName} style={{ background: '#f0f9ff', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1' }}>Corregir o Cambiar Alumno:</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="text" 
                value={newNameText} 
                onChange={(e) => setNewNameText(e.target.value)} 
                style={{ flexGrow: 1, padding: '6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
              />
              <button type="submit" className="main-action-btn" style={{ padding: '4px 10px', fontSize: '11px' }}>Guardar</button>
            </div>
          </form>
        )}

        {/* FILA NOMBRE: Información de Identidad */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {student.name}
              {student.streak >= 2 && (
                <span style={{ background: '#fff7ed', color: '#ea580c', padding: '2px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '800' }}>
                  🔥 {student.streak}
                </span>
              )}
            </h4>
            <span className={`status-badge ${badgeClass}`}>{student.status || "Pendiente"}</span>
          </div>

          {/* Preview de Foto de Evidencia */}
          {student.fotoEvidencia ? (
            <div style={{ position: 'relative' }}>
              <img 
                src={student.fotoEvidencia} 
                alt="Miniatura" 
                style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid #cbd5e1' }}
              />
              <span style={{ position: 'absolute', bottom: '-4px', right: '-4px', fontSize: '10px' }}>✅</span>
            </div>
          ) : (
            <span style={{ fontSize: '18px', opacity: 0.3 }}>📷</span>
          )}
        </div>

        {/* FILA ACCIONES: Cambiar estados de cumplimiento */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          <button 
            className={`status-opt-btn opt-green ${student.status === 'Cumplió' ? 'active' : ''}`}
            onClick={() => onUpdate(student.id, { status: "Cumplió" })}
            style={{ padding: '6px', fontSize: '11px', fontWeight: '600', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: student.status === 'Cumplió' ? '1px solid #10b981' : '1px solid #cbd5e1', background: student.status === 'Cumplió' ? '#ecfdf5' : 'white', color: student.status === 'Cumplió' ? '#065f46' : '#64748b' }}
          >
            ✅ Cumplió
          </button>
          <button 
            className={`status-opt-btn opt-red ${student.status === 'No cumplió' ? 'active' : ''}`}
            onClick={() => onUpdate(student.id, { status: "No cumplió" })}
            style={{ padding: '6px', fontSize: '11px', fontWeight: '600', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: student.status === 'No cumplió' ? '1px solid #ef4444' : '1px solid #cbd5e1', background: student.status === 'No cumplió' ? '#fef2f2' : 'white', color: student.status === 'No cumplió' ? '#991b1b' : '#64748b' }}
          >
            ❌ Falló
          </button>
          <button 
            className={`status-opt-btn opt-yellow ${student.status === 'Justificado' ? 'active' : ''}`}
            onClick={() => onUpdate(student.id, { status: "Justificado" })}
            style={{ padding: '6px', fontSize: '11px', fontWeight: '600', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: student.status === 'Justificado' ? '1px solid #f59e0b' : '1px solid #cbd5e1', background: student.status === 'Justificado' ? '#fffbeb' : 'white', color: student.status === 'Justificado' ? '#92400e' : '#64748b' }}
          >
            🟡 Justificar
          </button>
        </div>

        {/* FILA NOTAS: Agregar observaciones */}
        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          {isEditingComment ? (
            <form onSubmit={handleSaveComment} style={{ display: 'flex', gap: '6px', width: '100%' }}>
              <input 
                type="text" 
                placeholder="Ej. Permiso, falta médica..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                autoFocus
                style={{ flexGrow: 1, padding: '6px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc' }}
              />
              <button type="submit" className="main-action-btn" style={{ padding: '6px 12px', fontSize: '11px' }}>Ok</button>
              <button type="button" className="comment-btn" onClick={() => setIsEditingComment(false)} style={{ padding: '6px 10px', fontSize: '11px', border: '1px solid #cbd5e1', color: '#64748b' }}>X</button>
            </form>
          ) : (
            <div style={{ display: 'flex', width: '100%' }}>
              {student.hasComment ? (
                <div 
                  className="saved-comment" 
                  onClick={() => setIsEditingComment(true)}
                  style={{ cursor: 'pointer', fontSize: '12px', color: '#0284c7', background: '#f0f9ff', padding: '8px', borderRadius: 'var(--radius-sm)', width: '100%', border: '1px dashed #bae6fd' }}
                >
                  📝 "{student.comment}" <span style={{ float: 'right', opacity: 0.6 }}>✏️</span>
                </div>
              ) : (
                <button 
                  className="comment-btn" 
                  onClick={() => setIsEditingComment(true)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: '600', color: '#64748b', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                >
                  📝 Agregar Nota / Justificante
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}