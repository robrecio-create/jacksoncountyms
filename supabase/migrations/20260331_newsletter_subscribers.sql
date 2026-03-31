-- Newsletter subscribers table for JacksonCountyMS.com
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  
  -- Ensure unique emails
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from service role only (API route)
CREATE POLICY "Service role can manage newsletter subscribers"
  ON newsletter_subscribers
  FOR ALL
  USING (true)
  WITH CHECK (true);
