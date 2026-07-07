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

### `focus_sessions`
Tracks Pomodoro/flow timer sessions with `status` (active/paused/completed/abandoned), `flow_score`, `actual_duration_seconds`, and heartbeat tracking.

### `documents`
Collaborative documents with `content` (JSONB TipTap state), `yjs_snapshot` (bytea for Hocuspocus persistence).

### `document_comments`
Inline comments on documents with `selection_from`/`selection_to` for text annotations.

### `chat_messages` & `direct_messages`
Workspace chat and direct messaging between users.

## Row-Level Security (RLS)

All tables have RLS enabled. The general pattern:

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
```
