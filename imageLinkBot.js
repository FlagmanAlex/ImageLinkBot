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
require('dotenv').config();
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const file_1 = require("./file");
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const BOT_TOKEN = process.env.BOT_TOKEN;
const FLAGMANALEX_CHAT_ID = process.env.FLAGMANALEX_CHAT_ID;
const BD_TOKEN = process.env.BD_TOKEN;
const HOST = process.env.HOST || 'http://localhost';
const PORT = process.env.PORT || 5050;
// Адрес Bot API. С серверов в РФ api.telegram.org режется — тогда TELEGRAM_API_URL указывает на
// посредника (Cloudflare Worker tg-relay из репозитория warehouse, server/deploy/telegram-relay-worker.js).
const TELEGRAM_API_URL = (process.env.TELEGRAM_API_URL || 'https://api.telegram.org').trim().replace(/\/+$/, '');
const IMAGE_DIR = path_1.default.resolve(__dirname, './image');
if (!BOT_TOKEN || !BD_TOKEN || !FLAGMANALEX_CHAT_ID) {
    throw new Error('Отсутствуют обязательные переменные окружения!');
}
const app = (0, express_1.default)();
app.use('/image', express_1.default.static(IMAGE_DIR));
app.listen(PORT, () => {
    console.log(`Сервер запущен на ${HOST}:${PORT}`);
});
mongoose_1.default
    .connect(BD_TOKEN, { dbName: process.env.BD_NAME_IMAGE })
    .then(() => console.log('Соединение с базой MongoDB прошло успешно'))
    .catch((e) => console.log(`Ошибка подключения к MongoDB: ${e.message}`));
const SaveLogSchema = new mongoose_1.default.Schema({
    date: { type: Date, default: Date.now },
    username: { type: String },
    first_name: { type: String },
    user_id: { type: Number },
    fileUrl: { type: String },
});
const SaveLog = mongoose_1.default.model('SaveLog', SaveLogSchema, 'SaveLog');
const bot = new node_telegram_bot_api_1.default(BOT_TOKEN, { polling: true, baseApiUrl: TELEGRAM_API_URL });
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Добро пожаловать в загрузчик картинок. Пришлите мне картинку, а я отдам Вам ссылку на нее.');
});
bot.on('photo', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const chatId = msg.chat.id;
    const photoArray = msg.photo;
    if (photoArray && photoArray.length > 0) {
        const fileId = photoArray[photoArray.length - 1].file_id;
        const userId = (_a = msg.from) === null || _a === void 0 ? void 0 : _a.id;
        const userName = (_b = msg.from) === null || _b === void 0 ? void 0 : _b.username;
        const firstName = (_c = msg.from) === null || _c === void 0 ? void 0 : _c.first_name;
        try {
            const file = yield bot.getFile(fileId);
            const fileName = Date.now();
            const tgUrl = `${TELEGRAM_API_URL}/file/bot${BOT_TOKEN}/${file.file_path}`;
            const fileUrl = yield (0, file_1.saveImage)(tgUrl, `${userId}-${fileName}`);
            bot.sendMessage(chatId, `Вот Ваша ссылка на фото: ${fileUrl}`);
            if (FLAGMANALEX_CHAT_ID) {
                bot.sendMessage(FLAGMANALEX_CHAT_ID, `Пользователь: @${userName} ${firstName} с ID:${userId} отправил рисунок`);
                bot.sendPhoto(FLAGMANALEX_CHAT_ID, fileId);
            }
            const saveLog = new SaveLog({
                username: userName,
                first_name: firstName,
                user_id: userId,
                fileUrl: fileUrl,
            });
            yield saveLog.save();
            console.log('Данные успешно сохранены в базу данных');
        }
        catch (error) {
            console.log('Ошибка при получении ссылки на фото', error);
            bot.sendMessage(chatId, 'Не удалось получить ссылку на фото');
        }
    }
}));
