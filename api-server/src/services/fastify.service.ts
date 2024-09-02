/* * */

import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import fastify, { FastifyInstance, FastifyListenOptions, FastifyServerOptions } from 'fastify';

/* * */

class FastifyService {
	private static _instance: FastifyService;
	public readonly server: FastifyInstance;

	private constructor(options: FastifyServerOptions) {
		this.server = fastify(options).withTypeProvider<TypeBoxTypeProvider>();
		this._setupDefaultRoutes();
	}

	public static getInstance(options?: FastifyServerOptions) {
		if (!FastifyService._instance) {
			FastifyService._instance = new FastifyService(options || {});
		}

		return FastifyService._instance;
	}

	private _setupDefaultRoutes() {
		this.server.get('/', (req, res) => {
			res.send('Jusi was here!');
		});
	}

	async start() {
		const options: FastifyListenOptions = {
			host: process.env.HOST || '0.0.0.0',
			port: Number(process.env.PORT) || 5050,
		};

		try {
			await this.server.listen(options);
		} catch (error) {
			this.server.log.error({
				error,
				message: 'Error starting server',
			});
			process.exit(1);
		}
	}

	async stop() {
		try {
			await this.server.close();
		} catch (error) {
			this.server.log.error(error);
			process.exit(1);
		}
	}
}

export default FastifyService;
