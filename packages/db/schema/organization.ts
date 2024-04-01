import { relations } from 'drizzle-orm';
import { timestamp, pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';
import { organizationForm } from './organizationForm';
import { member } from './member';
import { event } from './event';
import { plan } from './plan';

export const organization = pgTable('Organization', {
	id: varchar('id', { length: 128 }).primaryKey(),
	name: varchar('name', { length: 191 }).notNull(),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member),
	forms: many(organizationForm),
	events: many(event),
	plans: many(plan)
}));
