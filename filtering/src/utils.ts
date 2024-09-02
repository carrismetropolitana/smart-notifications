import { RedisClientType } from "redis";

/**
 * Finds Redis keys that match the pattern "notification:*" and checks if a number is within a range defined by the key.
 * @param variableNumber The number to compare against the ranges defined in the keys.
 * @returns A promise that resolves to an array of matching keys.
 */
export async function findKeysInRange(
	client: RedisClientType,
	variableNumber: number
): Promise<string[]> {
	const pattern = 'notification:*';
	let cursor = 0;
	const matchingKeys: string[] = [];

	do {
		// Use SCAN command to get a batch of keys matching the pattern
		const { cursor: nextCursor, keys } = await client.scan(cursor, {
			MATCH: pattern,
			COUNT: 100, // Fetch 100 keys at a time, adjust as needed
		});

		// Update the cursor
		cursor = nextCursor;

		// Filter the keys based on the range condition
		keys.forEach((key) => {
			const parts = key.split(':');
			const firstNumber = parseInt(parts[1], 10);
			const secondNumber = parseInt(parts[2], 10);

			// Check if the variable number is within the range
			if (
				firstNumber <= variableNumber &&
				variableNumber <= secondNumber
			) {
				matchingKeys.push(key);
			}
		});
	} while (cursor !== 0); // Continue scanning until cursor is 0

	return matchingKeys;
}

/**
 * Clears all keys matching a given pattern in Redis.
 * @param pattern The pattern to match keys (e.g., "notification:*").
 */
export async function clearCollectionByPattern(
	client: RedisClientType,
	pattern: string
): Promise<void> {
	let cursor = 0;

	do {
		// Scan for keys matching the pattern
		const { cursor: nextCursor, keys } = await client.scan(cursor, {
			MATCH: pattern,
			COUNT: 100, // Adjust count as needed
		});

		// Update the cursor for the next scan iteration
		cursor = nextCursor;

		// If there are matching keys, delete them
		if (keys.length > 0) {
			await client.del(keys);
		}
	} while (cursor !== 0); // Continue until scan cursor is 0

	console.log(`Cleared keys matching pattern: ${pattern}`);
}

/**
 * Gets the current second in the day.
 * @returns The current second in the day.
 */
export function getCurrentSecondInDay(): number {
	// Get the current date and time
	const now = new Date();

	// Get the current hour, minute, and second
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();

	// Calculate the total number of seconds since midnight
	const totalSeconds = hours * 3600 + minutes * 60 + seconds;

	return totalSeconds;
}