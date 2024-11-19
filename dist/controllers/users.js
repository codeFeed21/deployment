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
exports.updateUser = void 0;
exports.login = login;
exports.register = register;
exports.getCurrentUser = getCurrentUser;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const config_1 = require("../config");
const multer_1 = __importDefault(require("multer"));
const supabaseClient_1 = require("../utils/supabaseClient");
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            const user = yield db_1.default.user.findUnique({
                where: { email: email, password: password },
            });
            if (!user) {
                return res.status(404).json({
                    msg: 'Invalid Username / User doesnt Exists!',
                });
            }
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
            }, config_1.JWT_SECRET);
            res.cookie('authorization', `Bearer ${token}`);
            return res.json({
                id: user.id,
                email: email,
                name: `${user.firstName} ${user.lastName}`,
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
}
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstName, lastName, email, password } = req.body;
            const existingUser = yield db_1.default.user.findUnique({
                where: { email: email },
            });
            if (existingUser) {
                return res.status(409).json({
                    msg: 'User Already exists!',
                });
            }
            const newUser = yield db_1.default.user.create({
                data: { email, password, firstName, lastName },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    Avatar: true,
                },
            });
            const token = jsonwebtoken_1.default.sign({
                id: newUser.id,
            }, config_1.JWT_SECRET);
            res.cookie('authorization', `Bearer ${token}`);
            return res.status(201).json({
                msg: 'User registered Succeesfully',
                newUser,
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
}
function getCurrentUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.json(req.user);
    });
}
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.status(200).clearCookie('authorization').json({
            msg: 'Logged Out Successfully',
        });
    });
}
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const uploadMiddleware = upload.single('Avatar');
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    uploadMiddleware(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(err);
        if (err instanceof multer_1.default.MulterError) {
            console.log(err);
            return res.status(400).json({
                error: err.message,
            });
        }
        else if (err) {
            return res.status(500).json({
                error: 'File Upload failed',
            });
        }
        try {
            const { id, firstName, lastName } = req.body;
            let avatarPath;
            if (req.file) {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const filePath = `users/avatars/${uniqueSuffix}-${req.file.originalname}`;
                const { data, error: uploadError } = yield supabaseClient_1.supabase.storage
                    .from('booking')
                    .upload(filePath, req.file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                });
                if (uploadError) {
                    console.error('Supabase upload error:', uploadError);
                    return res
                        .status(500)
                        .json({ error: 'File upload to Supabase failed' });
                }
                avatarPath = `${supabaseClient_1.supabaseUrl}/storage/v1/object/public/booking/${filePath}`;
            }
            const user = yield db_1.default.user.update({
                where: { id: parseInt(id) },
                data: {
                    firstName: firstName,
                    lastName: lastName,
                    Avatar: avatarPath,
                },
            });
            res.json({
                user,
                msg: 'User updated successfully!',
            });
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }));
});
exports.updateUser = updateUser;
