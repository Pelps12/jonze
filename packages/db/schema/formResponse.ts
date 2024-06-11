import { timestamp, pgTable, varchar, jsonb } from 'drizzle-orm/pg-core';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { member } from './member';
import { organizationForm } from './organizationForm';
import { attendance } from './attendance';

export const formResponse = pgTable('FormResponse', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('response'))
		.primaryKey(),
	formId: varchar('formId', { length: 128 })
		.notNull()
		.references(() => organizationForm.id, {
			onDelete: 'cascade'
		}),
	response: jsonb('response')
		.$type<
			{
				label: string;
				response: string | string[];
			}[]
		>()
		.notNull(),
	memId: varchar('memId', { length: 128 }).references(() => member.id, {
		onDelete: 'cascade'
	}),
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
