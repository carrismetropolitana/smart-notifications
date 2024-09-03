package main

import (
	"log"
	"notifications-service/internal/services"
	"notifications-service/models"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file")
	}

	// ENV Variables
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

	var vehiclesHashMap = make(map[string]models.Vehicle)

	// Start the GetVehiclesHashMap function in goroutine
	go services.GetVehiclesHashMap(&vehiclesHashMap)

	// Start the NotificationsService function in main thread
	services.NotificationsService(redisService, &vehiclesHashMap)
}
