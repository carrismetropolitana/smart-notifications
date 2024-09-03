package models

type Point struct {
	X float64
	Y float64
}

// Define the Geometry struct to match the "geometry" field
type Geometry struct {
	Type        string        `json:"type"`
	Coordinates [][][]float64 `json:"coordinates"`
}

// Define the main Feature struct to match the whole JSON
type GeoJSON struct {
	Type       string                 `json:"type"`
	Properties map[string]interface{} `json:"properties"`
	Geometry   Geometry               `json:"geometry"`
}