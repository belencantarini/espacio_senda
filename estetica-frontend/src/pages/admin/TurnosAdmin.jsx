import { useState, useEffect } from "react";
import { Table, Tr, Td } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const TurnosAdmin = () => {
  const [turnos, setTurnos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [pacientes, setPacientes] = useState([]); // Para el buscador de pacientes
  
  const [cargando, setCargando] = useState(true);
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);

  // Estado para el formulario de nuevo turno
  const [formData, setFormData] = useState({
    professionalId: "",
    serviceId: "",
    date: "",
    slot: null, // Guardará el objeto {startsAt, endsAt, availabilityId}
    patientId: "",
    notes: ""
  });

  const { token } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // 1. Cargar turnos existentes y datos iniciales (profesionales y pacientes)
  const cargarDatosIniciales = async () => {
    try {
      const [resTurnos, resProf, resPac] = await Promise.all([
        fetch(`${apiUrl}/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/professionals`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${apiUrl}/users`, { headers: { Authorization: `Bearer ${token}` } }) // Ajustar
      ]);

      const dataTurnos = await resTurnos.json();
      const dataProf = await resProf.json();
      const dataPac = await resPac.json();

      setTurnos(dataTurnos);
      setProfesionales(dataProf);
      setPacientes(dataPac);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatosIniciales(); }, []);

  // 2. Cuando cambia el Profesional, buscamos sus servicios
  useEffect(() => {
    if (formData.professionalId) {
      const prof = profesionales.find(p => p.id === formData.professionalId);
      // Prisma suele traerlos en .services
      setServiciosDisponibles(prof?.services || []);
    }
  }, [formData.professionalId]);

  // 3. Cuando tenemos Prof, Servicio y Fecha, buscamos horarios libres
  const consultarDisponibilidad = async () => {
    if (!formData.professionalId || !formData.serviceId || !formData.date) return;
    
    try {
      const query = `professionalId=${formData.professionalId}&serviceId=${formData.serviceId}&date=${formData.date}`;
      const res = await fetch(`${apiUrl}/appointments/available-slots?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHorariosDisponibles(data.slots || []);
      // Guardamos el availabilityId que viene del backend
      setFormData(prev => ({ ...prev, availabilityId: data.availabilityId }));
    } catch (err) {
      alert("No hay disponibilidad para esa fecha");
    }
  };

  const manejarCrearTurno = async (e) => {
    e.preventDefault();
    try {
      // Necesitamos el ID de la relación ProfessionalService
      const prof = profesionales.find(p => p.id === formData.professionalId);
      const profService = prof.services.find(s => s.serviceId === formData.serviceId);

      const payload = {
        professionalServiceId: profService.id,
        availabilityId: formData.availabilityId,
        patientId: formData.patientId,
        startsAt: formData.slot.startsAt,
        notes: formData.notes
      };

      const res = await fetch(`${apiUrl}/appointments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setModalNuevoAbierto(false);
        cargarDatosIniciales();
      } else {
        const errorData = await res.json();
        alert(errorData.mensaje);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (cargando) return <p>Cargando agenda...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ color: '#6b21a8' }}>Agenda de Turnos</h2>
        <Button onClick={() => setModalNuevoAbierto(true)}>+ Agendar Turno</Button>
      </div>

      <Table headers={["Fecha/Hora", "Paciente", "Profesional", "Servicio", "Estado"]}>
        {turnos.map((t) => (
          <Tr key={t.id}>
            <Td>{new Date(t.startsAt).toLocaleString()}</Td>
            <Td>{t.patient?.person?.name}</Td>
            <Td>{t.professionalService?.professional?.person?.name}</Td>
            <Td>{t.professionalService?.service?.name}</Td>
            <Td>
               <span style={{ 
                 padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                 backgroundColor: t.status === 'CONFIRMED' ? '#dcfce7' : '#fef9c3',
                 color: t.status === 'CONFIRMED' ? '#166534' : '#854d0e'
               }}>
                 {t.status}
               </span>
            </Td>
          </Tr>
        ))}
      </Table>

      {/* MODAL NUEVO TURNO */}
      <Modal isOpen={modalNuevoAbierto} onClose={() => setModalNuevoAbierto(false)} title="Agendar Nuevo Turno">
        <form onSubmit={manejarCrearTurno} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <label>Profesional</label>
          <select 
            value={formData.professionalId} 
            onChange={(e) => setFormData({...formData, professionalId: e.target.value})}
            style={styles.select} required
          >
            <option value="">Seleccionar Profesional...</option>
            {profesionales.map(p => <option key={p.id} value={p.id}>{p.person?.name}</option>)}
          </select>

          <label>Servicio</label>
          <select 
            value={formData.serviceId} 
            onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
            style={styles.select} required disabled={!formData.professionalId}
          >
            <option value="">Seleccionar Servicio...</option>
            {serviciosDisponibles.map(s => <option key={s.serviceId} value={s.serviceId}>{s.service?.name}</option>)}
          </select>

          <label>Fecha</label>
          <Input 
            type="date" value={formData.date} 
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            onBlur={consultarDisponibilidad} // Al salir del campo fecha, busca horarios
          />

          {horariosDisponibles.length > 0 && (
            <div style={styles.slotsGrid}>
              {horariosDisponibles.map((slot, i) => (
                <button 
                  key={i} type="button"
                  onClick={() => setFormData({...formData, slot})}
                  style={{
                    ...styles.slotButton,
                    backgroundColor: formData.slot?.startsAt === slot.startsAt ? '#6b21a8' : '#f3e8ff',
                    color: formData.slot?.startsAt === slot.startsAt ? 'white' : '#6b21a8',
                  }}
                >
                  {new Date(slot.startsAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </button>
              ))}
            </div>
          )}

          <label>Paciente</label>
          <select 
            value={formData.patientId} 
            onChange={(e) => setFormData({...formData, patientId: e.target.value})}
            style={styles.select} required
          >
            <option value="">Seleccionar Paciente...</option>
            {/* Aquí usamos los usuarios que tengan rol PATIENT o todos los que carguemos */}
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre || p.person?.name}</option>)}
          </select>

          <Button type="submit" disabled={!formData.slot}>Confirmar Turno</Button>
        </form>
      </Modal>
    </div>
  );
};

const styles = {
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' },
  slotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' },
  slotButton: { padding: '8px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default TurnosAdmin;