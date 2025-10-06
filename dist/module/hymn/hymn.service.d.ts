import { Model } from 'mongoose';
import { Hymn, HymnDocument } from '../../schema/hymn.schema';
export declare class HymnsService {
    private hymnModel;
    constructor(hymnModel: Model<HymnDocument>);
    createHymn(data: Partial<Hymn>): Promise<Hymn>;
    findAll(): Promise<Hymn[]>;
    findByNumberOrTitle(query: string): Promise<{
        exactMatch?: Hymn;
        suggestions?: Hymn[];
        notFound?: string;
    }>;
}
