
-- Drop existing policies that are causing infinite recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a security definer function to check user roles safely
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = $1 LIMIT 1;
$$;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = $1 AND role = 'admin');
$$;

-- Create new policies without recursion
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all roles (using function to avoid recursion)
CREATE POLICY "Service role can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (auth.role() = 'service_role');
