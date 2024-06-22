import { timestamp, decimal, json, pgTable, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { member } from './member';
import { plan } from './plan';
import { formResponse } from './formResponse';

export const providerEnum = pgEnum('provider', [
	'Jonze',
	'Cashapp',
	'Zelle',
	'Venmo',
	'Cash',
	'Other',
	'None'
]);

export const membership = pgTable('Membership', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('membership'))
		.primaryKey(),
	memId: varchar('memId', { length: 191 })
		.notNull()
		.references(() => member.id, {
			onDelete: 'cascade'
		}),
	planId: varchar('planId', { length: 191 })
		.notNull()
		.references(() => plan.id, {
			onDelete: 'cascade'
		}),
	responseId: varchar('responseId', { length: 128 }).references(() => formResponse.id, {
		onDelete: 'set null'
	}),
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
	response: one(formResponse, {
		fields: [membership.responseId],
		references: [formResponse.id]
	}),
	plan: one(plan, {
		fields: [membership.planId],
		references: [plan.id]
	})
}));
