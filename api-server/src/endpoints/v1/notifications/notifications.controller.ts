import { bindMethods } from "@/common/utils";
import NotificationsService from "./notifications.service";
import { FastifyReply, FastifyRequest } from "fastify";
import HttpStatus from "@/common/http-status";
import { INotification, INotificationValidator } from "@/models/notification";

class NotificationsController {

    private readonly service: NotificationsService;

	constructor() {
		this.service = new NotificationsService();

		// Bind methods
		bindMethods(NotificationsController.prototype, this);
	}

    async createNotification(request: FastifyRequest< { Body: INotification }>, reply: FastifyReply) {
        const notification = request.body;

        // Validate notification
        const validation = await INotificationValidator.safeParseAsync(notification);
        
        if (!validation.success) {
            reply.code(HttpStatus.BAD_REQUEST).send({
                statusCode: HttpStatus.BAD_REQUEST,
                error: "Bad Request",
                message: "Invalid notification",
                errors: validation.error.errors,
            });
        }

        return this.service.createNotification(notification);
    }

    async deleteNotification(request: FastifyRequest<{ Params: { id: string } }>) {
        const id = request.params.id;
        return this.service.deleteNotification(id);
    }
}

export default NotificationsController;