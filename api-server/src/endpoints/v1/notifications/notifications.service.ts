import HttpException from "@/common/http-exception";
import HttpStatus from "@/common/http-status";
import { INotification } from "@/models/notification";
import RedisService from "@/services/redis.service";
import StopsService from "@/services/stops.service";
import * as turf from "@turf/turf";

class NotificationsService {
    private readonly redisService: RedisService
    private readonly stopsService: StopsService

    constructor(){
        this.redisService = RedisService.getInstance();
        this.stopsService = StopsService.getInstance();
    }

    async createNotification(userId: string, notification: INotification) : Promise<any> {
        try {
            const stop = await this.stopsService.getStop(notification.stop_id);

            const geoPoint = turf.point([Number(stop.lat), Number(stop.lon)]);  
            const geoFence = turf.buffer(geoPoint, notification.distance, { units: notification.distance_unit });

            const notificationData = {
                id: notification.id,
                line_id: notification.line_id,
                stop_id: notification.stop_id,
                distance: notification.distance,
                distance_unit: notification.distance_unit,
                start_time: notification.start_time,
                end_time: notification.end_time,
                week_days: notification.week_days,
                geo_fence: geoFence,
            };

            // Set notifications for in redis
            const promises = notification.week_days.map(async weekDay => {
                const key = `notification:${weekDay}:${notification.start_time}:${notification.end_time}:${userId}:${notification.id}`;
                return this.redisService.set(key, JSON.stringify(notificationData));
            });
            await Promise.all(promises);

            return notificationData;
        } catch (error: any) {
            if (error.statusCode === HttpStatus.NOT_FOUND) {
                throw new HttpException(HttpStatus.NOT_FOUND, `Stop ${notification.stop_id} not found`);
            }

            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
        }
    }

    async deleteNotification(id: string) : Promise<void> {
        try {
            await this.redisService.del(`notification:${id}`);
        } catch (error: any) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
        }
    }
}

export default NotificationsService;