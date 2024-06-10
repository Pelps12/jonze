import { relations, sql } from 'drizzle-orm';
import { timestamp, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core';
import { user } from './user';
import { organization } from './organization';
import { formResponse } from './formResponse';
import { attendance } from './attendance';
import { apiKey } from './apikey';
import { membership } from './membership';
import { customer } from './customer';

export const roleEnum = pgEnum('role', ['OWNER', 'ADMIN', 'MEMBER']);

export const member = pgTable('Member', {
	id: varchar('id', { length: 128 }).primaryKey(),
	orgId: varchar('orgId', { length: 128 })
		.notNull()
		.references(() => organization.id, {
			onDelete: 'cascade'
		}),
	userId: varchar('userId', { length: 128 }).notNull(),
	role: roleEnum('role').notNull().default('MEMBER'),
	additionalInfoId: varchar('additionalInfoId', { length: 128 }),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const memberRelations = relations(member, ({ one, many }) => ({
	user: one(user, { fields: [member.userId], references: [user.id] }),
	customer: one(customer, { fields: [member.id], references: [customer.memId] }),
	organization: one(organization, { fields: [member.orgId], references: [organization.id] }),
	additionalInfo: one(formResponse, {
		fields: [member.additionalInfoId],
		references: [formResponse.id]
	}),
	memberships: many(membership),
	attendances: many(attendance),
	keys: many(apiKey),
	responses: many(formResponse)
}));
