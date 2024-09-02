import HttpException from "@/common/http-exception";
import { IStop } from "@/models/stop";

class StopsService {

    private static _instance: StopsService;
    readonly baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public static getInstance(baseUrl?: string) {
        if (!StopsService._instance) {
            if(!baseUrl) throw new Error('Base URL is required');
            StopsService._instance = new StopsService(baseUrl);
        }

        return StopsService._instance;
    }

    public async getStops() : Promise<IStop> {
        const res = await fetch(`${this.baseUrl}`);
        
        if (!res.ok) {
            throw new HttpException(res.status, res.statusText);
        }

        return await res.json() as IStop;
    }

    public async getStop(id: string) : Promise<IStop> {
        const res = await fetch(`${this.baseUrl}/${id}`);
        
        if (!res.ok) {
            throw new HttpException(res.status, res.statusText);
        }

        return await res.json() as IStop;
    }
}

export default StopsService;