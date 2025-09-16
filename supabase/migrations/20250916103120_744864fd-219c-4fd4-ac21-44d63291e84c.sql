-- Add address fields to profiles table for user address validation
ALTER TABLE public.profiles 
ADD COLUMN door_number TEXT,
ADD COLUMN street TEXT,
ADD COLUMN area TEXT,
ADD COLUMN city TEXT,
ADD COLUMN pincode TEXT;

-- Create index for address validation lookup
CREATE INDEX idx_profiles_address ON public.profiles (door_number, street, area, city, pincode) 
WHERE door_number IS NOT NULL AND street IS NOT NULL AND area IS NOT NULL AND city IS NOT NULL AND pincode IS NOT NULL;

-- Create function to check if address already exists
CREATE OR REPLACE FUNCTION public.check_address_exists(
  _door_number TEXT,
  _street TEXT,
  _area TEXT,
  _city TEXT,
  _pincode TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE door_number = _door_number
      AND street = _street
      AND area = _area
      AND city = _city
      AND pincode = _pincode
  )
$$;