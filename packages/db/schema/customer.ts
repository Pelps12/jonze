import { relations } from 'drizzle-orm';
import { boolean, timestamp, pgTable, unique, varchar } from 'drizzle-orm/pg-core';
import { member } from './member';
import { user } from './user';
import { organization } from './organization';
import { organizationSubaccount } from './organizationSubacount';

export const customer = pgTable('Customer', {
	userId: varchar('userId', { length: 128 }).primaryKey(),
	stripeId: varchar('stripeId', { length: 128 }).notNull(),
	orgId: varchar('orgId', { length: 128 }),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const customerRelations = relations(customer, ({ one }) => ({
	user: one(user, { fields: [customer.userId], references: [user.id] }),
	orgSubaccount: one(organizationSubaccount, {
		fields: [customer.orgId],
		references: [organizationSubaccount.orgId]
	})
}));
