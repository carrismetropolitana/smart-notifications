/* * */

import FastifyService from '@/services/fastify.service';
import { FastifyInstance } from 'fastify';

import NotificationsController from './notifications.controller';
import authMiddleware from '@/middleware/auth.middleware';

/* * */
const controller = new NotificationsController();
const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/v1/notifications';

server.register((instance, opts, next) => {

    // instance.addHook('onRequest', async (request, reply) => await authMiddleware(request, reply));

    instance.post('/:userId', controller.createNotification);
    instance.delete('/:userId', controller.deleteNotification);

    next();
}, { prefix: namespace });