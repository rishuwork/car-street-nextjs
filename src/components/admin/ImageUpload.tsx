import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  vehicleId: string;
  onImagesUploaded: () => void;
}

export function ImageUpload({ vehicleId, onImagesUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const uploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${vehicleId}/${Math.random()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("vehicle-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase.from("vehicle_images").insert({
        vehicle_id: vehicleId,
        image_url: data.publicUrl,
        display_order: 0,
      });

      if (dbError) throw dbError;
    });

    try {
      await Promise.all(uploadPromises);
      toast.success(`${files.length} image(s) uploaded successfully`);
      onImagesUploaded();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      setDragActive(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const { files } = e.dataTransfer;
      uploadImages(files);
    },
    [vehicleId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    uploadImages(e.target.files);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50"
        }`}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="p-4 rounded-full bg-primary/10">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {uploading ? "Uploading..." : "Drop images here or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WEBP up to 5MB
          </p>
        </div>
      </div>
    </div>
  );
}

interface VehicleImagesProps {
  vehicleId: string;
  images: Array<{ id: string; image_url: string; is_primary: boolean }>;
  onImagesChanged: () => void;
}

export function VehicleImages({
  vehicleId,
  images,
  onImagesChanged,
}: VehicleImagesProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState(images);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync local state when parent refreshes (but not while dragging)
  if (images !== localImages && !draggingId) {
    setLocalImages(images);
  }

  const deleteImage = async (imageId: string, imageUrl: string) => {
    setDeleting(imageId);
    try {
      // Extract filename from URL
      const fileName = imageUrl.split("/vehicle-images/")[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("vehicle-images")
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("vehicle_images")
        .delete()
        .eq("id", imageId);

      if (dbError) throw dbError;

      toast.success("Image deleted");
      onImagesChanged();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    try {
      // Reset all images for this vehicle
      await supabase
        .from("vehicle_images")
        .update({ is_primary: false })
        .eq("vehicle_id", vehicleId);

      // Set the selected one as primary
      const { error } = await supabase
        .from("vehicle_images")
        .update({ is_primary: true })
        .eq("id", imageId);

      if (error) throw error;

      toast.success("Primary image updated");
      onImagesChanged();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to set primary image");
    }
  };

  // --- Drag-and-drop reorder ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggingId) setDragOverId(id);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    setDraggingId(null);

    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;

    // Optimistic reorder
    const reordered = [...localImages];
    const sourceIdx = reordered.findIndex((img) => img.id === sourceId);
    const targetIdx = reordered.findIndex((img) => img.id === targetId);
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setLocalImages(reordered);

    // Persist to Supabase
    setSaving(true);
    try {
      await Promise.all(
        reordered.map((img, idx) =>
          supabase
            .from("vehicle_images")
            .update({ display_order: idx })
            .eq("id", img.id)
        )
      );
      toast.success("Image order saved");
      onImagesChanged();
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to save order");
      setLocalImages(images); // revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  if (localImages.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No images uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="text-base leading-none">⠿</span>
        Drag images to reorder — first image shows on listings.
        {saving && <span className="text-primary font-medium ml-1">Saving...</span>}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {localImages.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={(e) => handleDragStart(e, image.id)}
            onDragOver={(e) => handleDragOver(e, image.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, image.id)}
            onDragEnd={handleDragEnd}
            className={`relative group rounded-lg transition-all duration-150 cursor-grab active:cursor-grabbing ${draggingId === image.id ? "opacity-40 scale-95" : "opacity-100"
              } ${dragOverId === image.id
                ? "ring-2 ring-primary ring-offset-2 scale-[1.03]"
                : ""
              }`}
          >
            {/* Order badge + drag handle */}
            <div className="absolute top-2 left-2 z-10">
              <div className="bg-black/60 text-white rounded px-1.5 py-0.5 text-xs select-none flex items-center gap-1">
                <span>⠿</span>
                <span>{index + 1}</span>
              </div>
            </div>

            <img
              src={image.image_url}
              alt="Vehicle"
              className="w-full aspect-[4/3] object-cover rounded-lg pointer-events-none"
            />

            {image.is_primary && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Primary
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              {!image.is_primary && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPrimaryImage(image.id)}
                >
                  Set Primary
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteImage(image.id, image.image_url)}
                disabled={deleting === image.id}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
