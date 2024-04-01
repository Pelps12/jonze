import { timestamp, json, pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';
import { newId } from '../utils/createId';
import type { CustomForm } from '$lib/types/forms';
import { relations } from 'drizzle-orm';
import { organization } from './organization';
import { formResponse } from './formResponse';
import { event } from './event';

export const organizationForm = pgTable('OrganizationForm', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('form'))
		.primaryKey(),
	orgId: varchar('orgId', { length: 191 }).notNull(),
	name: varchar('name', { length: 191 }).notNull(),
	form: json('form').$type<CustomForm>().notNull(),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const formRelations = relations(organizationForm, ({ one, many }) => ({
	organization: one(organization, {
		fields: [organizationForm.orgId],
		references: [organization.id]
	}),
	events: one(event, {
		fields: [organizationForm.id],
		references: [event.formId]
	}), //May change
	responses: many(formResponse)
}));
