-- 1. Add 'sub admin' to user_role ENUM
ALTER TYPE user_role ADD VALUE 'sub admin';

-- 2. Migrate existing data
-- Map 'owner' to 'admin' and 'admin' to 'sub admin'
UPDATE workspace_members SET role = 'sub admin' WHERE role = 'admin';
UPDATE workspace_members SET role = 'admin' WHERE role = 'owner';

-- 3. Update create_workspace RPC
CREATE OR REPLACE FUNCTION public.create_workspace(p_name text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_workspace_id UUID;
  v_member_id UUID;
BEGIN
  -- Insert the new workspace
  INSERT INTO workspaces (name, created_by)
  VALUES (p_name, auth.uid())
  RETURNING id INTO v_workspace_id;

  -- Add the creator as the admin in workspace_members
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, auth.uid(), 'admin')
  RETURNING id INTO v_member_id;

  RETURN json_build_object(
    'success', true,
    'workspace_id', v_workspace_id,
    'member_id', v_member_id
  );
END;
$function$;

-- 4. Update invite_user_to_workspace RPC
CREATE OR REPLACE FUNCTION public.invite_user_to_workspace(p_email text, p_workspace_id uuid, p_role user_role DEFAULT 'member'::user_role)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_member_id UUID;
BEGIN
  -- Check if caller has permission (admin or sub admin of workspace)
  IF NOT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'sub admin')
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Permission denied');
  END IF;

  -- Find the user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = v_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User is already a member');
  END IF;

  -- Add to workspace
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (p_workspace_id, v_user_id, p_role)
  RETURNING id INTO v_member_id;

  RETURN json_build_object('success', true, 'member_id', v_member_id);
END;
$function$;

-- 5. Update get_workspace_members_with_email RPC
CREATE OR REPLACE FUNCTION public.get_workspace_members_with_email(p_workspace_id uuid)
 RETURNS TABLE(member_id uuid, user_id uuid, email text, role user_role, joined_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Check if caller is a member of the workspace
  IF NOT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = p_workspace_id
    AND workspace_members.user_id = auth.uid()
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    wm.id AS member_id,
    wm.user_id,
    u.email::TEXT,
    wm.role,
    wm.joined_at
  FROM workspace_members wm
  JOIN auth.users u ON wm.user_id = u.id
  WHERE wm.workspace_id = p_workspace_id
  ORDER BY wm.joined_at ASC;
END;
$function$;
