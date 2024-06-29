import { z } from 'zod';
import { adminProcedure, router } from '..';
import { ZodCustomForm, type CustomForm } from '$lib/types/forms';
import schema from '@repo/db/schema';
import { dummyClient } from '$lib/server/posthog';
import { TRPCError } from '@trpc/server';
import db from '$lib/server/db';
import { and, desc, eq, getTableColumns, type OrgForm } from '@repo/db';
import type { ArrayElement } from '$lib/types/misc';

const duplicateKey = (array: CustomForm) => {
	const seenIds = new Set();
	for (const item of array) {
		if (seenIds.has(item.label)) {
			return item.label; // Duplicate found
		}
		seenIds.add(item.label);
	}
	return undefined;
};

export const formRouter = router({
	getForm: adminProcedure.input(z.object({ formId: z.string() })).query(async ({ input }) => {
		const form = await db.query.organizationForm.findFirst({
			where: eq(schema.organizationForm.id, input.formId)
		});

		if (!form) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Form not Found'
			});
		}

		return { form };
	}),
	getFormResponses: adminProcedure
		.input(
			z.object({
				formId: z.string(),
				eventId: z.string().nullish(),
				memberId: z.string().nullish()
			})
		)
		.query(async ({ input }) => {
			const eventId = input.eventId;
			const memId = input.memberId;
			const { createdAt, updatedAt, emailVerified, ...userFields } = getTableColumns(schema.user);
			let query = db
				.select({
					user: userFields,
					formResponse: getTableColumns(schema.formResponse),
					form: getTableColumns(schema.organizationForm),
					memId: getTableColumns(schema.member).id
				})
				.from(schema.organizationForm)
				.innerJoin(schema.formResponse, eq(schema.formResponse.formId, schema.organizationForm.id))
				.innerJoin(schema.member, eq(schema.formResponse.memId, schema.member.id))
				.innerJoin(schema.user, eq(schema.member.userId, schema.user.id))
				.where(
					and(
						eq(schema.formResponse.formId, input.formId),
						eventId ? eq(schema.event.id, eventId) : undefined,
						memId ? eq(schema.member.id, memId) : undefined
					)
				)
				.orderBy(desc(schema.formResponse.createdAt));
			if (eventId) {
				query
					.innerJoin(schema.attendance, eq(schema.attendance.responseId, schema.formResponse.id))
					.innerJoin(schema.event, eq(schema.event.id, schema.attendance.eventId));
			}
			const rows = await query;

			const newMerged = rows
				.filter((row) => !!row.user && !!row.memId && !!row.formResponse)
				.map((row) => {
					if (row.user && row.formResponse && row.memId) {
						return {
							form: row.form,
							formResponse: {
								...row.formResponse,
								member: {
									user: row.user
								}
							}
						};
					} else {
						throw new TRPCError({
							code: 'INTERNAL_SERVER_ERROR',
							message: 'Our Bad. Some DB Issue Happened'
						});
					}
				});

			console.log(newMerged);

			const newForm = newMerged.reduce<
				(OrgForm & { responses: ArrayElement<typeof newMerged>['formResponse'][] }) | undefined
			>((acc, row) => {
				const form = row.form;
				const response = row.formResponse;
				if (!acc) {
					acc = { ...form, responses: [response] };
				} else if (response) {
					acc.responses.push(response);
				}
				return acc;
			}, undefined);

			console.log('NEW FORM', newForm);

			return { form: newForm };
		}),
	getForms: adminProcedure.query(async ({ input }) => {
		const forms = await db.query.organizationForm.findMany({
			where: eq(schema.organizationForm.orgId, input.orgId),
			columns: {
				id: true,
				name: true,
				updatedAt: true,
				createdAt: true
			},
			with: {
				responses: {
					limit: 1
				}
			},
			orderBy: (form, { desc }) => [desc(form.updatedAt)]
		});

		return { forms };
	}),
	createForm: adminProcedure
		.input(
			z.object({
				form: ZodCustomForm,
				formName: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const duplicate = duplicateKey(input.form);

			if (duplicate) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Duplicate Label (${duplicate})`
				});
			}

			const orgForm = await db.insert(schema.organizationForm).values({
				orgId: input.orgId,
				form: input.form,
				name: input.formName
			});

			if (ctx.event.locals.user) {
				const useragent = ctx.event.request.headers.get('user-agent');
				dummyClient.capture({
					distinctId: ctx.event.locals.user.id,
					event: 'form created',
					properties: {
						$ip: ctx.event.getClientAddress(),
						name: input.formName,
						orgId: input.orgId,
						...(useragent && { $useragent: useragent })
					}
				});
			}

			ctx.event.platform?.context.waitUntil(dummyClient.flushAsync());

			return orgForm;
		}),
	updateForm: adminProcedure
		.input(
			z.object({
				form: ZodCustomForm,
				formId: z.string(),
				formName: z.string()
			})
		)
		.mutation(async ({ input, ctx }) => {
			const duplicate = duplicateKey(input.form);

			if (duplicate) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Duplicate Label (${duplicate})`
				});
			}

			const response = await db.query.formResponse.findFirst({
				where: eq(schema.formResponse.formId, input.formId)
			});

			if (response) {
				throw new TRPCError({
					code: 'CONFLICT',
					message: 'Form already has responses'
				});
			}
			const orgForm = await db
				.update(schema.organizationForm)
				.set({
					orgId: input.orgId,
					form: input.form,
					name: input.formName,
					updatedAt: new Date()
				})
				.where(eq(schema.organizationForm.id, input.formId));

			if (ctx.event.locals.user) {
				const useragent = ctx.event.request.headers.get('user-agent');
				dummyClient.capture({
					distinctId: ctx.event.locals.user.id,
					event: 'form updated',
					properties: {
						$ip: ctx.event.getClientAddress(),
						name: input.formName,
						orgId: input.orgId,
						...(useragent && { $useragent: useragent })
					}
				});
			}

			ctx.event.platform?.context.waitUntil(Promise.resolve(dummyClient.flushAsync()));
			return orgForm;
		})
});
