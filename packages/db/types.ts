import schema from './schema';

export type Attendance = typeof schema.attendance.$inferSelect;
export type Event = typeof schema.event.$inferSelect;
export type User = typeof schema.user.$inferSelect;
export type Member = typeof schema.member.$inferSelect;
export type Organization = typeof schema.organization.$inferSelect;
export type OrgForm = typeof schema.organizationForm.$inferSelect;
export type FormResponse = typeof schema.formResponse.$inferSelect;
export type EventTag = typeof schema.eventTag.$inferSelect;
