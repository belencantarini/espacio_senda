import {
  instanteDesdeParedLocal,
  minutoDelDiaEnZona,
  rangoDiaClinica,
} from '../../src/utils/tiempo.js';


const TZ = 'America/Argentina/Buenos_Aires';

describe('Utilidades de tiempo / zona horaria (unitarias)', () => {

  describe('instanteDesdeParedLocal', () => {
    test('convierte 09:00 hora local de Buenos Aires a 12:00 UTC', () => {
      // Buenos Aires es UTC-3, así que las 09:00 locales son las 12:00 UTC
      const instante = instanteDesdeParedLocal('2026-06-20', '09:00', TZ);
      expect(instante.toISOString()).toBe('2026-06-20T12:00:00.000Z');
    });

    test('convierte la medianoche local (00:00) a 03:00 UTC', () => {
      const instante = instanteDesdeParedLocal('2026-06-20', '00:00', TZ);
      expect(instante.toISOString()).toBe('2026-06-20T03:00:00.000Z');
    });
  });

  describe('minutoDelDiaEnZona', () => {
    test('las 09:00 locales corresponden al minuto 540 del día', () => {
      // 9 horas * 60 = 540 minutos
      const minutos = minutoDelDiaEnZona(new Date('2026-06-20T12:00:00.000Z'), TZ);
      expect(minutos).toBe(540);
    });

    test('ida y vuelta: armar 14:30 local y volver a leer el minuto del día', () => {
      const instante = instanteDesdeParedLocal('2026-06-20', '14:30', TZ);
      const minutos = minutoDelDiaEnZona(instante, TZ);
      // 14*60 + 30 = 870
      expect(minutos).toBe(870);
    });
  });

  describe('rangoDiaClinica', () => {
    test('una fecha plana genera el rango del día completo en hora local', () => {
      const filtro = rangoDiaClinica('2026-06-20', '2026-06-20', TZ);
      // Desde 00:00 local del 20 (03:00 UTC) hasta 00:00 local del 21 (exclusivo)
      expect(filtro.gte.toISOString()).toBe('2026-06-20T03:00:00.000Z');
      expect(filtro.lt.toISOString()).toBe('2026-06-21T03:00:00.000Z');
    });

    test('una fecha ISO completa se respeta tal cual', () => {
      const filtro = rangoDiaClinica('2026-06-20T10:00:00.000Z', null, TZ);
      expect(filtro.gte.toISOString()).toBe('2026-06-20T10:00:00.000Z');
    });
  });
});