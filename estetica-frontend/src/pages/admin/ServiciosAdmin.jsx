import { useState, useEffect } from "react";
import { Table, Tr, Td } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const ServiciosAdmin = () => {
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  
  // Modal de eliminación
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);

  // Modal de Formulario (Crear / Editar)
  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [servicioEditandoId, setServicioEditandoId] = useState(null);
  
  // Adaptamos el formData a lo que necesita un Servicio
  const [formData, setFormData] = useState({ 
    nombre: "", 
    descripcion: "", 
    duracion: "", 
    precio: "" 
  });
  
  const [errorForm, setErrorForm] = useState("");
  const [cargandoForm, setCargandoForm] = useState(false);

  const { token } = useAuth(); 
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  // --- GET: Traer servicios ---
  const obtenerServicios = async () => {
    try {
      // Apuntamos a la ruta de servicios que vimos en tu app.js
      const respuesta = await fetch(`${apiUrl}/services`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || "Error al traer servicios");
      setServicios(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerServicios();
  }, []);

  // --- PREPARAR EL FORMULARIO ---
  const abrirModalCrear = () => {
    setModoEdicion(false);
    setServicioEditandoId(null);
    setFormData({ nombre: "", descripcion: "", duracion: "", precio: "" });
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (servicio) => {
    setModoEdicion(true);
    setServicioEditandoId(servicio.id);
    setFormData({ 
      nombre: servicio.nombre || servicio.name, // Contemplando cómo lo devuelva tu backend
      descripcion: servicio.descripcion || servicio.description, 
      duracion: servicio.duracion || servicio.duration, 
      precio: servicio.precio || servicio.price 
    });
    setModalFormAbierto(true);
  };

  // --- POST / PATCH: Guardar servicio ---
  const manejarGuardado = async (e) => {
    e.preventDefault();
    setErrorForm("");
    setCargandoForm(true);

    try {
      const url = modoEdicion ? `${apiUrl}/services/${servicioEditandoId}` : `${apiUrl}/services`;
      const method = modoEdicion ? "PATCH" : "POST";
      
      // Convertimos duración y precio a números por si acaso el backend los exige así
      const payload = { 
        ...formData,
        duracion: Number(formData.duracion),
        precio: Number(formData.precio)
      };

      const respuesta = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.mensaje || datos.error || "Error al guardar el servicio.");

      setModalFormAbierto(false);
      obtenerServicios(); 

    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setCargandoForm(false);
    }
  };

  // --- DELETE: Eliminar servicio ---
  const confirmarEliminacion = (servicio) => {
    setServicioSeleccionado(servicio);
    setModalEliminarAbierto(true);
  };

  const ejecutarEliminacion = async () => {
    try {
      const respuesta = await fetch(`${apiUrl}/services/${servicioSeleccionado.id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!respuesta.ok) throw new Error("No se pudo eliminar el servicio");
      setModalEliminarAbierto(false);
      obtenerServicios();
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargando) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando servicios...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#6b21a8' }}>Gestión de Servicios</h2>
        <Button onClick={abrirModalCrear}>
          + Nuevo Servicio
        </Button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <Table headers={["Servicio", "Descripción", "Duración", "Precio", "Acciones"]}>
        {servicios.map((s) => (
          <Tr key={s.id}>
            <Td><strong>{s.nombre || s.name}</strong></Td>
            <Td>{s.descripcion || s.description}</Td>
            <Td>{s.duracion || s.duration} min</Td>
            <Td>$ {s.precio || s.price}</Td>
            <Td>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button 
                  style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#64748b' }}
                  onClick={() => abrirModalEditar(s)}
                >
                  Editar
                </Button>
                <Button 
                  variant="danger" 
                  style={{ padding: '6px 12px', fontSize: '12px' }} 
                  onClick={() => confirmarEliminacion(s)}
                >
                  Eliminar
                </Button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      {/* MODAL: FORMULARIO CREAR/EDITAR */}
      <Modal 
        isOpen={modalFormAbierto} 
        onClose={() => setModalFormAbierto(false)} 
        title={modoEdicion ? "Editar Servicio" : "Crear Nuevo Servicio"}
      >
        {errorForm && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{errorForm}</p>}
        
        <form onSubmit={manejarGuardado} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
          
          <Input 
            type="text" 
            placeholder="Nombre del servicio (Ej: Masaje Descontracturante)" 
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            required
          />
          
          <Input 
            type="text" 
            placeholder="Breve descripción" 
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            required
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <Input 
                type="number" 
                placeholder="Duración (minutos)" 
                value={formData.duracion}
                onChange={(e) => setFormData({...formData, duracion: e.target.value})}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input 
                type="number" 
                placeholder="Precio ($)" 
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <Button 
              type="button"
              style={{ backgroundColor: '#e2e8f0', color: '#475569' }} 
              onClick={() => setModalFormAbierto(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={cargandoForm}>
              {cargandoForm ? "Guardando..." : "Guardar Servicio"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      <Modal 
        isOpen={modalEliminarAbierto} 
        onClose={() => setModalEliminarAbierto(false)} 
        title="Confirmar eliminación"
      >
        <p>¿Estás segura de que querés eliminar el servicio <b>{servicioSeleccionado?.nombre || servicioSeleccionado?.name}</b>?</p>
        <p style={{ fontSize: '14px', color: '#64748b' }}>Esta acción no se puede deshacer.</p>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
          <Button style={{ backgroundColor: '#e2e8f0', color: '#475569' }} onClick={() => setModalEliminarAbierto(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={ejecutarEliminacion}>
            Sí, eliminar servicio
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default ServiciosAdmin;