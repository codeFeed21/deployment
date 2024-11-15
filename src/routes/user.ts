import { Request, Response, Router } from 'express';
import {
  createCabin,
  deleteCabin,
  getCabinData,
  updateCabin,
} from '../controllers/cabin';
import { getSettings, updateSettings } from '../controllers/settings';
import authMiddleware from '../middlewares/auth';
import {
  getCurrentUser,
  login,
  logout,
  register,
  updateUser,
} from '../controllers/users';
import {
  createBookings,
  deleteBookings,
  filterBookings,
  getBookings,
  getBookingsAfterDate,
  getBookingsById,
  getStaysAfterDate,
  // sortBookings,
} from '../controllers/bookings';
import { createGuests } from '../controllers/guests';
// import {
//   deleteBookings,
//   getBookings,
//   updateBookings,
// } from '../controllers/bookings';
export const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json('Hello from user!');
});

// User routes
router.post('/login', login);
router.post('/register', register);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/me', authMiddleware, updateUser);
router.get('/logout', logout);

// Cabin routes
router.get('/cabins', getCabinData);
router.delete('/cabin/:id', deleteCabin);
router.post('/cabins', createCabin);
router.put('/cabins', updateCabin);

// Setting routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Booking routesS
router.get('/bookings', getBookings);
router.get('/bookingfilter', filterBookings);
// router.get('/sortbooking', sortBookings);
router.get('/booking', authMiddleware, getBookingsAfterDate);
router.get('/booking/:id', authMiddleware, getBookingsById);
router.get('/stays', authMiddleware, getStaysAfterDate);
router.post('/booking', authMiddleware, createBookings);
// router.put('/bookings', updateBookings);
router.delete('/cabin/:id', authMiddleware, deleteBookings);

// Guest routes
router.post('/guests', createGuests);
