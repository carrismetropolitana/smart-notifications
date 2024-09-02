import HttpException from "@/common/http-exception";
import HttpStatus from "@/common/http-status";
import { verifyJWT } from "@/common/utils";
import { IJwt } from "@/models/jwt";
import { FastifyRequest, FastifyReply } from "fastify";

export default async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
	const token = request.headers['authorization']?.split(' ')[1] || undefined;

    const decodedToken = await verifyJWT<IJwt>(token);
    if (!decodedToken) {
        throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid authorization token');
    }
}