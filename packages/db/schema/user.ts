import { relations } from 'drizzle-orm';
import { boolean, timestamp, pgTable, unique, varchar } from 'drizzle-orm/pg-core';
import { member } from './member';
import { customer } from './customer';

export const user = pgTable(
	'User',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		firstName: varchar('firstName', { length: 191 }),
		lastName: varchar('lastName', { length: 191 }),
		email: varchar('email', { length: 191 }).notNull(),
		emailVerified: boolean('emailVerified').notNull(),
		profilePictureUrl: varchar('profilePictureUrl', { length: 191 }),
		createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
			.defaultNow()
			.notNull()
	},
	(table) => {
		return {
			userEmailKey: unique('User_email_key').on(table.email)
		};
	}
);

export const userRelations = relations(user, ({ one, many }) => ({
	customer: one(customer, { fields: [user.id], references: [customer.userId] }),
	members: many(member)
}));
