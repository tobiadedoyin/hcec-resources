import { HymnsService } from './hymn.service';
import { AddHymnDto } from './dto/add-hymn.dto';
export declare class HymnsController {
    private readonly hymnsService;
    constructor(hymnsService: HymnsService);
    createHymn(body: AddHymnDto): Promise<import("../../schema/hymn.schema").Hymn>;
    getHymn(search: string): Promise<{
        exactMatch?: import("../../schema/hymn.schema").Hymn;
        suggestions?: import("../../schema/hymn.schema").Hymn[];
        notFound?: string;
    }>;
    getAllHymns(): Promise<import("../../schema/hymn.schema").Hymn[]>;
}
