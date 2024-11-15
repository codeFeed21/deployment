import { Request, Response } from 'express';
import prisma from '../db';

export async function createGuests(req: Request, res: Response) {
  const { fullName, email, nationalId, Nationality, countryFlag } = req.body;
  try {
    const newGuest = await prisma.guests.create({
      data: {
        fullName: fullName,
        email: email,
        nationalId: nationalId,
        Nationality: Nationality,
        countryFlag: countryFlag,
      },
    });
    res.json(newGuest);
  } catch (error) {
    console.error('Failed to get bookings', error);
    res.status(500).json({ error: 'Failed to create guests' });
  }
}
