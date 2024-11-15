import { Request, Response } from 'express';
import { differenceInDays, parseISO } from 'date-fns';
import prisma from '../db';
import { Status } from '@prisma/client';

export async function getBookings(req: Request, res: Response) {
  try {
    const bookings = await prisma.bookings.findMany({
      select: {
        id: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        numNights: true,
        numGuests: true,
        status: true,
        totalPrice: true,
        extraPrice: true,
        isPaid: true,
        cabin: {
          select: {
            name: true,
          },
        },
        guests: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Failed to get bookings', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
}

export async function createBookings(req: Request, res: Response) {
  try {
    const {
      createdAt,
      startDate,
      endDate,
      numGuests,
      cabinId,
      guestId,
      status,
      hasBreakfast,
      isPaid,
      observations,
    } = req.body;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const numNights = differenceInDays(end, start);

    const extraPrice = Math.abs(hasBreakfast ? 120 * numGuests * numNights : 0);

    const cabin = await prisma.cabins.findUnique({
      where: { id: cabinId },
      select: { regularPrice: true, discount: true },
    });

    if (!cabin) {
      throw new Error('Cabin not found');
    }
    const { regularPrice, discount } = cabin;
    const cabinPrice = regularPrice - discount;
    const totalPrice = cabinPrice + extraPrice;

    const booking = await prisma.bookings.create({
      data: {
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        numNights: numNights,
        numGuests: parseInt(numGuests),
        extraPrice: extraPrice,
        cabinPrice: cabinPrice,
        totalPrice: totalPrice,
        cabinId: parseInt(cabinId),
        status,
        guestId: parseInt(guestId),
        hasBreakfast: Boolean(hasBreakfast),
        isPaid: Boolean(isPaid),
        observations,
      },
    });

    res.status(200).json({ booking, msg: 'Booking created Successfully!' });
  } catch (error) {
    console.error('Failed to create bookings', error);
    res.status(500).json({ error: 'Failed to create bookings' });
  }
}

export async function filterBookings(req: Request, res: Response) {
  try {
    const { filter } = req.query;

    // Ensure statusFilter is a valid enum value
    let statusFilter;
    if (
      typeof filter === 'string' &&
      Object.values(Status).includes(filter as Status)
    ) {
      statusFilter = filter as Status;
    } else if (filter) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const bookings = await prisma.bookings.findMany({
      where: {
        status: statusFilter ? { equals: statusFilter } : undefined,
      },
      select: {
        id: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        numNights: true,
        numGuests: true,
        status: true,
        totalPrice: true,
        extraPrice: true,
        isPaid: true,
        cabin: {
          select: {
            name: true,
          },
        },
        guests: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Failed to get bookings', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
}

export async function sortBookings(req: Request, res: Response) {
  try {
    const sortBy = (req.query.sortBy as string) || 'startDate-asc';
    const [field, direction] = sortBy.split('-');
    const validFields = [
      'startDate',
      'endDate',
      'createdAt',
      'numNights',
      'totalPrice',
    ];
    const validDirections = ['asc', 'desc'];

    if (!validFields.includes(field) || !validDirections.includes(direction)) {
      return res.status(400).json({ error: 'Invalid sort parameter' });
    }

    const sortOrder = direction === 'asc' ? 'asc' : 'desc';
    const bookings = await prisma.bookings.findMany({
      orderBy: {
        [field]: sortOrder,
      },
    });
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Failed to get bookings', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
}

export async function getBookingsById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid id parameter' });
    }

    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid id parameter' });
    }

    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        numNights: true,
        numGuests: true,
        status: true,
        totalPrice: true,
        extraPrice: true,
        isPaid: true,
        cabin: {
          select: {
            name: true,
          },
        },
        guests: {
          select: {
            fullName: true,
            email: true,
            nationalId: true,
            Nationality: true,
            countryFlag: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({ booking });
  } catch (error) {
    console.error('Failed to get bookings', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
}

export async function updateBookings(req: Request, res: Response) {}

export async function deleteBookings(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid Booking ID' });
    }

    const booking = await prisma.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await prisma.bookings.delete({
      where: { id: bookingId },
    });

    res.json({
      msg: 'Booking deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting Booking:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

export async function getBookingsAfterDate(req: Request, res: Response) {
  try {
    // Get the date from query parameters or default to the current date
    const { date } = req.query;

    // Validate the date parameter
    const parseDate = date ? new Date(date as string) : new Date();
    if (isNaN(parseDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const today = new Date();
    const bookings = await prisma.bookings.findMany({
      where: {
        createdAt: {
          gt: parseDate,
          lte: today,
        },
      },
      select: {
        id: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        numNights: true,
        numGuests: true,
        status: true,
        totalPrice: true,
        extraPrice: true,
        isPaid: true,
        cabin: {
          select: {
            name: true,
          },
        },
        guests: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    // const bookingsLength = bookings.length;
    res.status(200).json({ bookings });
  } catch (error) {
    console.error('Failed to get bookings', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
}

export async function getStaysAfterDate(req: Request, res: Response) {
  // Get the date from query parameters or default to the current date
  const dateParam = req.query.date;
  const date = dateParam ? new Date(dateParam as string) : new Date();

  // Validate the date parameter
  if (isNaN(date.getTime())) {
    return res.status(400).json({ error: 'Invalid date format' });
  }

  try {
    const stays = await prisma.bookings.findMany({
      where: {
        startDate: {
          gte: date,
        },
      },
      select: {
        id: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        numNights: true,
        numGuests: true,
        status: true,
        totalPrice: true,
        extraPrice: true,
        isPaid: true,
        cabin: {
          select: {
            name: true,
          },
        },
        guests: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    const staysLength = stays.length;
    res.status(200).json({ stays });
  } catch (error) {
    console.error('Failed to get bookings', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
}
