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
exports.createGuests = createGuests;
const db_1 = __importDefault(require("../db"));
function createGuests(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { fullName, email, nationalId, Nationality, countryFlag } = req.body;
        try {
            const newGuest = yield db_1.default.guests.create({
                data: {
                    fullName: fullName,
                    email: email,
                    nationalId: nationalId,
                    Nationality: Nationality,
                    countryFlag: countryFlag,
                },
            });
            res.json(newGuest);
        }
        catch (error) {
            console.error('Failed to get bookings', error);
            res.status(500).json({ error: 'Failed to create guests' });
        }
    });
}
