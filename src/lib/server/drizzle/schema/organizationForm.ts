import { datetime, json, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql';
import { newId } from '../utils/createId';
import type { CustomField } from '$lib/types/forms';
import { relations } from 'drizzle-orm';
import { organization } from './organization';
import { formResponse } from './formResponse';

export const organizationForm = mysqlTable('OrganizationForm', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('form'))
		.primaryKey(),
	orgId: varchar('orgId', { length: 191 }).notNull(),
	name: varchar('name', { length: 191 }).notNull(),
	form: json('form').$type<Record<string, CustomField>>().notNull(),
	createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull()
});

export const formRelations = relations(organizationForm, ({ one, many }) => ({
	organization: one(organization, {
		fields: [organizationForm.orgId],
		references: [organization.id]
	}),
	responses: many(formResponse)
}));
