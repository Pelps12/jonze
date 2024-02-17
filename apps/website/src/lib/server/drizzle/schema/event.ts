import { datetime, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';
import { newId } from '../utils/createId';
import { relations, sql } from 'drizzle-orm';
import { organization } from './organization';
import { attendance } from './attendance';
import { organizationForm } from './organizationForm';

export const event = mysqlTable('Event', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('event'))
		.primaryKey(),
	name: varchar('name', { length: 191 }).notNull(),
	start: datetime('start', { mode: 'date', fsp: 3 }).notNull(),
	end: datetime('end', { mode: 'date', fsp: 3 }).notNull(),
	description: text('description'),
	image: varchar('image', { length: 191 }),
	orgId: varchar('orgId', { length: 128 }).notNull(),
	formId: varchar('formId', { length: 128 }),
	createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull()
});

export const eventRelations = relations(event, ({ one, many }) => ({
	organization: one(organization, { fields: [event.orgId], references: [organization.id] }),
	form: one(organizationForm, { fields: [event.formId], references: [organizationForm.id] }),
	attendances: many(attendance)
}));
