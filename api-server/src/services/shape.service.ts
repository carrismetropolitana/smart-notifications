import HttpException from "@/common/http-exception";
import { IShape } from "@/models/shape";

class ShapeService {

    private static _instance: ShapeService;
    readonly baseUrl: string;
    
    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public static getInstance(baseUrl?: string) {
        if (!ShapeService._instance) {
            if(!baseUrl) throw new Error('Base URL is required');
            ShapeService._instance = new ShapeService(baseUrl);
        }

        return ShapeService._instance;
    }

    public async getShapes() : Promise<IShape> {
        const res = await fetch(`${this.baseUrl}`);
        
        if (!res.ok) {
            throw new HttpException(res.status, res.statusText);
        }

        return await res.json() as IShape;
    }

    public async getShape(id: string) : Promise<IShape> {
        const res = await fetch(`${this.baseUrl}/${id}`);
        (`${this.baseUrl}/${id}`);

        (res);
        
        if (!res.ok) {
            throw new HttpException(res.status, res.statusText);
        }

        return await res.json() as IShape;
    }
}

export default ShapeService;