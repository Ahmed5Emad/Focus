# Database Schema

## Tables

### `workspaces`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `name` | `text` | |
| `created_at` | `timestamptz` | `now()` |
| `created_by` | `uuid?` | FK → `auth.users.id` |

### `workspace_members`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `workspace_id` | `uuid?` | FK → `workspaces.id` |
| `user_id` | `uuid?` | FK → `auth.users.id` |
| `role` | `user_role` | Enum: `owner`, `admin`, `member`, `sub admin` |
| `joined_at` | `timestamptz` | `now()` |

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK, FK → `auth.users.id` |
| `display_name` | `text?` | |
| `avatar_url` | `text?` | |

### `tasks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `title` | `text` | |
| `description` | `text?` | |
| `status` | `text` | Default `'todo'` |
| `priority` | `text` | `none`, `low`, `medium`, `high`, `urgent` |
| `due_date` | `timestamptz?` | |
| `created_at` | `timestamptz` | |
| `goal_id` | `bigint?` | FK → `goals.id` |
| `project_id` | `uuid?` | FK → `projects.id` |
| `parent_task_id` | `uuid?` | FK → `tasks.id` |
| `assignee_id` | `uuid?` | FK → `auth.users.id` |
| `workspace_id` | `uuid` | FK → `workspaces.id` |

### `goals`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `bigint` | PK, identity |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `title` | `text` | |
| `category` | `text?` | Default `'General'` |
| `progress` | `int` | Default `0` |
| `is_complete` | `boolean` | Default `false` |
| `due_date` | `timestamptz?` | |
| `task_id` | `uuid?` | FK → `tasks.id` |
| `workspace_id` | `uuid` | FK → `workspaces.id` |

### `projects`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `title` | `text` | |
| `description` | `text?` | |
| `status` | `text` | Default `'active'` |
| `is_completed` | `boolean` | Default `false` |
| `category` | `text?` | |
| `workspace_id` | `uuid` | FK → `workspaces.id` |

### `documents`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `title` | `text` | |
| `content` | `jsonb?` | TipTap JSON state |
| `yjs_snapshot` | `bytea?` | Binary Yjs document for Hocuspocus |
| `is_archived` | `boolean` | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### `document_comments`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `document_id` | `uuid` | FK → `documents.id` (CASCADE) |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `content` | `text` | |
| `selection_from` | `int?` | Text range start |
| `selection_to` | `int?` | Text range end |
| `created_at` | `timestamptz` | |

### `chat_messages`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `content` | `text` | |
| `status` | `text` | `sent`, `delivered`, `read` |
| `file_attachment` | `jsonb?` | `{ url, name, size, mimeType }` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### `direct_messages`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `sender_id` | `uuid` | FK → `auth.users.id` |
| `receiver_id` | `uuid` | FK → `auth.users.id` |
| `content` | `text` | |
| `status` | `text` | `sent`, `delivered`, `read` |
| `file_attachment` | `jsonb?` | `{ url, name, size, mimeType }` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `type` | `text` | `assignment`, `mention`, etc. |
| `title` | `text` | |
| `body` | `text?` | |
| `link` | `text?` | Route to navigate to |
| `is_read` | `boolean` | Default `false` |
| `created_at` | `timestamptz` | |

### `focus_sessions`
Tracks Pomodoro/flow timer sessions with `status` (active/paused/completed/abandoned), `flow_score`, `actual_duration_seconds`, and heartbeat tracking.

## Row-Level Security (RLS)

All tables have RLS enabled. General pattern:

- **SELECT**: User must be a workspace member
- **INSERT**: User must be a workspace member; `user_id`/`created_by` set to `auth.uid()`
- **UPDATE/DELETE**: User must be the record owner OR have owner/admin role in the workspace

## Key Foreign Key Relationships

```
tasks.goal_id ──► goals.id
goals.task_id ──► tasks.id
tasks.project_id ──► projects.id
tasks.parent_task_id ──► tasks.id (subtasks)
tasks.assignee_id ──► auth.users.id
documents.workspace_id ──► workspaces.id
document_comments.document_id ──► documents.id (CASCADE delete)
chat_messages.workspace_id ──► workspaces.id
direct_messages.sender_id ──► auth.users.id (sender)
direct_messages.receiver_id ──► auth.users.id (receiver)
notifications.user_id ──► auth.users.id
```

## Migrations

Located in `supabase/migrations/`. Applied in order:

| File | Description |
|------|-------------|
| (unnamed) | Core tables: workspaces, workspace_members, profiles |
| (unnamed) | Tasks, goals, projects |
| (unnamed) | Chat and direct messages |
| `20260702_create_documents_tables.sql` | Documents and document_comments |
| `20260707_add_document_relations.sql` | Document RLS and relations |
| `20260707_document_yjs_snapshot_policy.sql` | Yjs snapshot bytea column and update policy |
