import { CronJob } from "cron";
import RedisService from "./services/redis.service";
import { getCurrentSecondInDay, findKeysInRange, clearCollectionByPattern, getCurrentWeekDay } from "./utils";

const redisService = new RedisService({ url: process.env.REDIS_URL as string });
redisService.connect();


/**
 * Cron job that runs every 5 minutes to process notifications.
 * It finds keys in Redis matching the pattern "notification:*"
 * and checks if the current second of the day is within the range defined by the key.
 * 
 * If a key is found, it retrieves the data associated with it and creates a new key with the prefix "processed:".
 * The new key is then set in Redis with the data retrieved from the original key.
 */
new CronJob(
	// Every 10 seconds
	'*/10 * * * * *',
	async () => {
		const timer = new Date().getTime();
        // Get Keys that are in time range
		const currentSecond = getCurrentSecondInDay();
		const weekDay = getCurrentWeekDay();
		const matchingKeys = await findKeysInRange(
			redisService.clientInstance,
			weekDay,
			currentSecond
		);

		//Delete all processed keys
		await clearCollectionByPattern(
			redisService.clientInstance,
			'processed:*'
		);

        // Add Processed keys to new redis collection
		if (matchingKeys.length > 0) {
			for (const key of matchingKeys) {
				const data = await redisService.get(key);
				if (!data) continue;

				const newKey = key.replace('notification', 'processed');
				redisService.set(newKey, data);
			}
		}

		console.log(`⤷ Filtering completed in ${new Date().getTime() - timer}ms`);
	},
	null, // On complete
	true, // Start the job immediately
	'Europe/Lisbon' // Timezone
);
