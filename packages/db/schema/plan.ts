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
import { membership } from './membership';

export const plan = mysqlTable('plan', {
	id: varchar('id', { length: 128 })
		.$defaultFn(() => newId('plan'))
		.primaryKey(),
	orgId: varchar('orgId', { length: 191 }).notNull(),
	name: varchar('name', { length: 191 }).notNull(),
	start: timestamp('start'),
	interval: bigint('interval', { mode: 'bigint', unsigned: true }),
	amount: decimal('decimal', { scale: 2 }),
	createdAt: datetime('createdAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull(),
	updatedAt: datetime('updatedAt', { mode: 'date', fsp: 3 })
		.default(sql`CURRENT_TIMESTAMP(3)`)
		.notNull()
});

export const formRelations = relations(plan, ({ one, many }) => ({
	organization: one(organization, {
		fields: [plan.orgId],
		references: [organization.id]
	}),
	memberships: many(membership)
}));
