import { WorkOS } from '@workos-inc/node';
import { JWT_SECRET_KEY, WORKOS_API_KEY, WORKOS_CLIENT_ID } from '$env/static/private';
import { createRemoteJWKSet, jwtVerify } from 'jose';
const workos = new WorkOS(WORKOS_API_KEY);
export default workos;
export const clientId = WORKOS_CLIENT_ID;
import { Buffer } from 'buffer';

export async function verifyJwtToken(token: string) {
	try {
		const { payload } = await jwtVerify(
			token,
			new Uint8Array(Buffer.from(JWT_SECRET_KEY, 'base64'))
		);
		return payload;
	} catch (error) {
		return null;
	}
}

const jwksUrl = workos.userManagement.getJwksUrl(WORKOS_CLIENT_ID);
const JWKS = createRemoteJWKSet(new URL(jwksUrl));

export async function verifyAccessToken(accessToken: string) {
	try {
		const { payload } = await jwtVerify(accessToken, JWKS);
		return true;
	} catch (e) {
		console.warn('Failed to verify session:', e);
		return false;
	}
}
