// ============================================================================
//  DOCUMENTACIÓN SWAGGER  ·  Recordatorios
// ============================================================================

/**
 * @swagger
 * /api/reminders/enviar:
 *   post:
 *     summary: Disparar recordatorios manualmente (solo ADMIN)
 *     tags:
 *       - Recordatorios
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recordatorios procesados correctamente
 *       401:
 *         description: Token inválido o ausente
 *       403:
 *         description: Acceso denegado (rol sin permiso)
 *       500:
 *         description: Error al procesar recordatorios
 */

/**
 * @swagger
 * /api/reminders/turno/{id}:
 *   post:
 *     summary: Enviar recordatorio de un turno específico
 *     tags:
 *       - Recordatorios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recordatorio enviado correctamente
 *       401:
 *         description: Token inválido o ausente
 *       403:
 *         description: Acceso denegado (rol sin permiso)
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error al enviar el recordatorio
 */
