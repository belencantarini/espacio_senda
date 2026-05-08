import express from 'express';
import verificarToken from '../middleware/verificarToken.js';
import autorizarRoles from '../middleware/autorizarRoles.js';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario, // Esto ahora usa PATCH
  eliminarUsuario,
  cambiarPassword,
  desactivarUsuario, // Agregado
  activarUsuario,    // Agregado
  buscarPersonas     // Agregado
} from '../controllers/users.controller.js';

const router = express.Router();

// SOLO ADMIN puede ver usuarios
router.get(
  "/",
  verificarToken,
  autorizarRoles(["ADMIN"]),
  obtenerUsuarios
);

// BUSCADOR DE PERSONAS (Pacientes/Profesionales)
// Ojo: Si tu router principal está en "/users", esta ruta será "/users/people"
router.get(
  "/people",
  verificarToken,
  buscarPersonas
);

// SOLO ADMIN puede ver usuario por ID
router.get(
  "/:id",
  verificarToken,
  autorizarRoles(["ADMIN"]),
  obtenerUsuarioPorId
);

// SOLO ADMIN puede crear usuarios (¡Le agregué seguridad!)
// Antes estaba sin token, pero en un sistema de clínica no queremos 
// que cualquier persona en internet se cree un usuario Administrador.
router.post(
  "/",
  verificarToken,
  autorizarRoles(["ADMIN"]),
  crearUsuario
);

// SOLO ADMIN puede actualizar (Cambiado de PUT a PATCH según el documento de tareas)
router.patch(
  "/:id",
  verificarToken,
  autorizarRoles(["ADMIN"]),
  actualizarUsuario
);

// SOLO ADMIN puede activar un usuario
router.patch(
  "/:id/activate",
  verificarToken,
  autorizarRoles(["ADMIN"]),
  activarUsuario
);

// SOLO ADMIN puede desactivar un usuario
router.patch(
  "/:id/deactivate",
  verificarToken,
  autorizarRoles(["ADMIN"]),
  desactivarUsuario
);

// SOLO ADMIN puede eliminar
router.delete(
  "/:id",
  verificarToken,
  autorizarRoles(["ADMIN"]),
  eliminarUsuario
);

// Cualquier usuario logueado puede cambiar SU PROPIA contraseña
router.patch(
  "/:id/password",
  verificarToken,
  cambiarPassword
);

export default router;