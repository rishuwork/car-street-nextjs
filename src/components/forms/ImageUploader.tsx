import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X, Upload } from "lucide-react";

interface ImageUploaderProps {
    onImagesChange: (urls: string[]) => void;
    existingImages: string[];
}

export function ImageUploader({ onImagesChange, existingImages }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        for (const file of files) {
            if (!file.type.startsWith("image/")) continue;

            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `sell-requests/${fileName}`; // Folder organization

            try {
                // We reuse the existing 'vehicle-images' bucket for convenience 
                // assuming it has public write access or we are authenticated.
                // Actually, for lead submission, unauthenticated users might need upload permission.
                // This usually requires a specific bucket policy. 
                // If this fails, we catch it.
                const { error: uploadError } = await supabase.storage
                    .from("vehicle-images")
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from("vehicle-images")
                    .getPublicUrl(filePath);

                newUrls.push(publicUrl);
            } catch (err) {
                console.error("Unexpected upload error:", err);
            }
        }

        onImagesChange([...existingImages, ...newUrls]);
        setUploading(false);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (indexToRemove: number) => {
        onImagesChange(existingImages.filter((_, i) => i !== indexToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((url, index) => (
                    <div key={index} className="relative group aspect-[4/3] rounded-lg overflow-hidden border">
                        <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-100 hover:bg-black/70 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg aspect-[4/3] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                    {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Add Photos</span>
                        </>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
            />
            <p className="text-xs text-muted-foreground">
                * Note: Uploads might fail if not logged in depending on Supabase policies.
            </p>
        </div>
    );
}
