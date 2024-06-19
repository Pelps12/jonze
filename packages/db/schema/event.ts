import { timestamp, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { newId } from '../utils/createId';
import { relations, sql } from 'drizzle-orm';
import { organization } from './organization';
import { attendance } from './attendance';
import { organizationForm } from './organizationForm';
import { eventTag } from './eventTag';

export const event = pgTable('Event', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('event'))
		.primaryKey(),
	name: varchar('name', { length: 191 }).notNull(),
	start: timestamp('start', { mode: 'date', precision: 6, withTimezone: true }).notNull(),
	end: timestamp('end', { mode: 'date', precision: 6, withTimezone: true }).notNull(),
	description: text('description'),
	image: varchar('image', { length: 191 }),
	orgId: varchar('orgId', { length: 128 })
		.notNull()
		.references(() => organization.id, {
			onDelete: 'cascade'
		}),
	formId: varchar('formId', { length: 128 }).references(() => organizationForm.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const eventRelations = relations(event, ({ one, many }) => ({
	organization: one(organization, { fields: [event.orgId], references: [organization.id] }),
	form: one(organizationForm, { fields: [event.formId], references: [organizationForm.id] }),
	tags: one(eventTag),
	attendances: many(attendance)
}));
