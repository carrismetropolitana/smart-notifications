package services

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type RedisService struct {
	client *redis.Client
}

/**
 * Creates a new RedisService instance.
 * @param url The Redis URL.
 * @returns A new RedisService instance.
 */
func NewRedisService(url string) *RedisService {
	options, err := redis.ParseURL(url)
	if err != nil {
		panic(err)
	}
	client := redis.NewClient(options)
	return &RedisService{client: client}
}

/**
 * Connects to Redis.
 * @returns A promise that resolves to the result of the operation.
 */
func (r *RedisService) Connect() error {
	err := r.client.Ping(context.Background()).Err()
	if err == nil {
		fmt.Println("⤷ Connected to Redis.")
	}
	return err
}

/**
 * Disconnects from Redis.
 */
func (r *RedisService) Disconnect() {
	if err := r.client.Close(); err != nil {
		fmt.Printf("⤷ ERROR: Failed to disconnect from Redis: %v\n", err)
	} else {
		fmt.Println("⤷ Disconnected from Redis.")
	}
}

/**
 * Sets a value in Redis.
 * @param key The key to set the value for.
 * @param value The value to set.
 * @returns A promise that resolves to the result of the operation.
 */
func (r *RedisService) Set(key, value string) error {
	return r.client.Set(context.Background(), key, value, 0).Err()
}

/**
 * Gets a value from Redis.
 * @param key The key to get the value for.
 * @returns A promise that resolves to the result of the operation.
 */
func (r *RedisService) Get(key string) (string, error) {
	return r.client.Get(context.Background(), key).Result()
}

/**
 * Deletes one or more keys from Redis.
 * @param keys The keys to delete.
 * @returns A promise that resolves to the result of the operation.
 */
func (r *RedisService) Del(keys ...string) error {
	return r.client.Del(context.Background(), keys...).Err()
}

/**
 * Returns the Redis client.
 * @returns The Redis client.
 */
func (r *RedisService) Client() *redis.Client {
	return r.client
}
