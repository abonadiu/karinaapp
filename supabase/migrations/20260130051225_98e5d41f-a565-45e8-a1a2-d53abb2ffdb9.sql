-- Create a security definer function to check if user is manager of a company
-- This avoids RLS recursion by bypassing RLS checks
CREATE OR REPLACE FUNCTION public.is_manager_of_company(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_managers
    WHERE company_id = _company_id
      AND user_id = auth.uid()
      AND status = 'active'
  )
$$;

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Managers can view their company" ON public.companies;

-- Create new policy using the security definer function
CREATE POLICY "Managers can view their company" 
ON public.companies 
FOR SELECT 
USING (public.is_manager_of_company(id));

-- Also fix the company_managers policies to avoid recursion
DROP POLICY IF EXISTS "Facilitators can view managers of their companies" ON public.company_managers;

-- Create a security definer function to check if user owns the company
CREATE OR REPLACE FUNCTION public.is_facilitator_of_company(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies
    WHERE id = _company_id
      AND facilitator_id = auth.uid()
  )
$$;

-- Recreate the policy using the function
CREATE POLICY "Facilitators can view managers of their companies" 
ON public.company_managers 
FOR SELECT 
USING (public.is_facilitator_of_company(company_id));

-- Fix the INSERT policy for company_managers
DROP POLICY IF EXISTS "Facilitators can create managers for their companies" ON public.company_managers;

CREATE POLICY "Facilitators can create managers for their companies" 
ON public.company_managers 
FOR INSERT 
WITH CHECK (public.is_facilitator_of_company(company_id) AND invited_by = auth.uid());

-- Fix the DELETE policy for company_managers  
DROP POLICY IF EXISTS "Facilitators can delete managers of their companies" ON public.company_managers;

CREATE POLICY "Facilitators can delete managers of their companies" 
ON public.company_managers 
FOR DELETE 
USING (public.is_facilitator_of_company(company_id));