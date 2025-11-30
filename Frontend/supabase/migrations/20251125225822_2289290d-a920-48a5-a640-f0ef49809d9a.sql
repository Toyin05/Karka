-- Create enum types
CREATE TYPE alert_status AS ENUM ('new', 'reviewing', 'actioned', 'ignored');
CREATE TYPE alert_label AS ENUM ('impersonation', 'repost', 'deepfake', 'name_mention');
CREATE TYPE platform_type AS ENUM ('tiktok', 'twitter', 'youtube');
CREATE TYPE action_status AS ENUM ('pending', 'submitted', 'success', 'failed', 'removed', 'still_active');
CREATE TYPE source_type AS ENUM ('whitelist', 'blocklist');
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Identities table
CREATE TABLE identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  identity_hash TEXT NOT NULL,
  camp_tx_hash TEXT,
  photo_urls TEXT[],
  video_url TEXT,
  embeddings JSONB,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed BOOLEAN DEFAULT FALSE
);

ALTER TABLE identities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own identity"
  ON identities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own identity"
  ON identities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own identity"
  ON identities FOR UPDATE
  USING (auth.uid() = user_id);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform platform_type NOT NULL,
  label alert_label NOT NULL,
  confidence NUMERIC(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  source_url TEXT NOT NULL,
  source_account TEXT,
  screenshot_url TEXT,
  video_frame_url TEXT,
  caption TEXT,
  similarity_score NUMERIC(5,2),
  status alert_status DEFAULT 'new',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_platform ON alerts(platform);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all alerts"
  ON alerts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Sources table (whitelist/blocklist)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  source_type source_type NOT NULL,
  platform platform_type NOT NULL,
  handle TEXT NOT NULL,
  domain TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, handle)
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sources"
  ON sources FOR ALL
  USING (auth.uid() = user_id);

-- Actions table (rebuke history)
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT DEFAULT 'rebuke',
  message_template TEXT,
  status action_status DEFAULT 'pending',
  attempts JSONB DEFAULT '[]'::jsonb,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_actions_user_id ON actions(user_id);
CREATE INDEX idx_actions_alert_id ON actions(alert_id);

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions"
  ON actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own actions"
  ON actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all actions"
  ON actions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_actions_updated_at
  BEFORE UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();