import { Document } from 'mongoose';
export type HymnDocument = Hymn & Document;
export declare class Hymn {
    title: string;
    number: number;
    tune?: string;
    bibleReferences?: string[];
    verses: string[];
    chorus?: string;
    category: string;
    author?: string;
    createdAt: Date;
}
export declare const HymnSchema: import("mongoose").Schema<Hymn, import("mongoose").Model<Hymn, any, any, any, Document<unknown, any, Hymn> & Hymn & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Hymn, Document<unknown, {}, import("mongoose").FlatRecord<Hymn>> & import("mongoose").FlatRecord<Hymn> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
