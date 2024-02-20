import { datetime, mysqlTable, primaryKey, varchar } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql';
import { relations } from 'drizzle-orm';
import { member } from './member';

export const apiKey = mysqlTable(
	'APIKey',
	{
		keyId: varchar('keyId', { length: 128 }).notNull(),
		memId: varchar('memId', { length: 128 }).notNull(),
		hint: varchar('hint', { length: 20 }).notNull(),
		createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
			.default(sql`CURRENT_TIMESTAMP(3)`)
			.notNull(),
		updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
			.default(sql`CURRENT_TIMESTAMP(3)`)
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
