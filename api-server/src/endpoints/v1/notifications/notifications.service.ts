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

    
    /**
     * Creates a new notification for a user
     * @param notification The notification object containing user preferences
     * @returns The created notification data including the calculated geofence
     * @throws HttpException if pattern/stop not found or other errors occur
     */
    async createNotification(notification: INotification) : Promise<any> {
        try {
            const pattern = await this.patternService.getPattern(notification.pattern_id);
            const geoFence = await calculateGeoFence(pattern[0], notification.stop_id, notification.distance);
        
            const notificationData = {
                user_id: notification.user_id,
                id: notification.id,
                pattern_id: notification.pattern_id,
                stop_id: notification.stop_id,
                distance: notification.distance,
                start_time: notification.start_time,
                end_time: notification.end_time,
                week_days: notification.week_days,
                geojson: geoFence,
            };

            //Delete all notifications for this user_id:notification_id
            const keys = await this.redisService.keys(`notification:*:${notification.user_id}:${notification.id}`);
            keys.length && await this.redisService.del(keys);

            // Set notifications for in redis
            const promises = notification.week_days.map(async weekDay => {
                const key = `notification:${weekDay}:${notification.start_time}:${notification.end_time}:${notification.user_id}:${notification.id}`;
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

    /**
     * Deletes all notifications for a given notification ID
     * @param id The notification ID to delete
     * @throws HttpException if there is an error deleting the notifications
     */
    async deleteNotification(id: string) : Promise<void> {
        try {
            const keys = await this.redisService.keys(`notification:*:${id}`);
            keys.length && await this.redisService.del(keys); 
        } catch (error: any) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
        }
    }

    /**
     * Retrieves all notifications for a given user ID
     * @param userId The user ID to retrieve notifications for
     * @returns An array of notification objects
     * @throws HttpException if there is an error retrieving the notifications
     */
    async getNotificationsByUserId(userId: string) : Promise<any> {
        try {
            const keys = await this.redisService.keys(`notification:*:${userId}`);
            const notifications = await Promise.all(keys.map(async key => {
                const notification = await this.redisService.get(key);
                return notification ? JSON.parse(notification) : null;
            }));
            return notifications;
        } catch (error: any) {
            throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, error.message);
        }
    }
}

export default NotificationsService;