"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookings = getBookings;
exports.createBookings = createBookings;
exports.filterBookings = filterBookings;
exports.sortBookings = sortBookings;
exports.getBookingsById = getBookingsById;
exports.updateBookings = updateBookings;
exports.deleteBookings = deleteBookings;
exports.getBookingsAfterDate = getBookingsAfterDate;
exports.getStaysAfterDate = getStaysAfterDate;
const date_fns_1 = require("date-fns");
const db_1 = __importDefault(require("../db"));
const client_1 = require("@prisma/client");
function getBookings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bookings = yield db_1.default.bookings.findMany({
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
        }
        catch (error) {
            console.error('Failed to get bookings', error);
            res.status(500).json({ error: 'Failed to get bookings' });
        }
    });
}
function createBookings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { createdAt, startDate, endDate, numGuests, cabinId, guestId, status, hasBreakfast, isPaid, observations, } = req.body;
            const start = (0, date_fns_1.parseISO)(startDate);
            const end = (0, date_fns_1.parseISO)(endDate);
            const numNights = (0, date_fns_1.differenceInDays)(end, start);
            const extraPrice = Math.abs(hasBreakfast ? 120 * numGuests * numNights : 0);
            const cabin = yield db_1.default.cabins.findUnique({
                where: { id: cabinId },
                select: { regularPrice: true, discount: true },
            });
            if (!cabin) {
                throw new Error('Cabin not found');
            }
            const { regularPrice, discount } = cabin;
            const cabinPrice = regularPrice - discount;
            const totalPrice = cabinPrice + extraPrice;
            const booking = yield db_1.default.bookings.create({
                data: {
                    createdAt: createdAt ? new Date(createdAt) : new Date(),
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
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
        }
        catch (error) {
            console.error('Failed to create bookings', error);
            res.status(500).json({ error: 'Failed to create bookings' });
        }
    });
}
function filterBookings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { filter } = req.query;
            // Ensure statusFilter is a valid enum value
            let statusFilter;
            if (typeof filter === 'string' &&
                Object.values(client_1.Status).includes(filter)) {
                statusFilter = filter;
            }
            else if (filter) {
                return res.status(400).json({ error: 'Invalid status value' });
            }
            const bookings = yield db_1.default.bookings.findMany({
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
        }
        catch (error) {
            console.error('Failed to get bookings', error);
            res.status(500).json({ error: 'Failed to get bookings' });
        }
    });
}
function sortBookings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sortBy = req.query.sortBy || 'startDate-asc';
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
            const bookings = yield db_1.default.bookings.findMany({
                orderBy: {
                    [field]: sortOrder,
                },
            });
            res.status(200).json({ bookings });
        }
        catch (error) {
            console.error('Failed to get bookings', error);
            res.status(500).json({ error: 'Failed to get bookings' });
        }
    });
}
function getBookingsById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (typeof id !== 'string') {
                return res.status(400).json({ error: 'Invalid id parameter' });
            }
            const bookingId = parseInt(id);
            if (isNaN(bookingId)) {
                return res.status(400).json({ error: 'Invalid id parameter' });
            }
            const booking = yield db_1.default.bookings.findUnique({
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
        }
        catch (error) {
            console.error('Failed to get bookings', error);
            res.status(500).json({ error: 'Failed to get bookings' });
        }
    });
}
function updateBookings(req, res) {
    return __awaiter(this, void 0, void 0, function* () { });
}
function deleteBookings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const bookingId = parseInt(id);
            if (isNaN(bookingId)) {
                return res.status(400).json({ error: 'Invalid Booking ID' });
            }
            const booking = yield db_1.default.bookings.findUnique({
                where: { id: bookingId },
            });
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            yield db_1.default.bookings.delete({
                where: { id: bookingId },
            });
            res.json({
                msg: 'Booking deleted successfully!',
            });
        }
        catch (error) {
            console.error('Error deleting Booking:', error);
            res.status(500).json({
                error: 'Internal Server Error',
            });
        }
    });
}
function getBookingsAfterDate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the date from query parameters or default to the current date
            const { date } = req.query;
            // Validate the date parameter
            const parseDate = date ? new Date(date) : new Date();
            if (isNaN(parseDate.getTime())) {
                return res.status(400).json({ error: 'Invalid date format' });
            }
            const today = new Date();
            const bookings = yield db_1.default.bookings.findMany({
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
        }
        catch (error) {
            console.error('Failed to get bookings', error);
            res.status(500).json({ error: 'Failed to get bookings' });
        }
    });
}
function getStaysAfterDate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the date from query parameters or default to the current date
        const dateParam = req.query.date;
        const date = dateParam ? new Date(dateParam) : new Date();
        // Validate the date parameter
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }
        try {
            const stays = yield db_1.default.bookings.findMany({
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
        }
        catch (error) {
            console.error('Failed to get bookings', error);
            res.status(500).json({ error: 'Failed to get bookings' });
        }
    });
}
