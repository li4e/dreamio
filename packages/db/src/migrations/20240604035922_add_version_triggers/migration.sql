-- Create trigger function to increment the version
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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