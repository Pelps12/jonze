import { Unkey } from '@unkey/api';
import { UNKEY_ROOT_KEY } from '$env/static/private';

const unkey = new Unkey({ rootKey: UNKEY_ROOT_KEY });

export default unkey;
