package services

import (
	"filter-service/internal/utils"
	"fmt"
	"sync"
	"time"
)

// Start Cron Job
func StartCronJobs(redisService *RedisService) {
	ticker := time.NewTicker(60 * time.Second) // Creates a new ticker that ticks every 60 seconds (1 minute)
	defer ticker.Stop()                        // Ensures that the ticker stops when the function exits to free up resources

	// Run first time
	runCronJobs(redisService)

	// This loop runs every time the ticker ticks (i.e., every minute).
	for range ticker.C {
		runCronJobs(redisService) // Call the function to execute cron jobs
	}
}

/**
 * It finds keys in Redis matching the pattern "notification:*"
 * and checks if the current second of the day is within the range defined by the key.
 *
 * If a key is found, it retrieves the data associated with it and creates a new key with the prefix "processed:".
 * The new key is then set in Redis with the data retrieved from the original key.
 */
func runCronJobs(redisService *RedisService) {
	fmt.Println("⤷ Filtering started")

	timer := time.Now()
	currentSecond := utils.GetCurrentSecondInDay()
	weekDay := utils.GetCurrentWeekDay()

	// Find keys in Redis that match a certain pattern based on the current time and day.
	matchingKeys, err := utils.FindKeysInRange(redisService.Client(), weekDay, currentSecond)
	if err != nil {
		fmt.Printf("Error finding keys in range: %v\n", err)
		return
	}

	// Clear Redis keys that match the pattern "processed:*" before proceeding.
	err = utils.ClearCollectionByPattern(redisService.Client(), "processed:*")
	if err != nil {
		// If there's an error clearing the collection, print the error and return early.
		fmt.Printf("Error clearing collection: %v\n", err)
		return
	}

	// Create Go routines to process each key concurrently
	var wg sync.WaitGroup
	errChan := make(chan error, len(matchingKeys))

	// Iterate over each key found in the range.
	for _, key := range matchingKeys {
		// Increment the WaitGroup counter
		wg.Add(1)

		// Launch a goroutine to process each key concurrently
		go func(key string) {
			defer wg.Done()                    // Decrement the counter when the goroutine completes
			data, err := redisService.Get(key) // Fetch the value associated with the key from Redis
			if err != nil || data == "" {      // If there's an error or no data, simply return
				return
			}

			// Replace the prefix of the key from "notification" to "processed"
			newKey := utils.ReplacePrefix(key, "notification", "processed")
			err = redisService.Set(newKey, data) // Set the new key with the retrieved data in Redis
			if err != nil {
				// Send an error to the channel if setting the new key fails
				errChan <- fmt.Errorf("error setting key %s in Redis: %v", newKey, err)
			}
		}(key) // Pass the current key to the goroutine
	}

	wg.Wait()      // Wait for all goroutines to complete
	close(errChan) // Close the error channel as no more errors will be sent

	// Print all errors captured in the error channel
	for err := range errChan {
		fmt.Println(err)
	}

	// Print the total time taken to complete the filtering operation
	fmt.Printf("Filtering completed in %v\n", time.Since(timer))
}
