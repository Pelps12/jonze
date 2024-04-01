import { timestamp, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { member } from './member';

export const apiKey = pgTable(
	'APIKey',
	{
		keyId: varchar('keyId', { length: 128 }).notNull(),
		memId: varchar('memId', { length: 128 }).notNull(),
		hint: varchar('hint', { length: 20 }).notNull(),
		createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
			.defaultNow()
			.notNull()
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.keyId, table.memId] })
		};
	}
);

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
	member: one(member, { fields: [apiKey.memId], references: [member.id] })
}));
