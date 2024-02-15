import { PUBLIC_UPLODCARE_SECRET_KEY } from '$env/static/public';
import { UploadClient } from '@uploadcare/upload-client';

export const client = new UploadClient({ publicKey: PUBLIC_UPLODCARE_SECRET_KEY });
