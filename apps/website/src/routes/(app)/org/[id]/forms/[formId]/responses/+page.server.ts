import db from '$lib/server/db';
import type { PageServerLoad } from './$types';
import schema from '@repo/db/schema';
import {
	getTableColumns,
	eq,
	and,
	type FormResponse,
	type User,
	type OrgForm,
	desc
} from '@repo/db';
import { error } from '@sveltejs/kit';
import type { ArrayElement } from '$lib/types/misc';

export const load: PageServerLoad = async ({ params, url }) => {
	const eventId = url.searchParams.get('eventId');
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
				eq(schema.formResponse.formId, params.formId),
				eventId ? eq(schema.event.id, eventId) : undefined
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
				error(500, 'Our Bad. Some DB Issue Happened');
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
	const form = await db.query.organizationForm.findFirst({
		where: eq(schema.organizationForm.id, params.formId),
		with: {
			responses: {
				with: {
					member: {
						with: {
							user: {
								columns: {
									id: true,
									firstName: true,
									lastName: true,
									email: true,
									profilePictureUrl: true
								}
							}
						}
					}
				}
			}
		}
	});

	if (!form) {
		error(404, 'Form Not Found');
	}

	return { form: newForm };
};
