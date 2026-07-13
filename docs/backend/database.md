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
| `position` | `int` | Reorderable (drag-and-drop) |
| `is_archived` | `boolean` | Default `false` |
| `archived_at` | `timestamptz?` | |
| `recurrence_rule` | `text?` | RRULE string for recurring tasks |
| `recurrence_end_date` | `timestamptz?` | |
| `last_recurrence_at` | `timestamptz?` | |
| `template_id` | `uuid?` | FK → `task_templates.id` |

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

### `activity_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `action` | `text` | `task_created`, `task_completed`, etc. |
| `entity_type` | `text` | `task`, `project`, `goal`, `document` |
| `entity_id` | `uuid?` | |
| `metadata` | `jsonb` | Extra context |
| `created_at` | `timestamptz` | |

### `distraction_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `session_id` | `uuid` | FK → `focus_sessions.id` |
| `reason` | `text` | Distraction description |
| `created_at` | `timestamptz` | |

### `task_dependencies`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `task_id` | `uuid` | FK → `tasks.id` (CASCADE) |
| `depends_on_task_id` | `uuid` | FK → `tasks.id` (CASCADE) |
| `created_at` | `timestamptz` | |

### `task_templates`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `name` | `text` | Template name |
| `description` | `text?` | |
| `task_title` | `text` | Default title for created tasks |
| `task_description` | `text?` | |
| `task_priority` | `text` | Default priority |
| `subtask_templates` | `jsonb` | Array of `{ title }` objects |
| `created_at` | `timestamptz` | |
| `created_by` | `uuid` | FK → `auth.users.id` |

### `workflow_statuses`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `name` | `text` | Status label (e.g. "In Progress") |
| `color` | `text` | Hex color |
| `position` | `int` | Sort order |
| `is_default` | `boolean` | Default status for new tasks |

### `custom_fields`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `name` | `text` | Field label |
| `field_type` | `text` | `text`, `number`, `select`, `date` |
| `options` | `text[]` | Options for `select` type |
| `position` | `int` | Sort order |

### `task_custom_values`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `task_id` | `uuid` | FK → `tasks.id` (CASCADE) |
| `field_id` | `uuid` | FK → `custom_fields.id` (CASCADE) |
| `value` | `text?` | Field value |

### `notification_preferences`
| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | PK |
| `user_id` | `uuid` | FK → `auth.users.id` |
| `workspace_id` | `uuid` | FK → `workspaces.id` |
| `mention` | `boolean` | Default `true` |
| `assignment` | `boolean` | Default `true` |
| `comment` | `boolean` | Default `true` |
| `status_change` | `boolean` | Default `true` |
| `session_reminder` | `boolean` | Default `true` |

### `documents` — additional columns
- `project_id` (`uuid?`, FK → `projects.id`) — Document-to-project association

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
| `20260713_workflow_config.sql` | workflow_statuses, custom_fields, task_custom_values, task_templates |
| `20260713_task_dependencies.sql` | task_dependencies table |
| `20260713_task_reordering.sql` | position column on tasks |
| `20260713_recurring_tasks.sql` | recurrence_rule, recurrence_end_date, last_recurrence_at on tasks |
| `20260713_add_missing_task_columns.sql` | is_archived, archived_at, template_id on tasks |
| `20260713_fulltext_search.sql` | Full-text search indexes + search_tasks_fulltext RPC |
| `20260713_activity_feed.sql` | activity_logs table, trigger function for auto-logging |
| `20260713_notification_preferences.sql` | notification_preferences table |
| `20260713_data_archival_policy.sql` | Archival cleanup policy |
| `20260713_rate_limit_rpcs.sql` | Rate-limiting RPCs for API protection |
| `20260713_add_composite_indexes.sql` | Performance composite indexes |

## Custom RPCs

| Function | Description |
|----------|-------------|
| `get_dashboard_stats` | Aggregated stats for Dashboard (flow score, deep work time, task counts) |
| `get_workspace_members_with_email` | Members list joined with auth.users emails |
| `search_tasks_fulltext` | Full-text search across task titles and descriptions |

## Database-Level Automation

- **Activity feed trigger**: An `insert_activity_log` trigger function on `tasks` INSERT/UPDATE/DELETE automatically inserts activity_logs rows
