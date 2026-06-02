/*
  # Fix set_admin_pin function and set initial admin PIN

  ## Changes
  - Uses extensions.crypt and extensions.gen_salt since pgcrypto is in 'extensions' schema
  - Fixes DELETE with WHERE clause
  - Sets initial admin PIN hashed with bcrypt
*/

CREATE OR REPLACE FUNCTION set_admin_pin(new_pin text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  DELETE FROM admin_config WHERE id IS NOT NULL;
  INSERT INTO admin_config (pin_hash) VALUES (extensions.crypt(new_pin, extensions.gen_salt('bf')));
END;
$$;

CREATE OR REPLACE FUNCTION verify_admin_pin(input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT pin_hash INTO stored_hash FROM admin_config LIMIT 1;
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  RETURN (extensions.crypt(input_pin, stored_hash) = stored_hash);
END;
$$;

SELECT set_admin_pin('0330');
