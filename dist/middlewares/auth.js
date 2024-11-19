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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const db_1 = __importDefault(require("../db"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = req.cookies.authorization;
    // console.log(authToken);
    if (!authToken || !authToken.startsWith('Bearer ')) {
        return res.status(403).json({
            msg: 'Invalid Token Format!',
        });
    }
    const token = authToken.split(' ')[1];
    // console.log(token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        req.id = decoded.id;
        const user = yield db_1.default.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                Avatar: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                msg: 'User not found',
            });
        }
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            Avatar: user.Avatar,
        };
        next();
    }
    catch (e) {
        if (e instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                msg: 'Token expired',
            });
        }
        return res.status(403).json({
            msg: 'Authentication failed!',
        });
    }
});
exports.default = authMiddleware;
