import { timestamp, pgTable, varchar, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { event } from './event';

export const eventTag = pgTable('EventTag', {
	id: varchar('id', { length: 191 })
		.primaryKey()
		.references(() => event.id, {
			onDelete: 'cascade'
		}),
	names: json('names').$type<string[]>().notNull(),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const eventTagRelations = relations(eventTag, ({ one }) => ({
	event: one(event, { fields: [eventTag.id], references: [event.id] })
}));
