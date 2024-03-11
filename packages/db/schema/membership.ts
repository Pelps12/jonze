import { timestamp, decimal, json, pgTable, varchar } from 'drizzle-orm/pg-core';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { member } from './member';
import { plan } from './plan';

export const membership = pgTable('plan', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('plan'))
		.primaryKey(),
	memId: varchar('memId', { length: 191 }).notNull(),
	planId: varchar('planId', { length: 191 }).notNull(),
	amount: decimal('decimal', { scale: 2 }),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const membershipRelations = relations(membership, ({ one, many }) => ({
	organization: one(member, {
		fields: [membership.memId],
		references: [member.id]
	}),
	plan: one(plan, {
		fields: [membership.planId],
		references: [plan.id]
	})
}));
