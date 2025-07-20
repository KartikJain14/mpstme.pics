import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";

interface AuthenticatedImageProps {
  photoId: number;
  alt: string;
  className?: string;
  onError?: (error: any) => void;
}

export function AuthenticatedImage({
  photoId,
  alt,
  className,
  onError,
}: AuthenticatedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>("/placeholder.svg");
  const [loading, setLoading] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [photoId]);

  useEffect(() => {
    if (!shouldLoad) return;
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setImageSrc("/placeholder.svg");
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/${photoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          setImageSrc(imageUrl);
        } else {
          setImageSrc("/placeholder.svg");
          onError?.(new Error(`Failed to load image: ${response.status}`));
        }
      } catch (error) {
        setImageSrc("/placeholder.svg");
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
    // Cleanup function to revoke object URL
    return () => {
      if (imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [shouldLoad, photoId, onError]);

  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`${className} flex items-center justify-center bg-neutral-100`}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-400"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg";
          onError?.(new Error("Image failed to load"));
        }}
      />
    </div>
  );
}
