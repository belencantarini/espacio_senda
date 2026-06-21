// ============================================================================
//  DOCUMENTACIÓN SWAGGER  ·  Reportes
// ============================================================================

/**
 * @swagger
 * /api/reports/income:
 *   get:
 *     summary: Reporte de ingresos
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           example: "2026-01-01"
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           example: "2026-12-31"
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte de ingresos obtenido correctamente
 *       401:
 *         description: Token inválido o ausente
 *       403:
 *         description: Acceso denegado (solo ADMIN)
 */

/**
 * @swagger
 * /api/reports/appointments:
 *   get:
 *     summary: Reporte de turnos
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           example: "2026-01-01"
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           example: "2026-12-31"
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte de turnos obtenido correctamente
 *       401:
 *         description: Token inválido o ausente
 */

/**
 * @swagger
 * /api/reports/services:
 *   get:
 *     summary: Reporte de servicios más demandados
 *     tags:
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           example: "2026-01-01"
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           example: "2026-12-31"
 *     responses:
 *       200:
 *         description: Reporte de servicios obtenido correctamente
 *       401:
 *         description: Token inválido o ausente
 *       403:
 *         description: Acceso denegado (solo ADMIN)
 */
