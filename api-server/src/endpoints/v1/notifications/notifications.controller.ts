import { bindMethods } from "@/common/utils";
import NotificationsService from "./notifications.service";
import { FastifyRequest } from "fastify";
import HttpException from "@/common/http-exception";
import HttpStatus from "@/common/http-status";
import { INotification } from "@/models/notification";

class NotificationsController {

    private readonly service: NotificationsService;

	constructor() {
		this.service = new NotificationsService();

		// Bind methods
		bindMethods(NotificationsController.prototype, this);
	}

    async createNotification(request: FastifyRequest< { Body: INotification }>) {
        const notification = request.body;
        return notification;
    }

    async updateNotification() {
        throw new HttpException(HttpStatus.NOT_IMPLEMENTED, 'Not implemented');
    }

    async getNotifications() {
        throw new HttpException(HttpStatus.NOT_IMPLEMENTED, 'Not implemented');
    }
}

export default NotificationsController;