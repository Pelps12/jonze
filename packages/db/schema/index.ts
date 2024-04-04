import * as apiKey from './apikey';
import * as attendance from './attendance';
import * as event from './event';
import * as customer from './customer';
import * as formResponse from './formResponse';
import * as member from './member';
import * as membership from './membership';
import * as organization from './organization';
import * as organizationForm from './organizationForm';
import * as organizationSubaccount from './organizationSubacount';

import * as plan from './plan';
import * as user from './user';

const schema = {
	...apiKey,
	...attendance,
	...customer,
	...event,
	...formResponse,
	...member,
	...membership,
	...plan,
	...organization,
	...organizationForm,
	...organizationSubaccount,
	...user
};

export default schema;
