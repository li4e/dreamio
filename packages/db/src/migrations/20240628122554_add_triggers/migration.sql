-- Create or replace the function update_post_likes
-- This function will update the likes count in the Post table based on the operations in the PostLike table
CREATE OR REPLACE FUNCTION update_post_likes()
RETURNS TRIGGER AS $$
BEGIN
    -- If the operation is an INSERT
    IF TG_OP = 'INSERT' THEN
        -- Increase the likes count by 1 in the Post table for the corresponding record
        UPDATE Post
        SET likes = likes + 1
        WHERE id = NEW.postId;
    -- If the operation is a DELETE
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease the likes count by 1 in the Post table for the corresponding record
        UPDATE Post
        SET likes = likes - 1
        WHERE id = OLD.postId;
    END IF;
    -- Return NULL because an AFTER trigger does not require a return value
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger post_likes_trigger for the PostLike table
CREATE TRIGGER post_likes_trigger
AFTER INSERT OR DELETE ON "PostLike"
FOR EACH ROW
EXECUTE FUNCTION update_post_likes();

-- Create trigger for the Subscription table
CREATE TRIGGER update_subscription_version
BEFORE UPDATE ON "Subscription"
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Create trigger for the InAppPurchase table
CREATE TRIGGER update_inappurchase_version
BEFORE UPDATE ON "InAppPurchase"
FOR EACH ROW
EXECUTE FUNCTION increment_version();