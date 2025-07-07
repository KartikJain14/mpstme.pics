"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface AdminPhotoProps {
  photoId: number;
  alt: string;
  className?: string;
  onError?: () => void;
}

export function AdminPhoto({
  photoId,
  alt,
  className,
  onError,
}: AdminPhotoProps) {
  const [src, setSrc] = useState<string>(() => {
    // For authenticated photo access, we need to handle this differently
    // We'll create an object URL from a fetch request
    return "/placeholder.svg";
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useState(() => {
    const fetchPhoto = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError(true);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/photos/${photoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        } else {
          setError(true);
          onError?.();
        }
      } catch (err) {
        setError(true);
        onError?.();
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();

    // Cleanup function to revoke object URL
    return () => {
      if (src !== "/placeholder.svg") {
        URL.revokeObjectURL(src);
      }
    };
  }, [photoId, onError]);

  if (error) {
    return <img src="/placeholder.svg" alt={alt} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        setError(true);
        onError?.();
      }}
    />
  );
}
