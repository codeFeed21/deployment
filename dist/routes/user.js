"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const cabin_1 = require("../controllers/cabin");
const settings_1 = require("../controllers/settings");
const auth_1 = __importDefault(require("../middlewares/auth"));
const users_1 = require("../controllers/users");
const bookings_1 = require("../controllers/bookings");
const guests_1 = require("../controllers/guests");
// import {
//   deleteBookings,
//   getBookings,
//   updateBookings,
// } from '../controllers/bookings';
exports.router = (0, express_1.Router)();
exports.router.get('/', (req, res) => {
    res.json('Hello from user!');
});
// User routes
exports.router.post('/login', users_1.login);
exports.router.post('/register', users_1.register);
exports.router.get('/me', auth_1.default, users_1.getCurrentUser);
exports.router.put('/me', auth_1.default, users_1.updateUser);
exports.router.get('/logout', users_1.logout);
// Cabin routes
exports.router.get('/cabins', cabin_1.getCabinData);
exports.router.delete('/cabin/:id', cabin_1.deleteCabin);
exports.router.post('/cabins', cabin_1.createCabin);
exports.router.put('/cabins', cabin_1.updateCabin);
// Setting routes
exports.router.get('/settings', settings_1.getSettings);
exports.router.put('/settings', settings_1.updateSettings);
// Booking routesS
exports.router.get('/bookings', bookings_1.getBookings);
exports.router.get('/bookingfilter', bookings_1.filterBookings);
// router.get('/sortbooking', sortBookings);
exports.router.get('/booking', auth_1.default, bookings_1.getBookingsAfterDate);
exports.router.get('/booking/:id', auth_1.default, bookings_1.getBookingsById);
exports.router.get('/stays', auth_1.default, bookings_1.getStaysAfterDate);
exports.router.post('/booking', auth_1.default, bookings_1.createBookings);
// router.put('/bookings', updateBookings);
exports.router.delete('/cabin/:id', auth_1.default, bookings_1.deleteBookings);
// Guest routes
exports.router.post('/guests', guests_1.createGuests);
