-- Create storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-images',
  'vehicle-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- RLS policies for vehicle images bucket
CREATE POLICY "Anyone can view vehicle images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-images');

CREATE POLICY "Admins can upload vehicle images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vehicle-images' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can update vehicle images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vehicle-images' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can delete vehicle images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vehicle-images' 
  AND is_admin(auth.uid())
);