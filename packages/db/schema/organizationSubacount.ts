import { timestamp, json, pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { organization } from './organization';
import { formResponse } from './formResponse';
import { event } from './event';

export const organizationSubaccount = pgTable('OrganizationSubaccount', {
	orgId: varchar('orgId', { length: 191 }).primaryKey(), //Handle manually. Requires Stripe deletion
	subaccountId: varchar('subAccountId', { length: 191 }).notNull(),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const organizationSubAccountRelations = relations(organizationSubaccount, ({ one }) => ({
	organization: one(organization, {
		fields: [organizationSubaccount.orgId],
		references: [organization.id]
	})
}));
