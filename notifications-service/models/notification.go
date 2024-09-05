package models

type Notification struct {
	Id          string `json:"id"`
	PatternId   string `json:"pattern_id"`
	StopId      string `json:"stop_id"`
	Distance    float32 `json:"distance"`
	DistanceUnit string `json:"distance_unit"`
	StartTime   int64 `json:"start_time"`
	EndTime     int64 `json:"end_time"`
	WeekDays    []string `json:"week_days"`
	GeoJSON     GeoJSON `json:"geojson"`
}