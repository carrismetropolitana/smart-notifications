import HttpException from "@/common/http-exception";
import HttpStatus from "@/common/http-status";
import { calculateGeoFence } from "@/common/utils";
import { INotification } from "@/models/notification";
import PatternService from "@/services/pattern.service";
import RedisService from "@/services/redis.service";
import StopsService from "@/services/stops.service";


class NotificationsService {
    private readonly redisService: RedisService
    private readonly stopsService: StopsService
    private readonly patternService: PatternService

    constructor(){
        this.redisService = RedisService.getInstance();
        this.stopsService = StopsService.getInstance();
        this.patternService = PatternService.getInstance();
    }

    async createNotification(userId: string, notification: INotification) : Promise<any> {
        try {
            const pattern = await this.patternService.getPattern(notification.pattern_id);
            const geoFence = await calculateGeoFence(pattern[0], notification.stop_id, notification.distance);
        
            const notificationData = {
                id: notification.id,
                pattern_id: notification.pattern_id,
                stop_id: notification.stop_id,
                distance: notification.distance,
                start_time: notification.start_time,
                end_time: notification.end_time,
                week_days: notification.week_days,
                geojson: geoFence,
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