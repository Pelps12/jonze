import { bigint, decimal, interval, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { organization } from './organization';
import { membership } from './membership';
import { organizationForm } from './organizationForm';

export const plan = pgTable('plan', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('plan'))
		.primaryKey(),
	orgId: varchar('orgId', { length: 191 })
		.notNull()
		.references(() => organization.id, {
			onDelete: 'cascade'
		}),
	name: varchar('name', { length: 191 }).notNull(),
	start: timestamp('start', { mode: 'date', withTimezone: true }),
	interval: interval('interval', { fields: 'year to month' }),
	amount: decimal('amount', { scale: 2 }),
	formId: varchar('formId', { length: 128 }).references(() => organizationForm.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const planRelations = relations(plan, ({ one, many }) => ({
	organization: one(organization, {
		fields: [plan.orgId],
		references: [organization.id]
	}),
	form: one(organizationForm, {
		fields: [plan.formId],
		references: [organizationForm.id]
	}),
	memberships: many(membership)
}));
