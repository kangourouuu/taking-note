import { pgTable, uuid, varchar, text, date, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const tagsTable = pgTable("tags", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projectsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  colorHex: varchar("color_hex", { length: 7 }).default("#000000").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const notesTable = pgTable("notes", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  summary: varchar("summary", { length: 500 }),
  content: text("content").notNull(),
  noteDate: date("note_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const noteTagsTable = pgTable(
  "note_tags",
  {
    noteId: uuid("note_id").notNull().references(() => notesTable.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id").notNull().references(() => tagsTable.id, { onDelete: "cascade" })
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.tagId] })
  })
);
