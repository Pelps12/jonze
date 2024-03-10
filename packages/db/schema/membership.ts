import {
	bigint,
	datetime,
	decimal,
	json,
	mysqlTable,
	timestamp,
	varchar
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm/sql';
import { newId } from '../utils/createId';
import { relations } from 'drizzle-orm';
import { organization } from './organization';
import { formResponse } from './formResponse';
import { event } from './event';
import { member } from './member';
import { plan } from './plan';

export const membership = mysqlTable('plan', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('plan'))
		.primaryKey(),
	memId: varchar('memId', { length: 191 }).notNull(),
	planId: varchar('planId', { length: 191 }).notNull(),
	amount: decimal('decimal', { scale: 2 }),
	createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull()
});

export const membershipRelations = relations(membership, ({ one, many }) => ({
	organization: one(member, {
		fields: [membership.memId],
		references: [member.id]
	}),
	plan: one(plan, {
		fields: [membership.planId],
		references: [plan.id]
	})
}));
