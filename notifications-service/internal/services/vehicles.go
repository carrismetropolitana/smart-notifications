/**
 * Gets vehicles from API and stores vehicles in a hashmap.
 * The hashmap is used to retrieve vehicles by ID.
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

/**
 * Loop that runs every 9 seconds to get vehicles from API and store them in a hashmap.
 * The hashmap is used to retrieve vehicles by pattern Id.
 */
func GetVehiclesHashMap(myHashMap *map[string]models.Vehicle) {
	ticker := time.NewTicker(9 * time.Second)   
	defer ticker.Stop()                        // Ensures that the ticker vehicles when the function exits to free up resources
	
	//Run first time
	hashmap, err := getVehiclesHashMap()
	if err != nil {
		log.Println(err)
	}
	
	*myHashMap = hashmap

	// This loop runs every time the ticker ticks
	for range ticker.C {
	hashmap, err := getVehiclesHashMap() // Call the function to execute cron jobs\
	if err != nil {
		log.Println(err)
	}

	*myHashMap = hashmap
	}
}

/**
  * Gets vehicles from API and stores vehicles in a hashmap.
  * The hashmap is used to retrieve vehicles by pattern Id.
*/
func getVehiclesHashMap() (map[string]models.Vehicle, error) {
	vehicles, err := getVehicles()
	if err != nil {
		return nil, err
	}

	// Create a new map to store the vehicles by ID
	vehicleHashMap := make(map[string]models.Vehicle)
	for _, vehicle := range vehicles {
	vehicleHashMap[vehicle.PatternId] = vehicle
	}

	return vehicleHashMap, nil
}
 
/**
  * Gets vehicles from API
*/
func getVehicles() ([]models.Vehicle, error) {
	vehicles := []models.Vehicle{}

	// Make a GET request to the URL
	url :=  os.Getenv("API_URL") + "/vehicles"
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	// Check the status code of the response
	if resp.StatusCode != http.StatusOK {
	return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Decode the response body into a slice of Vehicles
	err = json.NewDecoder(resp.Body).Decode(&vehicles)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close() // Close the response body

	return vehicles, nil
}