import { useState, useEffect } from "react";
import { Table, Tr, Td } from "../../components/ui/Table";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", rol: "RECEPTIONIST" });
  const [errorForm, setErrorForm] = useState("");
  const [cargandoForm, setCargandoForm] = useState(false);

  const { token } = useAuth(); 
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const obtenerUsuarios = async () => {
    try {
      const respuesta = await fetch(`${apiUrl}/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || "Error al traer usuarios");
      setUsuarios(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { obtenerUsuarios(); }, []);

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioEditandoId(null);
    setFormData({ nombre: "", email: "", password: "", rol: "RECEPTIONIST" });
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (u) => {
    setModoEdicion(true);
    setUsuarioEditandoId(u.id);
    setFormData({ 
      nombre: u.nombre || u.person?.name || u.name || "", 
      email: u.email || u.person?.email || "", 
      password: "", 
      rol: u.rol || u.role 
    });
    setModalFormAbierto(true);
  };

  const manejarGuardado = async (e) => {
    e.preventDefault();
    setErrorForm("");
    setCargandoForm(true);
    try {
      const url = modoEdicion ? `${apiUrl}/users/${usuarioEditandoId}` : `${apiUrl}/users`;
      const method = modoEdicion ? "PATCH" : "POST";
      const payload = { ...formData };
      if (modoEdicion && !payload.password) delete payload.password;

      const respuesta = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json();
        throw new Error(datos.mensaje || datos.error || "Error al guardar");
      }

      setModalFormAbierto(false);
      obtenerUsuarios(); 
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setCargandoForm(false);
    }
  };

  const ejecutarEliminacion = async () => {
    try {
      const respuesta = await fetch(`${apiUrl}/users/${usuarioSeleccionado.id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!respuesta.ok) throw new Error("No se pudo eliminar");
      setModalEliminarAbierto(false);
      obtenerUsuarios();
    } catch (err) {
      alert(err.message);
    }
  };

  if (cargando) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Cargando usuarios...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#6b21a8' }}>Gestión de Usuarios</h2>
        <Button onClick={abrirModalCrear}>+ Nuevo Usuario</Button>
      </div>

      <Table headers={["Nombre", "Email", "Rol", "Estado", "Acciones"]}>
        {usuarios.map((u) => (
          <Tr key={u.id}>
            <Td>{u.nombre || u.person?.name || u.name}</Td>
            <Td>{u.email || u.person?.email}</Td>
            <Td>
              <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#6b21a815', color: '#6b21a8' }}>
                {u.rol || u.role}
              </span>
            </Td>
            <Td>
              <span style={{ color: u.active || u.activo ? '#16a34a' : '#d32f2f', fontWeight: 'bold' }}>
                {u.active || u.activo ? '● Activo' : '○ Inactivo'}
              </span>
            </Td>
            <Td>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <Button style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#64748b' }} onClick={() => abrirModalEditar(u)}>Editar</Button>
                <Button variant="danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => confirmarEliminacion(u)}>Eliminar</Button>
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      <Modal isOpen={modalFormAbierto} onClose={() => setModalFormAbierto(false)} title={modoEdicion ? "Editar Usuario" : "Crear Nuevo Usuario"}>
        <form onSubmit={manejarGuardado} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Input type="text" placeholder="Nombre completo" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
          <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <Input type="password" placeholder={modoEdicion ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña"} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!modoEdicion} />
          <select value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1' }}>
            <option value="RECEPTIONIST">Recepcionista</option>
            <option value="ADMIN">Administrador</option>
            <option value="PROFESSIONAL">Profesional</option>
            <option value="PATIENT">Paciente</option>
          </select>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button type="button" style={{ backgroundColor: '#e2e8f0', color: '#475569' }} onClick={() => setModalFormAbierto(false)}>Cancelar</Button>
            <Button type="submit">{cargandoForm ? "Guardando..." : "Guardar"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalEliminarAbierto} onClose={() => setModalEliminarAbierto(false)} title="Confirmar">
        <p>¿Eliminar a {usuarioSeleccionado?.nombre || usuarioSeleccionado?.person?.name}?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <Button variant="danger" onClick={ejecutarEliminacion}>Sí, eliminar</Button>
        </div>
      </Modal>
    </div>
  );
};

export default UsuariosAdmin;