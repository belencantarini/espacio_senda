import axios from "axios";

// Leemos la URL de la nube, y le agregamos /services 
// (Ojo: en tu app.js del backend la ruta es en inglés '/api/services')
const API = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/services`;

export const obtenerServicios = async (token) => {
  const res = await axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const crearServicio = async (data, token) => {
  const res = await axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const actualizarServicio = async (id, data, token) => {
  const res = await axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const eliminarServicio = async (id, token) => {
  const res = await axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};