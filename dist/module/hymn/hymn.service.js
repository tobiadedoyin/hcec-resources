"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HymnsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const hymn_schema_1 = require("../../schema/hymn.schema");
let HymnsService = class HymnsService {
    constructor(hymnModel) {
        this.hymnModel = hymnModel;
    }
    async createHymn(data) {
        const newHymn = new this.hymnModel(data);
        return newHymn.save();
    }
    async findAll() {
        return this.hymnModel.find().exec();
    }
    async findByNumberOrTitle(query) {
        const isNumber = !isNaN(Number(query));
        if (isNumber) {
            const hymn = await this.hymnModel
                .findOne({ number: Number(query) })
                .exec();
            return hymn ? { exactMatch: hymn } : { notFound: 'not found' };
        }
        else {
            const exactMatch = await this.hymnModel.findOne({ title: query }).exec();
            if (exactMatch)
                return { exactMatch };
            const suggestions = await this.hymnModel
                .find({ title: { $regex: query, $options: 'i' } })
                .limit(10)
                .exec();
            return { suggestions };
        }
    }
};
exports.HymnsService = HymnsService;
exports.HymnsService = HymnsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(hymn_schema_1.Hymn.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], HymnsService);
//# sourceMappingURL=hymn.service.js.map