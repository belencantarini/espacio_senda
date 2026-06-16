import request from 'supertest';
import app from '../app.js';
import jwt from 'jsonwebtoken';

const generarTokenAdmin = () => {
  return jwt.sign(
    { id: 1, role: 'ADMIN', email: 'admin@espaciosenda.com' },
    process.env.JWT_SECRET || 'espaciosenda',
    { expiresIn: '1h' }
  );
};

describe('Test de precio inmutable (price_snapshot)', () => {
  const token = generarTokenAdmin();

  test('Actualizar el precio de un ProfessionalService no modifica el price_snapshot de los turnos ya creados', async () => {

    // 1. Obtener un turno existente con su price_snapshot
    const turnosRes = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${token}`);

    expect(turnosRes.statusCode).toBe(200);
    expect(turnosRes.body.length).toBeGreaterThan(0);

    const turno = turnosRes.body[0];
    const priceSnapshotOriginal = Number(turno.priceSnapshot);
    const professionalServiceId = turno.professionalServiceId;

    // 2. Obtener el precio actual del ProfessionalService
    const psRes = await request(app)
      .get(`/api/appointments`)
      .set('Authorization', `Bearer ${token}`);

    // 3. Actualizar el precio del ProfessionalService
    const nuevoPrecio = priceSnapshotOriginal + 10000;

    const patchRes = await request(app)
      .patch(`/api/services/professional-services/${professionalServiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: nuevoPrecio });

    expect(patchRes.statusCode).toBe(200);

    // 4. Verificar que el turno conserva el price_snapshot original
    const turnoActualizado = await request(app)
      .get(`/api/appointments/${turno.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(turnoActualizado.statusCode).toBe(200);
    expect(Number(turnoActualizado.body.priceSnapshot)).toBe(priceSnapshotOriginal);

    // 5. Revertir el precio
    await request(app)
      .patch(`/api/services/professional-services/${professionalServiceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: priceSnapshotOriginal });
  });
});