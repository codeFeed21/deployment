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
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
const db_1 = __importDefault(require("../db"));
function getSettings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const settings = yield db_1.default.settings.findMany({
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
        }
        catch (e) {
            console.log('Failed to get Settings', e);
        }
    });
}
function updateSettings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { minBookingLength, maxBookingLength, maxGuestsPerBooking, breakfast, } = req.body;
            const id = 1;
            const dataToUpdate = {};
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
            const setting = yield db_1.default.settings.update({
                where: { id: id },
                data: dataToUpdate,
            });
            res.json({
                setting,
                msg: 'Setting updated successfully!',
            });
        }
        catch (e) {
            console.log('Failed to get Settings', e);
        }
    });
}
