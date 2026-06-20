import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import prisma from '../../src/config/prisma.js';

const tokenAdmin = jwt.sign(
  { id: 'test-admin', role: 'ADMIN', email: 'admin@espaciosenda.com' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Integración: CRUD de Usuarios', () => {
  // Datos únicos por corrida para no chocar con documentos/emails ya usados.
  const sello = Date.now();
  const emailUnico = `usuario.test.${sello}@example.com`;
  const documentoUnico = String(sello).slice(-8);
  let usuarioId;

  // Limpieza final: borra el usuario y la persona si algo quedó colgado.
  afterAll(async () => {
    if (usuarioId) {
      await prisma.user.delete({ where: { id: usuarioId } }).catch(() => {});
    }
    await prisma.people.deleteMany({ where: { email: emailUnico } }).catch(() => {});
    await prisma.$disconnect();
  });

  test('AUTORIZACIÓN: rechaza listar usuarios sin token (401/403)', async () => {
    const res = await request(app).get('/api/users');
    expect([401, 403]).toContain(res.statusCode);
  });

  test('CREATE: crea un usuario nuevo (201)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Usuario De Prueba',
        email: emailUnico,
        document: documentoUnico,
        documentType: 'DNI',
        phone: '1144445555',
        password: 'prueba123',
        rol: 'RECEPTIONIST',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(emailUnico);
    usuarioId = res.body.id; // guardamos el id para Update y Delete
  });

  test('READ: el listado de usuarios responde con un array (200)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('UPDATE: desactiva el usuario creado (200)', async () => {
    const res = await request(app)
      .patch(`/api/users/${usuarioId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ active: false });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
  });

  test('DELETE: elimina el usuario creado (200)', async () => {
    const res = await request(app)
      .delete(`/api/users/${usuarioId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
    usuarioId = null; // ya está borrado; que afterAll no intente de nuevo
  });
});