import { datetime, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { formResponse } from './formResponse';
import { member } from './member';
import { event } from './event';

export const attendance = mysqlTable('Attendance', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('attendance'))
		.primaryKey(),
	memId: varchar('memId', { length: 128 }).notNull(),
	eventId: varchar('eventId', { length: 128 }).notNull(),
	responseId: varchar('responseId', { length: 128 }),
	createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull()
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
	member: one(member, { fields: [attendance.memId], references: [member.id] }),
	response: one(formResponse, { fields: [attendance.responseId], references: [formResponse.id] }),
	event: one(event, { fields: [attendance.eventId], references: [event.id] })
}));
