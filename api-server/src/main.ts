/* * */
import { FastifyServerOptions } from 'fastify';

import FastifyService from '@/services/fastify.service';
import RedisService from './services/redis.service';
import StopsService from './services/stops.service';

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
	StopsService.getInstance(process.env.STOPS_SERVICE_URL as string);
	
	// Connect to Redis
	const redisService = RedisService.getInstance({ url: process.env.REDIS_URL as string });
	redisService.connect();
	
	// Start Fastify server
	const fastifyService = FastifyService.getInstance(options);
	fastifyService.start();
	
}

main()
