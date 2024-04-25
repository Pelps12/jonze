import { SVIX_TOKEN } from '$env/static/private';
import { Svix } from 'svix';

const svix = new Svix(SVIX_TOKEN);

export default svix;
