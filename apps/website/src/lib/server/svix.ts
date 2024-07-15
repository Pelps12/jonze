import { SVIX_TOKEN } from '$env/static/private';
import { WrapperSvix } from '@repo/webhooks';

const svix = new WrapperSvix(SVIX_TOKEN);

export default svix;
