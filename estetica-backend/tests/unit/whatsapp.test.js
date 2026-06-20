
import { waNumeroAR, normalizarTelefono, linkWhatsApp } from '../../src/utils/whatsapp.js';


describe('Utilidades de WhatsApp (pruebas unitarias)', () => {


  describe('waNumeroAR', () => {

    test('arma correctamente un número de Capital (área 11)', () => {

      const entrada = { area: '11', numero: '12345678' };

      const resultado = waNumeroAR(entrada);

      expect(resultado).toBe('5491112345678');
    });

    test('limpia el 0 del área y el 15 del número antes de armarlo', () => {
      const resultado = waNumeroAR({ area: '011', numero: '1512345678' });
      expect(resultado).toBe('5491112345678');
    });

    test('devuelve null si el área es inválida (muy corta)', () => {
      const resultado = waNumeroAR({ area: '1', numero: '12345678' });
      // Cuando los datos no sirven, la función devuelve null. Lo verificamos.
      expect(resultado).toBeNull();
    });

    test('devuelve null si el número tiene menos de 6 dígitos', () => {
      const resultado = waNumeroAR({ area: '11', numero: '123' });
      expect(resultado).toBeNull();
    });
  });


  describe('normalizarTelefono', () => {

    test('normaliza un número local a formato internacional', () => {
      const resultado = normalizarTelefono('1112345678');
      expect(resultado).toBe('5491112345678');
    });

    test('respeta un número que ya viene en formato internacional', () => {
      const resultado = normalizarTelefono('5491112345678');
      expect(resultado).toBe('5491112345678');
    });

    test('devuelve null si no le pasamos nada', () => {
      expect(normalizarTelefono('')).toBeNull();
      expect(normalizarTelefono(null)).toBeNull();
    });

    test('devuelve null si el texto no tiene dígitos', () => {
      expect(normalizarTelefono('hola')).toBeNull();
    });
  });


  describe('linkWhatsApp', () => {

    test('genera el link de wa.me con el texto codificado', () => {
      const resultado = linkWhatsApp('1112345678', 'Hola Juan');
      expect(resultado).toBe('https://wa.me/5491112345678?text=Hola%20Juan');
    });

    test('devuelve null si el teléfono es inválido', () => {
      const resultado = linkWhatsApp('abc', 'Hola');
      expect(resultado).toBeNull();
    });
  });
});