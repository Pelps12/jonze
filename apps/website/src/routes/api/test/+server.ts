import { error, json, type RequestHandler } from '@sveltejs/kit';
import members from './members.json';
import events from './events.json';
import attendance from './attendance.json';
import type { ArrayElement } from '$lib/types/misc';
import workos from '$lib/server/workos';
import db from '$lib/server/db';
import schema from '@repo/db/schema';
import { and, eq } from '@repo/db';
import { client } from '$lib/client/uploadcare';
import { base } from '@uploadcare/upload-client';
import { PUBLIC_UPLODCARE_SECRET_KEY } from '$env/static/public';
export const GET: RequestHandler = async () => {
	for (let i = 0; i < attendance.length; i++) {
		console.log(attendance[i].email);
		const user = await db.query.user.findFirst({
			where: eq(schema.user.email, attendance[i].email.toLowerCase()),
			with: {
				members: {
					where: eq(schema.member.orgId, 'org_01HT9631N7WP6BQDG8S55C1W8V')
				}
			}
		});

		const event = await db.query.event.findFirst({
			where: eq(schema.event.createdAt, new Date(attendance[i].created_at))
		});
		const member = user?.members[0];
		if (member && event) {
			await db.insert(schema.attendance).values({
				memId: member.id,
				eventId: event.id,
				createdAt: new Date(attendance[i].marked_at)
			});
		}

		if (!user || !event) {
			error(400, attendance[i].email);
		}
	}
	return json(attendance);
};

async function uploadEvents() {
	const result = await Promise.all(
		events.map(async (event) => {
			const response = await fetch(event.image);
			const blob = await response.blob();
			const formData = new FormData();
			formData.append('UPLOADCARE_PUB_KEY', PUBLIC_UPLODCARE_SECRET_KEY);
			formData.append('UPLOADCARE_STORE', 'auto');
			formData.append(event.name, new File([blob], event.name));
			formData.append('metadata[orgId]', 'org_01HT9631N7WP6BQDG8S55C1W8V');
			const sresult = await fetch('https://upload.uploadcare.com/base/', {
				method: 'POST',
				body: formData
			});
			const ucareresult = await sresult.json();

			return await db
				.insert(schema.event)
				.values({
					name: event.name,
					description: event.description,
					start: new Date(event.date),
					end: new Date(event.gray_by),
					image: `https://ucarecdn.com/${ucareresult[event.name]}/`,
					createdAt: new Date(event.created_at),
					orgId: 'org_01HT9631N7WP6BQDG8S55C1W8V'
				})
				.returning();
		})
	);
}

async function deleteUsers() {
	const list = await workos.userManagement.listUsers({
		after: 'user_01HQFASZ39BW8QFRA0RKYHVR00'
	});

	list.data.forEach(async (user) => {
		const membership = await db.query.member.findFirst({
			where: eq(schema.member.userId, user.id)
		});
		if (membership) {
			await db.delete(schema.membership).where(eq(schema.membership.memId, membership.id));
			await db.delete(schema.formResponse).where(eq(schema.formResponse.memId, membership.id));

			await db.delete(schema.member).where(eq(schema.member.id, membership.id));
		}
		await db.delete(schema.user).where(eq(schema.user.id, user.id));
		await workos.userManagement.deleteUser(user.id);
	});

	return list;
}

async function createInSystem(member: ArrayElement<typeof members>) {
	let [firstName, lastName] = member.name.split(' ');
	const actualLastName = lastName !== '' ? lastName : undefined;
	console.log(lastName == '');
	const dbUser = await db.query.user.findFirst({
		where: eq(schema.user.email, member.email)
	});
	if (dbUser) return;
	const user = await workos.userManagement.createUser({
		email: member.email,
		firstName: firstName,
		lastName: actualLastName
	});

	const om = await workos.userManagement.createOrganizationMembership({
		organizationId: 'org_01HT9631N7WP6BQDG8S55C1W8V',
		userId: user.id
	});

	const defaultPlan = await db.query.plan.findFirst({
		where: and(
			eq(schema.plan.orgId, 'org_01HT9631N7WP6BQDG8S55C1W8V'),
			eq(schema.plan.name, 'Default Plan')
		),
		columns: {
			id: true
		}
	});

	await db
		.insert(schema.member)
		.values({
			id: om.id,
			orgId: 'org_01HT9631N7WP6BQDG8S55C1W8V',
			userId: om.userId,
			role: 'MEMBER'
		})
		.returning()
		.then((result) => console.log(result));

	if (defaultPlan) {
		await db.insert(schema.membership).values({
			planId: defaultPlan.id,
			memId: om.id
		});
	}

	const response = {
		NetID: member.netID,
		Class: member.class,
		'Phone Number': member.phone_number,
		Major: member.major,
		Minor: member.minor
	};

	const newresponse = Object.keys(response).map((key) => ({
		label: key,
		response: response[key]
	}));

	const newFormResponse = await db
		.insert(schema.formResponse)
		.values({
			formId: 'form_Jr6PwABTobRPBnQ8',
			response: newresponse as any,
			memId: om.id
		})
		.returning();

	await db
		.update(schema.member)
		.set({
			additionalInfoId: newFormResponse[0]?.id
		})
		.where(eq(schema.member.id, om.id));
}
