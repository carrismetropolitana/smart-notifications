package main

import (
	"filter-service/internal/services"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL environment variable is not set")
	}

	redisService := services.NewRedisService(redisURL)
	err = redisService.Connect()
	if err != nil {
		log.Fatalf("Error connecting to Redis: %v", err)
		redisService.Disconnect()
	}

	services.StartCronJobs(redisService)
}
