import cron from 'node-cron';
import prisma from '../config/prisma.js';
import transporter from '../config/mailer.js';

// ENVIAR RECORDATORIO POR EMAIL

const enviarRecordatorio = async (turno) => {
  const paciente = turno.patient.person;
  const servicio = turno.professionalService.service.name;
  const profesional = turno.professionalService.professional.person.name;

  const fecha = new Date(turno.startsAt);
  const fechaFormateada = fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const horaFormateada = fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    await transporter.sendMail({
      from: `"Espacio Senda" <${process.env.EMAIL_USER}>`,
      to: paciente.email,
      subject: 'Recordatorio de turno - Espacio Senda',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #6b21a8; text-align: center;">Recordatorio de tu turno</h2>
          <p>Hola <b>${paciente.name}</b>,</p>
          <p>Te recordamos que tenés un turno programado para mañana:</p>
          <div style="background-color: #f8f4ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 6px 0;"><b>📅 Fecha:</b> ${fechaFormateada}</p>
            <p style="margin: 6px 0;"><b>🕐 Hora:</b> ${horaFormateada}</p>
            <p style="margin: 6px 0;"><b>💆 Servicio:</b> ${servicio}</p>
            <p style="margin: 6px 0;"><b>👩‍⚕️ Profesional:</b> ${profesional}</p>
          </div>
          <p>Si necesitás cancelar o reprogramar tu turno, por favor contactanos con anticipación.</p>
          <p style="color: #64748b; font-size: 14px;">Este es un mensaje automático, por favor no respondas este correo.</p>
        </div>
      `,
    });

    // Registrar recordatorio como SENT
    await prisma.reminderLog.create({
      data: {
        appointmentId: turno.id,
        channel: 'EMAIL',
        status: 'SENT',
      },
    });

    console.log(` Recordatorio enviado a ${paciente.email} para el turno ${turno.id}`);
  } catch (error) {
    // Registrar recordatorio como FAILED
    await prisma.reminderLog.create({
      data: {
        appointmentId: turno.id,
        channel: 'EMAIL',
        status: 'FAILED',
      },
    });

    console.error(` Error al enviar recordatorio para el turno ${turno.id}:`, error.message);
  }
};

// ── BUSCAR TURNOS Y ENVIAR RECORDATORIOS ─────────────────────

export const procesarRecordatorios = async () => {
  console.log(' Procesando recordatorios...');

  try {
    const ahora = new Date();

    // Ventana de 24 horas: desde ahora+23hs hasta ahora+25hs
    // Esto evita enviar duplicados si el cron corre con leve desfase
    const desde = new Date(ahora.getTime() + 23 * 60 * 60 * 1000);
    const hasta = new Date(ahora.getTime() + 25 * 60 * 60 * 1000);

    const turnosProximos = await prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: desde,
          lte: hasta,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        // Solo turnos que NO tienen recordatorio enviado exitosamente
        reminders: {
          none: {
            channel: 'EMAIL',
            status: 'SENT',
          },
        },
      },
      include: {
        patient: { include: { person: true } },
        professionalService: {
          include: {
            professional: { include: { person: true } },
            service: true,
          },
        },
      },
    });

    console.log(` Turnos encontrados para recordatorio: ${turnosProximos.length}`);

    for (const turno of turnosProximos) {
      await enviarRecordatorio(turno);
    }

    console.log(' Procesamiento de recordatorios finalizado');
  } catch (error) {
    console.error(' Error al procesar recordatorios:', error.message);
  }
};

// CRON JOB
// Corre todos los días a las 9:00 AM
// Formato cron: segundo(opcional) minuto hora día mes díaSemana

const iniciarRecordatorios = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Cron job de recordatorios ejecutándose:', new Date().toLocaleString('es-AR'));
    await procesarRecordatorios();
  }, {
    timezone: 'America/Argentina/Buenos_Aires',
  });

  console.log(' Sistema de recordatorios iniciado (corre todos los días a las 9:00 AM)');
};

export default iniciarRecordatorios;