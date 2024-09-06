/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import * as turf from "@turf/turf";
import { Feature, Polygon, MultiPolygon, Position, LineString } from 'geojson';
import { IPattern } from '@/models/pattern';
import HttpException from './http-exception';
import HttpStatus from './http-status';
import ShapeService from '@/services/shape.service';

/**
 * Binds all methods of a prototype to an instance.
 *
 * @param prototype The prototype to bind.
 * @param instance The instance to bind the methods to.
 */
export function bindMethods<T extends object>(prototype: T, instance: T): void {
	// Get all methods of the prototype
	// Filter out constructor and any other methods that are not functions
	const methods = Object.getOwnPropertyNames(prototype).filter(
		(method): method is string => typeof method === 'string' && method !== 'constructor',
	);

	// Bind each method to the instance
	methods.forEach((method) => {
		const boundMethod = (instance[method as keyof T] as unknown as (...args: unknown[]) => unknown).bind(instance);
		instance[method as keyof T] = boundMethod as T[keyof T];
	});
}

/**
 * Appends methods to a prototype.
 *
 * @param prototype The prototype to append the methods to.
 * @param methods The methods to append.
*/
export function appendMethods<T extends object>(prototype: T, methods: Record<string, (...args: unknown[]) => unknown>): T {
	// Get all methods of the prototype
	// Filter out constructor and any other methods that are not functions
	const prototypeMethods = Object.getOwnPropertyNames(prototype).filter(
		(method): method is string => typeof method === 'string' && method !== 'constructor',
	);

	// Append each method to the prototype
	prototypeMethods.forEach((method) => {
		(prototype as Record<string, unknown>)[method] = methods[method];
	});

	return prototype;
}

/**
 * Generates JWT token
 *
 * @param payload The payload to encode in the token
 * @param expiresIn The expiration time of the token in seconds
 * @returns The encoded token
 */
export function generateJWT(payload: Record<string, any>, expiresIn: number | string = '5m'): string {
	const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
		algorithm: 'HS256',
		expiresIn,
	});

	return token;
}

/**
 * Verifies a JWT token
 *
 * @param token The token to verify
 * @returns The decoded token
 */
export async function verifyJWT<T = Record<string, any>>(token: string) : Promise<T | null> {
	try {
		return jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: ['HS256'] }) as T;
	} catch (error) {
		console.error('Error verifying JWT:', error);
		return null;
	}
}

/**
 * Speed-Time Distance Calculator
 * @param minutes The number of minutes
 * @param speed The number of km/h
 * @returns The number of meters
 */
export function speedTimeDistanceCalculator(time: number, speed: number): number {
    // Convert speed from km/h to m/s
    const speedInMetersPerSecond = speed / 3.6;
    
    // Convert time from minutes to seconds
    const timeInSeconds = time * 60;
    
    // Calculate distance in meters
    const distanceInMeters = speedInMetersPerSecond * timeInSeconds;
    
    return distanceInMeters;
}

/**
 * Calculates the GeoFence Path from a distance the stop selected
 * @param pattern The pattern to calculate the GeoFence
 * @param stopId The stop id to calculate the GeoFence
 * @param notificationDistance The distance to calculate the GeoFence
 */
export async function calculateGeoFence(pattern: IPattern, stopId: string, notificationDistance: number) : Promise<Feature<Polygon | MultiPolygon, any>> {
	const distanceBuffer = notificationDistance

	//Find Stop in pattern
	const stop = pattern.path.find(path => path.stop.id === stopId);

	if(!stop) throw new HttpException(HttpStatus.NOT_FOUND, `Stop ${stopId} not found in pattern ${pattern.pattern_id}`);
	if(stop.stop_sequence <= 1) throw new HttpException(HttpStatus.BAD_REQUEST, `Stop ${stopId} is the first stop in pattern ${pattern.pattern_id}`);

	//Find shape in pattern
	const shape = await ShapeService.getInstance().getShape(pattern.shape_id);
	if(!shape) throw new HttpException(HttpStatus.NOT_FOUND, `Shape ${pattern.shape_id} not found`);

	const shapeCoordinates = shape.geojson;
	const shapeTurf = turf.lineChunk(shapeCoordinates, 10, { units: 'meters' });

	//Merge all shapeTurf Features into 1 LineString
	const coordinates: Position[] = [];
	shapeTurf.features.forEach((feature: Feature<LineString>) => {
		coordinates.push(...feature.geometry.coordinates);
	});

	const feature = turf.lineString(coordinates);

	const nearestPointOnLine = turf.nearestPointOnLine(feature, turf.point([Number(stop.stop.lon), Number(stop.stop.lat)]));
	
	const split = turf.lineSplit(feature, nearestPointOnLine);
	const stopDistance = turf.length(split.features[0], { units: 'kilometers' });
	const lineSliceAlong = turf.lineSliceAlong(split.features[0], stopDistance - distanceBuffer, stopDistance, { units: 'kilometers' });

	return turf.buffer(lineSliceAlong, 20, { units: 'meters' })!
}