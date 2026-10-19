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
exports.saveImage = exports.deleteFile = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = require("path");
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const deleteFile = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const fullPath = (0, path_1.resolve)(__dirname, './image', fileName);
    try {
        yield promises_1.default.unlink(fullPath);
        console.log(`Файл ${fullPath} успешно удалён`);
    }
    catch (error) {
        console.error(`Ошибка при удалении файла: ${error.message}`);
    }
});
exports.deleteFile = deleteFile;
const saveImage = (url, filename) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const path = (0, path_1.resolve)(__dirname, '..', './image', `${filename}.jpeg`);
        const response = yield (0, axios_1.default)({
            method: 'get',
            url,
            responseType: 'stream',
        });
        return new Promise((resolve, reject) => {
            const stream = (0, fs_1.createWriteStream)(path);
            response.data.pipe(stream);
            stream.on('finish', () => {
                const absoluteUrl = `${process.env.HOST}/image/${filename}.jpeg`;
                console.log('Файл сохранён в папке image');
                resolve(absoluteUrl);
            });
            stream.on('error', (err) => {
                console.log('Ошибка записи файла', err.message);
                reject(err);
            });
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('Ошибка в модуле file.saveImage', error.message);
        }
    }
});
exports.saveImage = saveImage;
