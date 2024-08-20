import { z } from '@hono/zod-openapi';
import { Attendance, Event, FormResponse, Member, User } from '@repo/db';
import schema from '@repo/db/schema';
import { createSelectSchema } from 'drizzle-zod';

export const zodOpenAPIUnauthorized = z.object({
	code: z.number().openapi({
		example: 401
	}),
	message: z.string().openapi({
		example: 'Unauthorized'
	})
});

export const zodOpenAPISuccess = z.object({
	code: z.number().openapi({
		example: 201
	}),
	message: z.string().openapi({
		example: 'Success'
	})
});

export const zodOpenAPIEvent = createSelectSchema(schema.event, {
	id: ({ id }) =>
		id.openapi({
			example: 'evt_SP6prmGnMzt5spsr'
		}),
	name: ({ name }) =>
		name.openapi({
			example: 'Example Event'
		}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString(),
		format: 'date-time'
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	description: ({ description }) =>
		description.openapi({
			example: 'Description of Example Event'
		}),
	orgId: ({ orgId }) =>
		orgId.openapi({
			example: 'org_01HPCN28VR5FQ87N9P4MWXJTHQ'
		}),
	formId: ({ formId }) =>
		formId.openapi({
			example: 'form_ZLLS9w1V6ioZq7rk'
		}),
	start: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	end: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	tags: z
		.object({
			names: z.array(z.string())
		})
		.openapi({
			example: { names: ['#social', '#gbm', '#collab'] }
		}),
	image: ({ image }) =>
		image.openapi({
			example: 'https://ucarecdn.com/7b2c6de8-a255-4cf6-aee3-1c788fd59135/'
		})
});

export const zodOpenAPIMember = createSelectSchema(schema.member, {
	id: ({ id }) =>
		id.openapi({
			example: 'om_01HPCN296XBAKD6QYVKNMARD4N'
		}),
	role: z.union([z.literal('ADMIN'), z.literal('MEMBER'), z.literal('OWNER')]),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	userId: ({ userId }) =>
		userId.openapi({
			example: 'user_01HPK4QTN24PB9NFRB2WWDBKZP'
		}),
	orgId: ({ orgId }) =>
		orgId.openapi({
			example: 'org_01HPCN28VR5FQ87N9P4MWXJTHQ'
		}),
	additionalInfoId: ({ additionalInfoId }) =>
		additionalInfoId.openapi({
			example: 'form_ZLLS9w1V6ioZq7rk'
		})
});

export const zodOpenAPIMemberTag = createSelectSchema(schema.memberTag, {
	id: ({ id }) =>
		id.openapi({
			example: 'om_01HPCN296XBAKD6QYVKNMARD4N'
		}),

	names: z.array(z.string()).openapi({
		example: ['#active', '#family-leader', '#inactive']
	}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	})
});

export const zodOpenAPIUser = createSelectSchema(schema.user, {
	id: ({ id }) =>
		id.openapi({
			example: 'user_01HPK4QTN24PB9NFRB2WWDBKZP'
		}),
	firstName: ({ firstName }) =>
		firstName.openapi({
			example: 'John'
		}),
	lastName: ({ lastName }) =>
		lastName.openapi({
			example: 'Doe'
		}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	email: ({ email }) =>
		email.openapi({
			example: 'johndoe@gmail.com'
		}),
	emailVerified: ({ emailVerified }) =>
		emailVerified.openapi({
			example: true
		}),
	profilePictureUrl: ({ profilePictureUrl }) =>
		profilePictureUrl.openapi({
			example: 'https://ucarecdn.com/7b2c6de8-a255-4cf6-aee3-1c788fd59135/'
		})
});

export const zodOpenAPIFormResponse = createSelectSchema(schema.formResponse, {
	id: ({ id }) =>
		id.openapi({
			example: 'resp_1mZkU4DxRvEWJ2dT'
		}),
	formId: ({ formId }) =>
		formId.openapi({
			example: 'form_FDCxyzsw9oBrkEBZ'
		}),
	response: ({ response }) =>
		response.openapi({
			example: {
				name: 'Happt'
			},
			type: 'object'
		}),
	memId: ({ memId }) =>
		memId.openapi({
			example: 'om_01HPCN296XBAKD6QYVKNMARD4N'
		}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	})
});

export const zodOpenAPIForm = createSelectSchema(schema.organizationForm, {
	id: ({ id }) =>
		id.openapi({
			example: 'form_FDCxyzsw9oBrkEBZ'
		}),
	orgId: ({ orgId }) =>
		orgId.openapi({
			example: 'org_01HPCN28VR5FQ87N9P4MWXJTHQ'
		}),
	name: ({ name }) =>
		name.openapi({
			example: 'User Info'
		}),
	form: ({ form }) =>
		form.openapi({
			example: [
				{
					label: 'What org are representing?',
					type: 'text',
					placeholder: 'e.g. IEEE, ACM, ASU',
					id: 0
				},
				{
					label: 'Org Size',
					type: 'dropdown',
					id: 1,
					options: [
						{ label: 'Small (1 - 20) members' },
						{ label: 'Medium (21 - 50) members' },
						{ label: 'Large (51+) members' }
					]
				}
			],
			type: 'array'
		}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	})
});

export const zodOpenAPIAttendance = createSelectSchema(schema.attendance, {
	id: ({ id }) =>
		id.openapi({
			example: 'atnd_j9Ubudy7YpRd1od3'
		}),
	memId: ({ memId }) =>
		memId.openapi({
			example: 'om_01HPCN296XBAKD6QYVKNMARD4N'
		}),
	eventId: ({ eventId }) =>
		eventId.openapi({
			example: 'evt_SP6prmGnMzt5spsr'
		}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	responseId: ({ responseId }) =>
		responseId.openapi({
			example: 'resp_6eLeCr7epn7b8Uhe'
		})
});
