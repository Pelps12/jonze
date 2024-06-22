import { timestamp, pgTable, varchar, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { member } from './member';

export const memberTag = pgTable('MemberTag', {
	id: varchar('id', { length: 191 })
		.primaryKey()
		.references(() => member.id, {
			onDelete: 'cascade'
		}),
	names: jsonb('names').$type<string[]>().notNull(),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const memberTagRelations = relations(memberTag, ({ one }) => ({
	member: one(member, { fields: [memberTag.id], references: [member.id] })
}));
