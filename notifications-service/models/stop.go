package models

type Stop struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	ShortName   string `json:"short_name"`
	LongName    string `json:"long_name"`
	Operator    string `json:"operator"`
	Address     string `json:"address"`
	Lat         string `json:"lat"`
	Lon         string `json:"lon"`
	Entrances   string `json:"entrances"`
	RegionId    string `json:"region_id"`
	RegionName  string `json:"region_name"`
	MunicipalityId string `json:"municipality_id"`
	MunicipalityName string `json:"municipality_name"`
	Facilities  []string `json:"facilities"`
	Lines       []string `json:"lines"`
	TTS         string `json:"tts_name"`
	WheelchairBoarding string `json:"wheelchair_boarding"`
}