import { IStop } from "./stop";

export interface IPatternPath {
	allow_drop_off: boolean;
	allow_pickup: boolean;
	distance_delta: number;
	distance: number;
	stop: IStop;
	stop_sequence: number;
}

export interface IPattern {
	color: string;
	direction: number;
	facilities: string[];
	headsign: string;
	pattern_id: string;
	line_id: string;
	localities: string[];
	municipalities: string[];
	path: IPatternPath[];
	route_id: string;
	shape_id: string;
	short_name: string;
	text_color: string;
	trips: string[];
	valid_on: string[];
}
