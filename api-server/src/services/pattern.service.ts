import HttpException from "@/common/http-exception";
import { IPattern } from "@/models/pattern";

class PatternService {

    private static _instance: PatternService;
    readonly baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public static getInstance(baseUrl?: string) {
        if (!PatternService._instance) {
            if(!baseUrl) throw new Error('Base URL is required');
            PatternService._instance = new PatternService(baseUrl);
        }

        return PatternService._instance;
    }

    public async getPatterns() : Promise<IPattern> {
        const res = await fetch(`${this.baseUrl}`);
        
        if (!res.ok) {
            throw new HttpException(res.status, res.statusText);
        }

        return await res.json() as IPattern;
    }

    public async getPattern(id: string) : Promise<IPattern[]> {
        const res = await fetch(`${this.baseUrl}/${id}`);
        
        if (!res.ok) {
            throw new HttpException(res.status, res.statusText);
        }

        return await res.json() as IPattern[];
    }
}

export default PatternService;