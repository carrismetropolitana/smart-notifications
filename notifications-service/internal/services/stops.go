/**
 * Gets stops from API and stores stops in a hashmap.
 * The hashmap is used to retrieve stops by ID.
 * The hashmap is updated daily.
 */
package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"notifications-service/models"
	"os"
	"time"
)

// Start Cron Job
func GetStopHashMap(myHashMap *map[string]models.Stop) {
	ticker := time.NewTicker(24 * time.Hour)   
	defer ticker.Stop()
	
	//Run first time
	hashmap, err := getStopHashMap()
	if err != nil {
		log.Println(err)
	}
	
	*myHashMap = hashmap

	// This loop runs every time the ticker ticks
	for range ticker.C {
		hashmap, err := getStopHashMap() // Call the function to execute cron jobs
		if err != nil {
			log.Println(err)
		}

		*myHashMap = hashmap
	}
}

func getStopHashMap() (map[string]models.Stop, error) {
	stops, err := getStops()
	if err != nil {
		return nil, err
	}

	// Create a new map to store the stops by ID
	stopHashMap := make(map[string]models.Stop)
	for _, stop := range stops {
		stopHashMap[stop.Id] = stop
	}

	return stopHashMap, nil
}

func getStops() ([]models.Stop, error) {
	stops := []models.Stop{}

	// Make a GET request to the URL
	url :=  os.Getenv("API_URL") + "/stops"
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	// Check the status code of the response
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Decode the response body into a slice of Stops
	err = json.NewDecoder(resp.Body).Decode(&stops)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close() // Close the response body

	return stops, nil
}