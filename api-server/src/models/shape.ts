import { Feature, Polygon, MultiPolygon, Point, LineString } from 'geojson';

export interface IShape {
    extension: number
    id: string
    geojson: Feature<LineString>
    points: [
        {
            shape_pt_lat: number
            shape_pt_lon: number
            shape_pt_sequence: number
            shape_dist_traveled: number
        }
    ]
}