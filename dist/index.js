"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const PORT = 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    credentials: true,
    origin: [FRONTEND_URL],
}));
app.use('/api/v1', routes_1.router);
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
