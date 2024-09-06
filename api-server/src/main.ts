/* * */
import { FastifyServerOptions } from 'fastify';

import FastifyService from '@/services/fastify.service';
import RedisService from './services/redis.service';
import StopsService from './services/stops.service';
import PatternService from './services/pattern.service';
import ShapeService from './services/shape.service';

/* * */

const options: FastifyServerOptions = {
	ignoreTrailingSlash: true,
	logger: {
		level: 'debug',
		transport: {
			options: {
				colorize: true,
			},
			target: 'pino-pretty',
		},
	},
};

async function main() {

	// Start Stops Service
	StopsService.getInstance(process.env.API_URL as string + '/stops');
	PatternService.getInstance(process.env.API_URL as string + '/patterns');
	ShapeService.getInstance(process.env.API_URL as string + '/shapes');
	
	// Connect to Redis
	const redisService = RedisService.getInstance({ url: process.env.REDIS_URL as string });
	redisService.connect();
	
	// Start Fastify server
	const fastifyService = FastifyService.getInstance(options);
	fastifyService.start();
	
}

main()
