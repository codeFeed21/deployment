import { Request, Response } from 'express';
import prisma from '../db';

export async function getSettings(req: Request, res: Response) {
  try {
    const settings = await prisma.settings.findMany({
      select: {
        id: true,
        maxBookingLength: true,
        minBookingLength: true,
        maxGuestsPerBooking: true,
        breakfast: true,
      },
    });
    res.json({
      settings,
    });
  } catch (e) {
    console.log('Failed to get Settings', e);
  }
}
export async function updateSettings(req: Request, res: Response) {
  try {
    const {
      minBookingLength,
      maxBookingLength,
      maxGuestsPerBooking,
      breakfast,
    } = req.body;
    const id = 1;
    const dataToUpdate: any = {};

    if (minBookingLength !== undefined) {
      dataToUpdate.minBookingLength = parseInt(minBookingLength, 10);
    }

    if (maxBookingLength !== undefined) {
      dataToUpdate.maxBookingLength = parseInt(maxBookingLength, 10);
    }

    if (maxGuestsPerBooking !== undefined) {
      dataToUpdate.maxGuestsPerBooking = parseInt(maxGuestsPerBooking, 10);
    }

    if (breakfast !== undefined) {
      dataToUpdate.breakfast = parseInt(breakfast, 10);
    }
    const setting = await prisma.settings.update({
      where: { id: id },
      data: dataToUpdate,
    });
    res.json({
      setting,
      msg: 'Setting updated successfully!',
    });
  } catch (e) {
    console.log('Failed to get Settings', e);
  }
}
