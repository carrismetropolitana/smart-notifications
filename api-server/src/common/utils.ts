/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';

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