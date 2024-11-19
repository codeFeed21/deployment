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
exports.updateCabin = exports.createCabin = exports.deleteCabin = exports.getCabinData = void 0;
const multer_1 = __importDefault(require("multer"));
// import fs from 'fs';
// import path from 'path';
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const supabaseClient_1 = require("../utils/supabaseClient");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const getCabinData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cabins = yield prisma.cabins.findMany({
            select: {
                id: true,
                name: true,
                maxCapacity: true,
                regularPrice: true,
                discount: true,
                image: true,
                description: true,
            },
        });
        // const calculateDiscount = cabins.map((cabin) => {
        //   const discount =
        //     cabin.regularPrice > 1500
        //       ? cabin.regularPrice * 0.4
        //       : cabin.regularPrice * 0.15;
        //   return {
        //     cabin,
        //     discount,
        //   };
        // });
        res.json({
            cabins,
        });
    }
    catch (e) {
        console.error('Failed to get Cabins', e);
    }
});
exports.getCabinData = getCabinData;
const deleteCabin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const cabinId = parseInt(id);
        if (isNaN(cabinId)) {
            return res.status(400).json({ error: 'Invalid cabin ID' });
        }
        const cabin = yield prisma.cabins.findUnique({
            where: { id: cabinId },
        });
        if (!cabin) {
            return res.status(404).json({ error: 'Cabin not found' });
        }
        yield prisma.cabins.delete({
            where: { id: cabinId },
        });
        // const dataDir = path.join(__dirname, '../../data', cabinId.toString());
        // console.log(dataDir);
        res.json({
            msg: 'Cabin deleted successfully!',
        });
    }
    catch (error) {
        console.error('Error deleting cabin:', error);
        res.status(500).json({
            error: 'Internal Server Error',
        });
    }
});
exports.deleteCabin = deleteCabin;
// If using local storage
// const dataDir = path.join(__dirname, '../../data/');
// if (!fs.existsSync(dataDir)) {
//   try {
//     fs.mkdirSync(dataDir, { recursive: true });
//   } catch (error) {
//     console.error('Error creating data directory:', error);
//     process.exit(1);
//   }
// }
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, dataDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   },
// });
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const uploadMiddleware = upload.single('image');
const createCabin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    uploadMiddleware(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err instanceof multer_1.default.MulterError) {
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
            const { name, maxCapacity, regularPrice, discount, description, image: imageString, } = req.body;
            let imagePath;
            if (req.file) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const filePath = `cabins/images/${uniqueSuffix}-${req.file.originalname}`;
                // upload to bucket
                const { data, error: uploadError } = yield supabaseClient_1.supabase.storage
                    .from('booking')
                    .upload(filePath, req.file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                });
                if (uploadError) {
                    console.error('Supabase upload error', uploadError);
                    return res
                        .status(500)
                        .json({ error: 'File upload to Supabase failed' });
                }
                imagePath = (data === null || data === void 0 ? void 0 : data.path)
                    ? `${supabaseClient_1.supabaseUrl}/storage/v1/object/public/booking/${filePath}`
                    : '';
            }
            else if (typeof imageString === 'string') {
                imagePath = imageString;
            }
            else {
                return res
                    .status(400)
                    .json({ error: 'Image file or image string is required' });
            }
            const cabin = yield prisma.cabins.create({
                data: {
                    name,
                    maxCapacity: parseInt(maxCapacity),
                    regularPrice: parseInt(regularPrice),
                    discount: parseInt(discount),
                    description,
                    image: imagePath,
                },
            });
            res.json({
                cabin,
                msg: 'Cabin created successfully!',
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Internal Server Error',
            });
        }
    }));
});
exports.createCabin = createCabin;
const updateCabin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    uploadMiddleware(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ error: err.message });
        }
        else if (err) {
            return res.status(500).json({ error: 'File Upload failed' });
        }
        try {
            const { id, name, maxCapacity, regularPrice, discount, description } = req.body;
            const cabinId = parseInt(id);
            let imagePath;
            if (req.file) {
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                const filePath = `cabins/${uniqueSuffix}-${req.file.originalname}`;
                const { data, error: uploadError } = yield supabaseClient_1.supabase.storage
                    .from('booking')
                    .upload(filePath, req.file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                });
                if (uploadError) {
                    console.error('Supabase upload error', uploadError);
                    return res
                        .status(500)
                        .json({ error: 'File upload to Supabase failed' });
                }
                imagePath = `${supabaseClient_1.supabaseUrl}/storage/v1/object/public/booking/${filePath}`;
            }
            const cabin = yield prisma.cabins.update({
                where: { id: cabinId },
                data: Object.assign({ name, maxCapacity: parseInt(maxCapacity), regularPrice: parseInt(regularPrice), discount: parseInt(discount), description }, (imagePath ? { image: imagePath } : {})),
            });
            res.json({
                cabin,
                msg: 'Cabin updated successfully!',
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }));
});
exports.updateCabin = updateCabin;
