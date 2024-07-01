-- Create trigger function to increment the version
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger update_subscription_version for the "Subscription" table
CREATE TRIGGER update_subscription_version
BEFORE UPDATE ON "Subscription"
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Create trigger update_inappurchase_version for the "InAppPurchase" table
CREATE TRIGGER update_inappurchase_version
BEFORE UPDATE ON "InAppPurchase"
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Create or replace the function update_post_likes
-- This function will update the likes_count in the "Post" table based on the operations in the "PostLike" table
CREATE OR REPLACE FUNCTION update_post_likes()
RETURNS TRIGGER AS $$
BEGIN
    -- If the operation is an INSERT
    IF TG_OP = 'INSERT' THEN
        -- Increase the likes_count by 1 in the "Post" table for the corresponding record
        UPDATE "Post"
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
    -- If the operation is a DELETE
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease the likes_count by 1 in the "Post" table for the corresponding record
        UPDATE "Post"
        SET likes_count = likes_count - 1
        WHERE id = OLD.post_id;
    END IF;
    -- Return NULL because an AFTER trigger does not require a return value
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to call update_post_likes function on insert and delete
CREATE TRIGGER after_insert_or_delete_post_like
AFTER INSERT OR DELETE ON "PostLike"
FOR EACH ROW
EXECUTE FUNCTION update_post_likes();

-- Create or replace the function update_post_comment_likes
CREATE OR REPLACE FUNCTION update_post_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "PostComment"
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "PostComment"
        SET likes_count = likes_count - 1
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to call update_post_comment_likes function on insert and delete
CREATE TRIGGER after_insert_or_delete_post_comment_like
AFTER INSERT OR DELETE ON "PostCommentLike"
FOR EACH ROW
EXECUTE FUNCTION update_post_comment_likes();

-- Create or replace the function update_post_comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "Post"
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id AND deleted = false AND blocked = false;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "Post"
        SET comments_count = comments_count - 1
        WHERE id = OLD.post_id AND deleted = false AND blocked = false;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.deleted = false AND OLD.blocked = false AND (NEW.deleted = true OR NEW.blocked = true) THEN
            UPDATE "Post"
            SET comments_count = comments_count - 1
            WHERE id = NEW.post_id;
        ELSIF (OLD.deleted = true OR OLD.blocked = true) AND (NEW.deleted = false AND NEW.blocked = false) THEN
            UPDATE "Post"
            SET comments_count = comments_count + 1
            WHERE id = NEW.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to call update_post_comments_count function on insert, delete, and update
CREATE TRIGGER after_insert_or_delete_or_update_post_comment
AFTER INSERT OR DELETE OR UPDATE OF deleted, blocked ON "PostComment"
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();

-- Create or replace the function update_post_comment_child_count
CREATE OR REPLACE FUNCTION update_post_comment_child_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL AND NEW.deleted = false AND NEW.blocked = false THEN
        UPDATE "PostComment"
        SET child_count = child_count + 1
        WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL AND OLD.deleted = false AND OLD.blocked = false THEN
        UPDATE "PostComment"
        SET child_count = child_count - 1
        WHERE id = OLD.parent_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.deleted = false AND OLD.blocked = false AND (NEW.deleted = true OR NEW.blocked = true) THEN
            UPDATE "PostComment"
            SET child_count = child_count - 1
            WHERE id = NEW.parent_id;
        ELSIF (OLD.deleted = true OR OLD.blocked = true) AND (NEW.deleted = false AND NEW.blocked = false) THEN
            UPDATE "PostComment"
            SET child_count = child_count + 1
            WHERE id = NEW.parent_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to call update_post_comment_child_count function on insert, delete, and update
CREATE TRIGGER after_insert_or_delete_or_update_post_comment_child
AFTER INSERT OR DELETE OR UPDATE OF deleted, blocked ON "PostComment"
FOR EACH ROW
EXECUTE FUNCTION update_post_comment_child_count();

-- Constraint to ensure that parent_id has the same postId
CREATE OR REPLACE FUNCTION validate_parent_post_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    PERFORM 1
    FROM "PostComment"
    WHERE id = NEW.parent_id AND post_id = NEW.post_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Parent comment postId must match the postId of the new comment';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call validate_parent_post_id function before insert or update
CREATE TRIGGER before_insert_or_update_post_comment
BEFORE INSERT OR UPDATE ON "PostComment"
FOR EACH ROW
EXECUTE FUNCTION validate_parent_post_id();

-- Function to block a post when its claim is accepted
CREATE OR REPLACE FUNCTION block_post_on_claim_accepted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' THEN
        UPDATE "Post"
        SET blocked = true
        WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after the claim status is updated to accepted
CREATE TRIGGER after_update_post_claim_status
AFTER UPDATE OF status ON "PostClaim"
FOR EACH ROW
EXECUTE FUNCTION block_post_on_claim_accepted();

-- Function to block a comment when its claim is accepted
CREATE OR REPLACE FUNCTION block_comment_on_claim_accepted()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' THEN
        UPDATE "PostComment"
        SET blocked = true
        WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after the claim status is updated to accepted
CREATE TRIGGER after_update_comment_claim_status
AFTER UPDATE OF status ON "CommentClaim"
FOR EACH ROW
EXECUTE FUNCTION block_comment_on_claim_accepted();