import { relations } from 'drizzle-orm';
import { timestamp, pgTable, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';
import { organizationForm } from './organizationForm';
import { member } from './member';
import { event } from './event';
import { plan } from './plan';
import { organizationSubaccount } from './organizationSubacount';

export const orgplanEnum = pgEnum('orgPlan', ['standard', 'plus']);

export const organization = pgTable('Organization', {
	id: varchar('id', { length: 128 }).primaryKey(),
	name: varchar('name', { length: 191 }).notNull(),
	logo: varchar('logo', { length: 191 }),
	website: varchar('website', { length: 191 }),
	plan: orgplanEnum('plan').notNull().default('standard'),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const organizationRelations = relations(organization, ({ one, many }) => ({
	subaccount: one(organizationSubaccount, {
		fields: [organization.id],
		references: [organizationSubaccount.orgId]
	}),
	members: many(member),
	forms: many(organizationForm),
	events: many(event),
	plans: many(plan)
}));
