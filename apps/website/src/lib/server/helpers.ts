import { JWT_SECRET_KEY, WORKOS_CLIENT_ID } from '$env/static/private';
import { SignJWT } from 'jose';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { Buffer } from 'buffer';
import workos from './workos';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signJWT(payload: Record<string, any>) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
		.setIssuedAt()
		.setExpirationTime('1d')
		.sign(new Uint8Array(Buffer.from(JWT_SECRET_KEY, 'base64')));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function objectsHaveSameKeys(...objects: any[]) {
	const allKeys = objects.reduce((keys, object) => keys.concat(Object.keys(object)), []);
	const union = new Set(allKeys);
	return objects.every((object) => union.size === Object.keys(object).length);
}
