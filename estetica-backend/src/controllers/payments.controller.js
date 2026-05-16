import prisma from '../config/prisma.js';

// CREAR PAGO

export const crearPago = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { amount, method, type } = req.body;

    // Validaciones
    if (!amount || !method || !type) {
      return res.status(400).json({
        mensaje: 'amount, method y type son obligatorios',
      });
    }

    const metodosValidos = ['CASH', 'TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD'];
    const tiposValidos = ['DEPOSIT', 'FINAL_PAYMENT', 'FULL_PAYMENT'];

    if (!metodosValidos.includes(method)) {
      return res.status(400).json({
        mensaje: `Método de pago inválido. Valores permitidos: ${metodosValidos.join(', ')}`,
      });
    }

    if (!tiposValidos.includes(type)) {
      return res.status(400).json({
        mensaje: `Tipo de pago inválido. Valores permitidos: ${tiposValidos.join(', ')}`,
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        mensaje: 'El monto debe ser un número mayor a 0',
      });
    }

    // Verificar que el turno existe
    const turno = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { payments: true },
    });

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    // No permitir pagos en turnos cancelados
    if (turno.status === 'CANCELLED') {
      return res.status(400).json({
        mensaje: 'No se puede registrar un pago en un turno cancelado',
      });
    }

    // Calcular total ya pagado (sin contar reembolsos)
    const totalPagado = turno.payments
      .filter((p) => !p.isRefund)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const precioFinal =
      Number(turno.priceSnapshot) - Number(turno.discountAmount || 0);

    const nuevoTotal = totalPagado + Number(amount);

    if (nuevoTotal > precioFinal) {
      return res.status(400).json({
        mensaje: `El monto supera el precio del turno. Precio: $${precioFinal}, Ya pagado: $${totalPagado}, Disponible: $${(precioFinal - totalPagado).toFixed(2)}`,
      });
    }

    // Determinar nuevo estado de pago del turno
    let nuevoPaymentStatus = 'PARTIAL';
    if (nuevoTotal >= precioFinal) {
      nuevoPaymentStatus = 'COMPLETED';
    }

    // Crear pago y actualizar estado en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      const pago = await tx.payment.create({
        data: {
          appointmentId,
          amount: Number(amount),
          method,
          type,
          isRefund: false,
        },
      });

      await tx.appointment.update({
        where: { id: appointmentId },
        data: { paymentStatus: nuevoPaymentStatus },
      });

      return pago;
    });

    res.status(201).json({
      mensaje: 'Pago registrado correctamente',
      pago: resultado,
      estadoPago: nuevoPaymentStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// OBTENER PAGOS DE UN TURNO

export const obtenerPagosPorTurno = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const turno = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    const pagos = await prisma.payment.findMany({
      where: { appointmentId },
      orderBy: { paidAt: 'asc' },
    });

    // Calcular resumen financiero del turno
    const precioFinal =
      Number(turno.priceSnapshot) - Number(turno.discountAmount || 0);

    const totalPagado = pagos
      .filter((p) => !p.isRefund)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const totalReembolsado = pagos
      .filter((p) => p.isRefund)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const saldoPendiente = precioFinal - totalPagado + totalReembolsado;

    res.json({
      appointmentId,
      resumen: {
        precioOriginal: Number(turno.priceSnapshot),
        descuento: Number(turno.discountAmount || 0),
        precioFinal,
        totalPagado,
        totalReembolsado,
        saldoPendiente: saldoPendiente < 0 ? 0 : saldoPendiente,
        estadoPago: turno.paymentStatus,
      },
      pagos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REGISTRAR REEMBOLSO

export const registrarReembolso = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { amount, method } = req.body;

    if (!amount || !method) {
      return res.status(400).json({
        mensaje: 'amount y method son obligatorios',
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        mensaje: 'El monto debe ser un número mayor a 0',
      });
    }

    const metodosValidos = ['CASH', 'TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD'];
    if (!metodosValidos.includes(method)) {
      return res.status(400).json({
        mensaje: `Método inválido. Valores permitidos: ${metodosValidos.join(', ')}`,
      });
    }

    const turno = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { payments: true },
    });

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    const totalPagado = turno.payments
      .filter((p) => !p.isRefund)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const totalReembolsadoAntes = turno.payments
      .filter((p) => p.isRefund)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const disponibleParaReembolso = totalPagado - totalReembolsadoAntes;

    if (Number(amount) > disponibleParaReembolso) {
      return res.status(400).json({
        mensaje: `No se puede reembolsar más de lo pagado. Disponible para reembolso: $${disponibleParaReembolso.toFixed(2)}`,
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const reembolso = await tx.payment.create({
        data: {
          appointmentId,
          amount: Number(amount),
          method,
          type: 'FULL_PAYMENT',
          isRefund: true,
        },
      });

      await tx.appointment.update({
        where: { id: appointmentId },
        data: { paymentStatus: 'REFUNDED' },
      });

      return reembolso;
    });

    res.status(201).json({
      mensaje: 'Reembolso registrado correctamente',
      reembolso: resultado,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// HISTORIAL DE PAGOS

export const obtenerHistorialPagos = async (req, res) => {
  try {
    const {
      patientId,
      professionalId,
      method,
      type,
      isRefund,
      desde,
      hasta,
    } = req.query;

    // Construir filtros dinámicamente
    const where = {};

    // Filtro por método de pago
    if (method) {
      const metodosValidos = ['CASH', 'TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD'];
      if (!metodosValidos.includes(method)) {
        return res.status(400).json({
          mensaje: `Método inválido. Valores permitidos: ${metodosValidos.join(', ')}`,
        });
      }
      where.method = method;
    }

    // Filtro por tipo de pago
    if (type) {
      const tiposValidos = ['DEPOSIT', 'FINAL_PAYMENT', 'FULL_PAYMENT'];
      if (!tiposValidos.includes(type)) {
        return res.status(400).json({
          mensaje: `Tipo inválido. Valores permitidos: ${tiposValidos.join(', ')}`,
        });
      }
      where.type = type;
    }

    // Filtro por reembolsos
    if (isRefund !== undefined) {
      where.isRefund = isRefund === 'true';
    }

    // Filtro por rango de fechas
    if (desde || hasta) {
      where.paidAt = {
        ...(desde && { gte: new Date(desde) }),
        ...(hasta && { lte: new Date(hasta) }),
      };
    }

    // Filtro por paciente o profesional (van anidados en appointment)
    if (patientId || professionalId) {
      where.appointment = {
        ...(patientId && { patientId }),
        ...(professionalId && {
          professionalService: { professionalId },
        }),
      };
    }

    const pagos = await prisma.payment.findMany({
      where,
      include: {
        appointment: {
          include: {
            patient: { include: { person: true } },
            professionalService: {
              include: {
                professional: { include: { person: true } },
                service: true,
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    // Calcular totales del resultado
    const totalCobrado = pagos
      .filter((p) => !p.isRefund)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const totalReembolsado = pagos
      .filter((p) => p.isRefund)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    res.json({
      resumen: {
        cantidadRegistros: pagos.length,
        totalCobrado,
        totalReembolsado,
        neto: totalCobrado - totalReembolsado,
      },
      pagos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ELIMINAR PAGO

export const eliminarPago = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await prisma.payment.findUnique({
      where: { id },
      include: { appointment: { include: { payments: true } } },
    });

    if (!pago) {
      return res.status(404).json({ mensaje: 'Pago no encontrado' });
    }

    // Recalcular estado de pago del turno tras eliminar
    const turno = pago.appointment;
    const precioFinal =
      Number(turno.priceSnapshot) - Number(turno.discountAmount || 0);

    const pagosRestantes = turno.payments.filter((p) => p.id !== id);

    const totalPagadoRestante = pagosRestantes
      .filter((p) => !p.isRefund)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    let nuevoPaymentStatus = 'PENDING';
    if (totalPagadoRestante >= precioFinal) {
      nuevoPaymentStatus = 'COMPLETED';
    } else if (totalPagadoRestante > 0) {
      nuevoPaymentStatus = 'PARTIAL';
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id } });

      await tx.appointment.update({
        where: { id: turno.id },
        data: { paymentStatus: nuevoPaymentStatus },
      });
    });

    res.json({ mensaje: 'Pago eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};