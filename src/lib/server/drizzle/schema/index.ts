import { attendance } from './attendance';
import * as event from './event';
import { formResponse } from './formResponse';
import { member } from './member';
import { organization } from './organization';
import { organizationForm } from './organizationForm';

import * as user from './user';

const schema = {
	...attendance,
	...event,
	...formResponse,
	...member,
	...organization,
	...organizationForm,
	...user
};

export default schema;
