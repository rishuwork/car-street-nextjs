import { useState } from "react";
import { cn } from "@/lib/utils";

// Helper to optimize Supabase URLs
export const getSupabaseOptimizedUrl = (url: string, width?: number, height?: number, quality = 90) => {
    if (!url) return url;

    // Check if it's a Supabase Storage URL
    if (url.includes("supabase.co/storage/v1/object/public")) {
        const params = new URLSearchParams();
        if (width) params.append("width", width.toString());
        if (height) params.append("height", height.toString());
        params.append("quality", quality.toString());
        params.append("format", "webp");
        params.append("resize", "cover");

        // Switch from /object/public to /render/image/public to enable on-the-fly transformations
        const renderUrl = url.replace("/object/public", "/render/image/public");

        return `${renderUrl}?${params.toString()}`;
    }

    return url;
};

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    className?: string;
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    quality = 90,
    className,
    skipAnimation = false,
    ...props
}: OptimizedImageProps & { skipAnimation?: boolean }) {
    const [error, setError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const optimizedUrl = getSupabaseOptimizedUrl(src, width, height, quality);

    return (
        <img
            src={error ? src : optimizedUrl}
            alt={alt}
            width={width}
            height={height}
            loading={props.loading || "lazy"}
            className={cn(
                !skipAnimation && "transition-opacity duration-500 ease-out",
                !skipAnimation ? (isLoaded ? "opacity-100" : "opacity-0") : "",
                className
            )}
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
                setError(true);
                setIsLoaded(true);
                // Fallback to original src if transformation fails
                e.currentTarget.src = src;
            }}
            {...props}
        />
    );
}

