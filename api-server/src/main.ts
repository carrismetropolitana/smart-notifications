/* * */
import { FastifyServerOptions } from 'fastify';

import FastifyService from '@/services/fastify.service';

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
	// Start Fastify server
	const fastifyService = FastifyService.getInstance(options);
	await fastifyService.start();
}

main();
