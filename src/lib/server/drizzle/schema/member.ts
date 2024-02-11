import { relations } from 'drizzle-orm';
import { mysqlEnum, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { user } from './user';
import { organization } from './organization';
import { formResponse } from './formResponse';
import { attendance } from './attendance';

export const member = mysqlTable('Member', {
	id: varchar('id', { length: 128 }).primaryKey(),
	orgId: varchar('orgId', { length: 128 }).notNull(),
	userId: varchar('userId', { length: 128 }).notNull(),
	role: mysqlEnum('role', ['OWNER', 'ADMIN', 'MEMBER']).default('MEMBER').notNull(),
	additionalInfoId: varchar('additionalInfoId', { length: 128 })
});

export const memberRelations = relations(member, ({ one, many }) => ({
	user: one(user, { fields: [member.userId], references: [user.id] }),
	organization: one(organization, { fields: [member.orgId], references: [organization.id] }),
	additionalInfo: one(formResponse, {
		fields: [member.additionalInfoId],
		references: [formResponse.id]
	}),
	attendances: many(attendance)
}));
