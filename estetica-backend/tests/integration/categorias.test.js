import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import prisma from '../../src/config/prisma.js';

// Fabricamos un token de ADMIN válido (el middleware solo verifica la firma).
const tokenAdmin = jwt.sign(
  { id: 'test-admin', role: 'ADMIN', email: 'admin@espaciosenda.com' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Integración: CRUD de Categorías de Servicios', () => {
  // Nombre único con la marca de tiempo, para no chocar con el constraint de
  // nombre repetido si el test corre varias veces.
  const nombreUnico = `Categoría Test ${Date.now()}`;
  let categoriaId; // lo vamos completando al crear, y lo usan los pasos siguientes

  // LIMPIEZA: borramos la categoría creada para dejar la base como estaba.
  afterAll(async () => {
    if (categoriaId) {
      await prisma.serviceCategory.delete({ where: { id: categoriaId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  // ── AUTORIZACIÓN ──────────────────────────────────────────────────────────
  test('rechaza crear una categoría si no se envía token (401/403)', async () => {
    const res = await request(app)
      .post('/api/services/categories')
      .send({ name: 'Sin token', displayOrder: 99 });

    expect([401, 403]).toContain(res.statusCode);
  });

  // ── VALIDACIÓN ────────────────────────────────────────────────────────────
  test('rechaza crear si faltan campos obligatorios (400)', async () => {
    const res = await request(app)
      .post('/api/services/categories')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: '' }); // sin name ni displayOrder

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('mensaje');
  });

  // ── CREATE ────────────────────────────────────────────────────────────────
  test('CREATE: crea una categoría nueva (201)', async () => {
    const res = await request(app)
      .post('/api/services/categories')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: nombreUnico, displayOrder: 99 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(nombreUnico);

    categoriaId = res.body.id; // guardamos el id para Read y Update
  });

  // ── READ ──────────────────────────────────────────────────────────────────
  test('READ: la categoría creada aparece en el listado (200)', async () => {
    const res = await request(app)
      .get('/api/services/categories')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const encontrada = res.body.find((c) => c.id === categoriaId);
    expect(encontrada).toBeDefined();
    expect(encontrada.name).toBe(nombreUnico);
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────
  test('UPDATE: modifica el nombre de la categoría (200)', async () => {
    const nuevoNombre = `${nombreUnico} (editada)`;

    const res = await request(app)
      .patch(`/api/services/categories/${categoriaId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ name: nuevoNombre });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(nuevoNombre);
  });
});