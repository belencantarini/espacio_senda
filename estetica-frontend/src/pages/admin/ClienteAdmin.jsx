import { useEffect, useState } from "react";
import {
  obtenerPacientes,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} from "../api/paciente.api";

export default function PacienteAdmin() {
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: ""
  });

  const [editId, setEditId] = useState(null);
  const token = localStorage.getItem("token");

  const cargarPacientes = async () => {
    try {
      const data = await obtenerPacientes(token);
      setPacientes(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await actualizarPaciente(editId, form, token);
      } else {
        await crearPaciente(form, token);
      }

      setForm({
        nombre: "",
        telefono: "",
        email: ""
      });

      setEditId(null);
      cargarPacientes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (c) => {
    setForm({
      nombre: c.nombre,
      telefono: c.telefono,
      email: c.email
    });
    setEditId(c.id);
  };

  const handleDelete = async (id) => {
    try {
      await eliminarPaciente(id, token);
      cargarPacientes();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Pacientes</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <button type="submit">
          {editId ? "Actualizar" : "Crear"}
        </button>
      </form>

      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pacientes.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.email}</td>
              <td>{c.telefono}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Editar</button>
                <button onClick={() => handleDelete(c.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}