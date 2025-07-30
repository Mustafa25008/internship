-- Fix function search path for security
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- The function is already using SECURITY DEFINER SET search_path = '' so it's secure
-- Just updating the existing function to be explicit about search path