import { z } from '@hono/zod-openapi';
import { Attendance, Event, FormResponse, Member, User } from '@repo/db';

export type TypeToZod<T> = Required<{
	[K in keyof T]: T[K] extends Date
		? z.ZodString
		: T[K] extends string | number | boolean | null | undefined
			? undefined extends T[K]
				? z.ZodDefault<z.ZodType<Exclude<T[K], undefined>>>
				: z.ZodType<T[K]>
			: z.ZodObject<TypeToZod<T[K]>>;
}>;
export const createZodObject = <T>(obj: TypeToZod<T>) => {
	return z.object(obj);
};

type AnyObj = Record<PropertyKey, unknown>;

// Adjust ZodObj to handle Date types, mapping them to ZodString
type ZodObj<T extends AnyObj> = {
	[key in keyof T]: T[key] extends Date
		? z.ZodString // Map Date to ZodString
		: z.ZodType<T[key]>;
};

// zObject function remains the same
const zObject = <T extends AnyObj>(arg: ZodObj<T>) => z.object(arg);

export const zodOpenAPIUnauthorized = z.object({
	code: z.number().openapi({
		example: 401
	}),
	message: z.string().openapi({
		example: 'Unauthorized'
	})
});

export const zodOpenAPIEvent = zObject<Event>({
	id: z.string().openapi({
		example: 'evt_SP6prmGnMzt5spsr'
	}),
	name: z.string().openapi({
		example: 'Example Event'
	}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString(),
		format: 'date-time'
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	description: z.string().openapi({
		example: 'Description of Example Event'
	}),
	orgId: z.string().openapi({
		example: 'org_01HPCN28VR5FQ87N9P4MWXJTHQ'
	}),
	formId: z.string().openapi({
		example: 'form_ZLLS9w1V6ioZq7rk'
	}),
	start: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	end: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	image: z.string().openapi({
		example: 'https://ucarecdn.com/7b2c6de8-a255-4cf6-aee3-1c788fd59135/'
	})
});

export const zodOpenAPIMember = zObject<Member>({
	id: z.string().openapi({
		example: 'om_01HPCN296XBAKD6QYVKNMARD4N'
	}),
	role: z.union([z.literal('ADMIN'), z.literal('MEMBER'), z.literal('OWNER')]),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	userId: z.string().openapi({
		example: 'user_01HPK4QTN24PB9NFRB2WWDBKZP'
	}),
	orgId: z.string().openapi({
		example: 'org_01HPCN28VR5FQ87N9P4MWXJTHQ'
	}),
	additionalInfoId: z.string().openapi({
		example: 'form_ZLLS9w1V6ioZq7rk'
	})
});

export const zodOpenAPIUser = zObject<User>({
	id: z.string().openapi({
		example: 'user_01HPK4QTN24PB9NFRB2WWDBKZP'
	}),
	firstName: z.string().openapi({
		example: 'John'
	}),
	lastName: z.string().openapi({
		example: 'Doe'
	}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	email: z.string().openapi({
		example: 'johndoe@gmail.com'
	}),
	emailVerified: z.boolean().openapi({
		example: true
	}),
	profilePictureUrl: z.string().openapi({
		example: 'https://ucarecdn.com/7b2c6de8-a255-4cf6-aee3-1c788fd59135/'
	})
});

export const zodOpenAPIFormResponse = zObject<FormResponse>({
	id: z.string().openapi({
		example: 'resp_1mZkU4DxRvEWJ2dT'
	}),
	formId: z.string().openapi({
		example: 'form_FDCxyzsw9oBrkEBZ'
	}),
	response: z.record(z.string()).openapi({
		example: {
			name: 'Happt'
		}
	}),
	memId: z.string().openapi({
		example: 'om_01HPCN296XBAKD6QYVKNMARD4N'
	}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	})
});

export const zodOpenAPIAttendance = zObject<Attendance>({
	id: z.string().openapi({
		example: 'atnd_j9Ubudy7YpRd1od3'
	}),
	memId: z.string().openapi({
		example: 'om_01HPCN296XBAKD6QYVKNMARD4N'
	}),
	eventId: z.string().openapi({
		example: 'evt_SP6prmGnMzt5spsr'
	}),
	createdAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	updatedAt: z.coerce.string().openapi({
		example: new Date().toISOString()
	}),
	responseId: z.string().nullable().openapi({
		example: 'resp_6eLeCr7epn7b8Uhe'
	})
});
