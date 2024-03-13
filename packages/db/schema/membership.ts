import { timestamp, decimal, json, pgTable, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { member } from './member';
import { plan } from './plan';

export const providerEnum = pgEnum('provider', [
	'Jonze',
	'Cashapp',
	'Zelle',
	'Venmo',
	'Other',
	'None'
]);

export const membership = pgTable('Membership', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('membership'))
		.primaryKey(),
	memId: varchar('memId', { length: 191 }).notNull(),
	planId: varchar('planId', { length: 191 }).notNull(),
	provider: providerEnum('provider').notNull().default('None'),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const membershipRelations = relations(membership, ({ one, many }) => ({
	member: one(member, {
		fields: [membership.memId],
		references: [member.id]
	}),
	plan: one(plan, {
		fields: [membership.planId],
		references: [plan.id]
	})
}));
