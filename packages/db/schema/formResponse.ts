import { datetime, json, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { member } from './member';
import { organizationForm } from './organizationForm';
import { attendance } from './attendance';

export const formResponse = mysqlTable('FormResponse', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('response'))
		.primaryKey(),
	formId: varchar('formId', { length: 128 }).notNull(),
	response: json('response').$type<Record<string, string>>().notNull(),
	memId: varchar('memId', { length: 128 }),
	createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull()
});

export const responseRelations = relations(formResponse, ({ one }) => ({
	member: one(member, { fields: [formResponse.id], references: [member.additionalInfoId] }), //Solely for Additional Info
	form: one(organizationForm, { fields: [formResponse.formId], references: [organizationForm.id] }),
	attendance: one(attendance, { fields: [formResponse.id], references: [attendance.responseId] }),
	responder: one(member, { fields: [formResponse.memId], references: [member.id] }) //For all forms
}));
