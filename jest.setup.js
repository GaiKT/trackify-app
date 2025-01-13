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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./src/utils/database");
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.AppDataSource.initialize();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clear test database between tests
    const entities = database_1.AppDataSource.entityMetadatas;
    for (const entity of entities) {
        const repository = database_1.AppDataSource.getRepository(entity.name);
        yield repository.clear();
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.AppDataSource.destroy();
}));
