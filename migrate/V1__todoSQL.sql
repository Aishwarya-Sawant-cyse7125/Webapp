CREATE SCHEMA IF NOT EXISTS todo;

CREATE TABLE IF NOT EXISTS todo.users (
    id uuid PRIMARY KEY NOT NULL,
    emailid character varying(255) NOT NULL UNIQUE,
    password character varying(255),
    firstname character varying(255),
    lastname character varying(255),
    middlename character varying(255),
    account_created timestamp with time zone,
    account_updated timestamp with time zone
);

CREATE TABLE IF NOT EXISTS todo.lists (
    id uuid PRIMARY KEY NOT NULL,
    "userId" uuid REFERENCES todo.users(id) NOT NULL,
    listname character varying(255),
    list_created timestamp with time zone,
    list_updated timestamp with time zone
);

CREATE TABLE IF NOT EXISTS todo.tasks (
    id uuid PRIMARY KEY NOT NULL,
    listid uuid REFERENCES todo.lists(id) NOT NULL,
    summary character varying(50),
    task character varying(100),
    "dueDate" timestamp with time zone,
    priority character varying(255),
    state character varying(255),
    task_created timestamp with time zone,
    task_modified timestamp with time zone
);

CREATE TABLE IF NOT EXISTS todo.attachments (
    id uuid PRIMARY KEY NOT NULL,
    name character varying(255),
    size integer,
    "attachedDate" timestamp with time zone,
    path character varying(255),
    "taskId" uuid REFERENCES todo.tasks(id) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS todo.comments (
    id uuid PRIMARY KEY NOT NULL,
    "taskId" uuid REFERENCES todo.tasks(id) NOT NULL,
    comment character varying(255),
    comment_created timestamp with time zone,
    comment_modified timestamp with time zone
);

CREATE TABLE IF NOT EXISTS todo.reminders (
    id uuid PRIMARY KEY NOT NULL,
    "taskId" uuid REFERENCES todo.tasks(id) NOT NULL,
	reminderdate timestamp with time zone,
    reminder_created timestamp with time zone,
    reminder_modified timestamp with time zone
);

CREATE TABLE IF NOT EXISTS todo.tags (
    id uuid PRIMARY KEY NOT NULL,
    "userId" uuid REFERENCES todo.users(id) NOT NULL,
    name character varying(255) UNIQUE,
    tags_created timestamp with time zone,
    tags_modified timestamp with time zone
);

CREATE TABLE IF NOT EXISTS todo.task_tags (
    id uuid PRIMARY KEY NOT NULL,
    "taskId" uuid REFERENCES todo.tasks(id) NOT NULL,
    "tagId" uuid REFERENCES todo.tags(id) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);
