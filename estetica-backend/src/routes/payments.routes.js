import { Router } from 'express';
import verificarToken from '../middleware/verificarToken.js';
import {
  crearPago,
  obtenerPagosPorTurno,
  registrarReembolso,
  eliminarPago,
  obtenerHistorialPagos,
} from '../controllers/payments.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET    /api/payments/historial        Historial global con filtros
router.get('/historial', obtenerHistorialPagos);

// POST   /api/payments/:appointmentId   Registrar un pago
router.post('/:appointmentId', crearPago);

// GET    /api/payments/:appointmentId   Ver pagos + resumen de un turno
router.get('/:appointmentId', obtenerPagosPorTurno);

// POST   /api/payments/:appointmentId/refund → Registrar un reembolso
router.post('/:appointmentId/refund', registrarReembolso);

// DELETE /api/payments/:id/delete      Eliminar un pago
router.delete('/:id/delete', eliminarPago);

export default router;