import axios from "axios";

// Ajustá el endpoint final según cómo lo tengas en tu backend (ej: /patients o /pacientes)
const API = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/pacientes`;

export const obtenerPacientes = async (token) => {
  const res = await axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const crearPaciente = async (data, token) => {
  const res = await axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const actualizarPaciente = async (id, data, token) => {
  const res = await axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const eliminarPaciente = async (id, token) => {
  const res = await axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};