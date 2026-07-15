-- Notify document owner when someone else comments on their document
CREATE OR REPLACE FUNCTION notify_document_comment_owner()
RETURNS TRIGGER AS $$
DECLARE
  doc_owner_id UUID;
  doc_title TEXT;
BEGIN
  SELECT created_by, title INTO doc_owner_id, doc_title
  FROM documents WHERE id = NEW.document_id;

  IF doc_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, workspace_id, type, title, body, link)
    VALUES (
      doc_owner_id,
      (SELECT workspace_id FROM documents WHERE id = NEW.document_id),
      'comment',
      'New comment on "' || doc_title || '"',
      LEFT(NEW.content, 120),
      '/documents/' || NEW.document_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_document_comment_inserted ON document_comments;
CREATE TRIGGER on_document_comment_inserted
  AFTER INSERT ON document_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_document_comment_owner();

-- Parse @mentions in document comments and notify mentioned users
CREATE OR REPLACE FUNCTION notify_document_comment_mentions()
RETURNS TRIGGER AS $$
DECLARE
  mention_pattern TEXT;
  mentioned_name TEXT;
  mentioned_user_id UUID;
  doc_workspace_id UUID;
BEGIN
  SELECT workspace_id INTO doc_workspace_id FROM documents WHERE id = NEW.document_id;

  FOR mentioned_name IN
    SELECT DISTINCT substring(word FROM '@"([^"]+)"') AS name
    FROM regexp_matches(NEW.content, '@"([^"]+)"', 'g') AS word
    UNION
    SELECT DISTINCT substring(word FROM '@(\S+)') AS name
    FROM regexp_matches(NEW.content, '@(\S+)', 'g') AS word
  LOOP
    mentioned_name := trim(trailing ',' from mentioned_name);
    mentioned_name := trim(trailing 's' from mentioned_name);
    mentioned_name := trim(trailing '.' from mentioned_name);

    IF mentioned_name IS NOT NULL AND mentioned_name != '' THEN
      SELECT p.id INTO mentioned_user_id
      FROM profiles p
      JOIN workspace_members wm ON wm.user_id = p.id
      WHERE wm.workspace_id = doc_workspace_id
        AND (p.display_name ILIKE mentioned_name OR p.display_name ILIKE mentioned_name || '%')
      LIMIT 1;

      IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, workspace_id, type, title, body, link)
        VALUES (
          mentioned_user_id,
          doc_workspace_id,
          'mention',
          'You were mentioned in a comment',
          LEFT(NEW.content, 120),
          '/documents/' || NEW.document_id
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_document_comment_mention ON document_comments;
CREATE TRIGGER on_document_comment_mention
  AFTER INSERT ON document_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_document_comment_mentions();
