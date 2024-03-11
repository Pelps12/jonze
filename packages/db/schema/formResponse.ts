import { timestamp, json, pgTable, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm/sql';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { member } from './member';
import { organizationForm } from './organizationForm';
import { attendance } from './attendance';

export const formResponse = pgTable('FormResponse', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('response'))
		.primaryKey(),
	formId: varchar('formId', { length: 128 }).notNull(),
	response: json('response').$type<Record<string, string>>().notNull(),
	memId: varchar('memId', { length: 128 }),
	createdAt: timestamp('createdAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp('updatedAt', { mode: 'date', precision: 6, withTimezone: true })
		.defaultNow()
		.notNull()
});

export const responseRelations = relations(formResponse, ({ one }) => ({
	member: one(member, { fields: [formResponse.id], references: [member.additionalInfoId] }), //Solely for Additional Info
	form: one(organizationForm, { fields: [formResponse.formId], references: [organizationForm.id] }),
	attendance: one(attendance, { fields: [formResponse.id], references: [attendance.responseId] }),
	responder: one(member, { fields: [formResponse.memId], references: [member.id] }) //For all forms
}));
