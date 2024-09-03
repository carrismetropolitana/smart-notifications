package services

import (
	"encoding/json"
	"fmt"
	"notifications-service/internal/utils"
	"notifications-service/models"
	"sync"
	"time"
)

func NotificationsService( redisService *RedisService, vehiclesHashMap *map[string]models.Vehicle){
	ticker := time.NewTicker(10 * time.Second)   
	defer ticker.Stop()
		
	notificationService(redisService, vehiclesHashMap) // Run immediately notificationService

	// This loop runs every time the ticker ticks
	for range ticker.C {
		notificationService(redisService, vehiclesHashMap) // Call the function to execute cron jobs
	}
}

func notificationService(RedisService *RedisService, vehiclesHashMap *map[string]models.Vehicle) {

	fmt.Println("⤷ Checking for notifications")

	// If the vehicles hashmap is empty, return
	if(len(*vehiclesHashMap) == 0){
		fmt.Println("Vehicles hashmap is empty")
		return
	}

	getNotifications(RedisService)
	notifications, err := getNotifications(RedisService)
	if err != nil {
		fmt.Printf("Error getting notifications: %v\n", err)
		return
	}

	// Create Go routines to process each notification concurrently
	var wg sync.WaitGroup
	errChan := make(chan error, len(notifications))

	for _, notification := range notifications {
		wg.Add(1)

		go func(notification models.Notification) {
			defer wg.Done()                    // Decrement the counter when the goroutine completes
			vehicle, ok := (*vehiclesHashMap)[notification.PatternId]
			if !ok {
				// fmt.Printf("Vehicle with PatternId %s not found\n", notification.PatternId)
				return
			}

			// Define a point and a polygon
			point := models.Point{X: vehicle.Lon, Y: vehicle.Lat}
			polygon := []models.Point{}
			for _, coordinate := range notification.GeoJSON.Geometry.Coordinates[0] {
				polygon = append(polygon, models.Point{X: coordinate[0], Y: coordinate[1]})
			}

			//Check if the bus is in the radius of stop
			if utils.PointInPolygon(point, polygon) {
				fmt.Printf("Bus %s is in a radius of %v %s Stop %s\n", vehicle.Id, notification.Distance, notification.DistanceUnit ,notification.StopId)
			}
		}(notification)
	}

	wg.Wait()      // Wait for all goroutines to complete
	close(errChan) // Close the error channel as no more errors will be sent
}

func getNotifications(redisService *RedisService) ([]models.Notification, error) {
	notifications := []models.Notification{}

	// Get Notifications from redis processed:*
	values, err := redisService.MGetPattern("processed:*")
	if err != nil {
		fmt.Printf("Error getting notifications from redis: %v\n", err)
		return notifications, err
	}

	//Cast values to Notification
	for _, value := range values {
		notificationWrapper := struct {
			Data models.Notification `json:"data"`
		}{}

		err = json.Unmarshal([]byte(value.(string)), &notificationWrapper)
		if err != nil {
			fmt.Printf("Error unmarshalling notification: %v\n", err)
			return notifications, err
		}

		notifications = append(notifications, notificationWrapper.Data)
	}

	return notifications, nil
}