import { timestamp, pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { formResponse } from './formResponse';
import { member } from './member';
import { event } from './event';

export const attendance = pgTable('Attendance', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('attendance'))
		.primaryKey(),
	memId: varchar('memId', { length: 128 })
		.notNull()
		.references(() => member.id, {
			onDelete: 'cascade'
		}),
	eventId: varchar('eventId', { length: 128 })
		.notNull()
		.references(() => event.id, {
			onDelete: 'cascade'
		}),
	responseId: varchar('responseId', { length: 128 }).references(() => formResponse.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
	member: one(member, { fields: [attendance.memId], references: [member.id] }),
	response: one(formResponse, { fields: [attendance.responseId], references: [formResponse.id] }),
	event: one(event, { fields: [attendance.eventId], references: [event.id] })
}));
