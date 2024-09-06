package utils

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

/**
 * Finds Redis keys that match the pattern "notification:*" and checks if a number is within a range defined by the key.
 * @param variableNumber The number to compare against the ranges defined in the keys.
 * @param weekDay The current week day.
 * @returns A promise that resolves to an array of matching keys.
 */
func FindKeysInRange(client *redis.Client, weekDay string, variableNumber int) ([]string, error) {
	var (
		cursor uint64
		keys   []string
	)
	pattern := fmt.Sprintf("notification:%s:*", weekDay)
	for {
		var err error
		var scanKeys []string
		scanKeys, cursor, err = client.Scan(context.Background(), cursor, pattern, 100).Result()
		if err != nil {
			return nil, err
		}

		for _, key := range scanKeys {
			parts := strings.Split(key, ":")
			if len(parts) < 4 {
				continue
			}

			firstNumber, err1 := strconv.Atoi(parts[2])
			secondNumber, err2 := strconv.Atoi(parts[3])

			if err1 != nil || err2 != nil {
				continue
			}

			if firstNumber <= variableNumber && variableNumber <= secondNumber {
				keys = append(keys, key)
			}
		}

		if cursor == 0 {
			break
		}
	}
	return keys, nil
}

/**
 * Clears all keys matching a given pattern in Redis.
 * @param pattern The pattern to match keys (e.g., "notification:*").
 */
func ClearCollectionByPattern(client *redis.Client, pattern string) error {
	var cursor uint64
	for {
		keys, nextCursor, err := client.Scan(context.Background(), cursor, pattern, 100).Result()
		if err != nil {
			return err
		}

		if len(keys) > 0 {
			if err := client.Del(context.Background(), keys...).Err(); err != nil {
				return err
			}
		}

		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}
	
	return nil
}

/**
 * Gets the current second in the day.
 * @returns The current second in the day.
 */
func GetCurrentSecondInDay() int {
	now := time.Now()
	return now.Hour()*3600 + now.Minute()*60 + now.Second()
}

/**
 * Gets the current week day.
 * @returns The current week day.
 */
func GetCurrentWeekDay() string {
	now := time.Now()
	weekday := now.Weekday()
	return strings.ToLower(weekday.String())
}

/**
 * Replaces a prefix in a string.
 * @param key The string to replace the prefix in.
 * @param oldPrefix The old prefix to replace.
 * @param newPrefix The new prefix to replace the old prefix with.
 * @returns The string with the replaced prefix.
 */
func ReplacePrefix(key, oldPrefix, newPrefix string) string {
	return strings.Replace(key, oldPrefix, newPrefix, 1)
}
