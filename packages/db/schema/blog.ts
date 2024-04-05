import { timestamp, pgTable, varchar, text } from 'drizzle-orm/pg-core';

export const blog = pgTable('Blog', {
	name: varchar('name', { length: 128 }).primaryKey(),
	content: text('content').notNull(),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});
