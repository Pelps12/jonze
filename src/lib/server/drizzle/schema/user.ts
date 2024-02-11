import { relations } from 'drizzle-orm';
import { boolean, datetime, mysqlTable, unique, varchar } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql';
import { member } from './member';

export const user = mysqlTable(
	'User',
	{
		id: varchar('id', { length: 128 }).primaryKey(),
		firstName: varchar('firstName', { length: 191 }),
		lastName: varchar('lastName', { length: 191 }),
		email: varchar('email', { length: 191 }).notNull(),
		emailVerified: boolean('emailVerified').notNull(),
		profilePictureUrl: varchar('profilePictureUrl', { length: 191 }),
		createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
			.default(sql`CURRENT_TIMESTAMP(3)`)
			.notNull(),
		updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
			.default(sql`CURRENT_TIMESTAMP(3)`)
			.notNull()
	},
	(table) => {
		return {
			userEmailKey: unique('User_email_key').on(table.email)
		};
	}
);

export const userRelations = relations(user, ({ many }) => ({
	member: many(member)
}));
