-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facilitator_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  total_licenses INTEGER NOT NULL DEFAULT 0,
  used_licenses INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  facilitator_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  position TEXT,
  access_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'in_progress', 'completed')),
  invited_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS policies for companies
CREATE POLICY "Facilitators can view their own companies"
ON public.companies FOR SELECT
USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can create their own companies"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can update their own companies"
ON public.companies FOR UPDATE
USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can delete their own companies"
ON public.companies FOR DELETE
USING (auth.uid() = facilitator_id);

-- Enable RLS on participants
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for participants
CREATE POLICY "Facilitators can view their own participants"
ON public.participants FOR SELECT
USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can create their own participants"
ON public.participants FOR INSERT
WITH CHECK (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can update their own participants"
ON public.participants FOR UPDATE
USING (auth.uid() = facilitator_id);

CREATE POLICY "Facilitators can delete their own participants"
ON public.participants FOR DELETE
USING (auth.uid() = facilitator_id);

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_participants_updated_at
BEFORE UPDATE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_companies_facilitator_id ON public.companies(facilitator_id);
CREATE INDEX idx_participants_company_id ON public.participants(company_id);
CREATE INDEX idx_participants_facilitator_id ON public.participants(facilitator_id);
CREATE INDEX idx_participants_status ON public.participants(status);