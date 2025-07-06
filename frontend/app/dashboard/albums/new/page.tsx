"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { ArrowLeft, Save, Upload, ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewAlbumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Album name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Album name must be at least 3 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.createAlbum({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      if (response.success) {
        router.push("/dashboard/albums");
      } else {
        setErrors({ submit: response.error || "Failed to create album" });
      }
    } catch (error) {
      setErrors({ submit: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/albums">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Albums
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Create New Album
          </h1>
          <p className="text-muted-foreground mt-1">
            Add a new photo album to your club's gallery
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card className="border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Album Details
            </CardTitle>
            <CardDescription>
              Provide basic information about your new album. You can upload
              photos after creating the album.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Album Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Album Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter album name (e.g., 'Annual Sports Day 2024')"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Album Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe this album and the event or occasion it captures..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className={errors.description ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground ml-auto">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Privacy Settings
                </Label>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Public Album</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this album visible to all club members and visitors
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      handleInputChange("isPublic", checked)
                    }
                  />
                </div>
                {!formData.isPublic && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <strong>Private Album:</strong> Only club administrators
                      will be able to view and manage this album.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Errors */}
              {errors.submit && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating Album..." : "Create Album"}
                </Button>
                <Link href="/dashboard/albums">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Next Steps Info */}
        <Card className="border bg-card mt-6">
          <CardHeader>
            <CardTitle className="text-base">What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Upload Photos</p>
                  <p>
                    After creating the album, you can upload photos directly
                    from the album page.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Organize Content
                  </p>
                  <p>
                    Add captions, set privacy for individual photos, and
                    organize your content.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Share & Enjoy</p>
                  <p>
                    Share your album with club members and let them enjoy the
                    memories you've captured.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
