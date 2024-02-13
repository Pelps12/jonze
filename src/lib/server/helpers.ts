import { JWT_SECRET_KEY } from '$env/static/private';
import { SignJWT } from 'jose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signJWT(payload: Record<string, any>) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
		.setIssuedAt()
		.setExpirationTime('1d')
		.sign(new Uint8Array(Buffer.from(JWT_SECRET_KEY, 'base64')));
}
