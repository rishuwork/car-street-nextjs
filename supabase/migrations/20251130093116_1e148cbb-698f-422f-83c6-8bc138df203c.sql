-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'sales', 'manager');

-- Create enum for vehicle status
CREATE TYPE public.vehicle_status AS ENUM ('available', 'sold', 'pending');

-- Create enum for vehicle condition
CREATE TYPE public.vehicle_condition AS ENUM ('excellent', 'good', 'fair', 'needs_work');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin', 'manager')
  )
$$;

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic details
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  mileage INTEGER NOT NULL,
  color TEXT NOT NULL,
  vin TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Extended details
  transmission TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  drivetrain TEXT NOT NULL,
  engine TEXT,
  features TEXT[],
  
  -- Comprehensive details
  purchase_date DATE,
  purchase_cost DECIMAL(10, 2),
  location TEXT,
  condition_notes TEXT,
  service_history TEXT,
  condition vehicle_condition NOT NULL DEFAULT 'good',
  
  -- Status and metadata
  status vehicle_status NOT NULL DEFAULT 'available',
  sold_date DATE,
  sold_price DECIMAL(10, 2),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Create vehicle_images table
CREATE TABLE public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  vehicle_id UUID REFERENCES public.vehicles(id),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for vehicles (public read, admin write)
CREATE POLICY "Anyone can view available vehicles"
  ON public.vehicles FOR SELECT
  USING (status = 'available' OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update vehicles"
  ON public.vehicles FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete vehicles"
  ON public.vehicles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for vehicle_images (public read, admin write)
CREATE POLICY "Anyone can view vehicle images"
  ON public.vehicle_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE vehicles.id = vehicle_images.vehicle_id
    AND (vehicles.status = 'available' OR public.is_admin(auth.uid()))
  ));

CREATE POLICY "Admins can manage vehicle images"
  ON public.vehicle_images FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for contact_submissions (public insert, admin read/update)
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update submissions"
  ON public.contact_submissions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_featured ON public.vehicles(featured) WHERE featured = TRUE;
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_vehicle ON public.contact_submissions(vehicle_id);
CREATE INDEX idx_vehicle_images_vehicle ON public.vehicle_images(vehicle_id);