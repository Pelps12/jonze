import * as apiKey from './apikey';
import * as attendance from './attendance';
import * as event from './event';
import * as formResponse from './formResponse';
import * as member from './member';
import * as membership from './membership';
import * as organization from './organization';
import * as organizationForm from './organizationForm';
import * as plan from './plan';
import * as user from './user';

const schema = {
	...apiKey,
	...attendance,
	...event,
	...formResponse,
	...member,
	...membership,
	...plan,
	...organization,
	...organizationForm,
	...user
};

export default schema;
