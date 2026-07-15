-- Notify all workspace members except sender on new chat message
CREATE OR REPLACE FUNCTION notify_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, workspace_id, type, title, body, link)
  SELECT
    wm.user_id,
    NEW.workspace_id,
    'comment',
    'New message in #general',
    LEFT(NEW.content, 120),
    '/chat'
  FROM workspace_members wm
  WHERE wm.workspace_id = NEW.workspace_id
    AND wm.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_chat_message_inserted ON chat_messages;
CREATE TRIGGER on_chat_message_inserted
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_chat_message();

-- Notify the receiver on new direct message
CREATE OR REPLACE FUNCTION notify_direct_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, workspace_id, type, title, body, link)
  VALUES (
    NEW.receiver_id,
    NEW.workspace_id,
    'comment',
    'New direct message',
    LEFT(NEW.content, 120),
    '/chat'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_direct_message_inserted ON direct_messages;
CREATE TRIGGER on_direct_message_inserted
  AFTER INSERT ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_direct_message();
