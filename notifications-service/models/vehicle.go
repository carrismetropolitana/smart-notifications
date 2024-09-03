package models

type Vehicle struct {
	Id          string `json:"id"`
	Lat         float64 `json:"lat"`
	Lon         float64 `json:"lon"`
	LineId      string `json:"line_id"`
	RouteId     string `json:"route_id"`
	PatternId   string `json:"pattern_id"`
	ShiftId     string `json:"shift_id"`
	StopId      string `json:"stop_id"`
	TripId      string `json:"trip_id"`
	Timestamp   int64 `json:"timestamp"`
	Bearing     int16 `json:"bearing"`
	Speed       float32 `json:"speed"`
	CurrentStatus string `json:"current_status"`
	BlockId     string `json:"block_id"`
}