import { Request, Response, NextFunction } from 'express';
import * as appointmentService from './appointment.service';
import {
  createAppointmentSchema,
  listAppointmentQuerySchema,
  appointmentIdParamSchema,
} from './appointment.schema';

/**
 * GET /api/appointments
 * GET /api/appointments?clientId=uuid&serviceId=uuid&limit=50
 */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { clientId, serviceId, limit } = listAppointmentQuerySchema.parse(req.query);

    const appointments = await appointmentService.list(companyId, {
      clientId,
      serviceId,
      limit,
    });

    res.status(200).json(appointments);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/appointments/:id
 */
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { id } = appointmentIdParamSchema.parse(req.params);

    const appointment = await appointmentService.getById(id, companyId);

    res.status(200).json(appointment);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/appointments
 * Registra um atendimento realizado.
 * Valida que clientId e serviceId pertencem à empresa autenticada.
 * Rejeita datas futuras — Appointment representa atendimento já ocorrido.
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const data = createAppointmentSchema.parse(req.body);

    const appointment = await appointmentService.create(data, companyId);

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/appointments/:id — restrito a ADMIN
 * Remove um atendimento do histórico.
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { id } = appointmentIdParamSchema.parse(req.params);

    await appointmentService.remove(id, companyId);

    res.status(200).json({ message: 'Atendimento removido com sucesso' });
  } catch (err) {
    next(err);
  }
}
