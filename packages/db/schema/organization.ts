import { relations } from 'drizzle-orm';
import { datetime, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql';
import { organizationForm } from './organizationForm';
import { member } from './member';
import { event } from './event';
import { plan } from './plan';

export const organization = mysqlTable('Organization', {
	id: varchar('id', { length: 128 }).primaryKey(),
	name: varchar('name', { length: 191 }).notNull(),
	createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull()
});

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member),
	forms: many(organizationForm),
	events: many(event),
	plans: many(plan)
}));
