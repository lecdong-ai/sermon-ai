DROP POLICY IF EXISTS "visitor_logs_select_admin" ON visitor_logs;

CREATE POLICY "visitor_logs_select_admin" ON visitor_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'is_admin' = 'true'
    )
  );
