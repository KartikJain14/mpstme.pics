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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Upload,
  Shield,
  Globe,
  Users,
  HardDrive,
  AlertTriangle,
  Key,
  Bell,
  Palette,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import type { Club } from "@/lib/types";

interface ClubSettings {
  name: string;
  bio: string;
  logo: string;
  isPublic: boolean;
  allowMemberUploads: boolean;
  autoApprovePhotos: boolean;
  maxPhotoSize: number; // in MB
  allowedFileTypes: string[];
  notificationSettings: {
    newPhotoUploads: boolean;
    newMembers: boolean;
    storageAlerts: boolean;
  };
  privacySettings: {
    showMemberCount: boolean;
    allowGuestViewing: boolean;
    requireLoginForDownload: boolean;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [settings, setSettings] = useState<ClubSettings>({
    name: "",
    bio: "",
    logo: "",
    isPublic: true,
    allowMemberUploads: false,
    autoApprovePhotos: true,
    maxPhotoSize: 10,
    allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
    notificationSettings: {
      newPhotoUploads: true,
      newMembers: true,
      storageAlerts: true,
    },
    privacySettings: {
      showMemberCount: true,
      allowGuestViewing: true,
      requireLoginForDownload: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "privacy" | "notifications" | "advanced"
  >("general");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getMyClub();
        if (response.success && response.data) {
          setClub(response.data);
          setSettings((prev) => ({
            ...prev,
            name: response.data!.name ?? "",
            bio: response.data!.bio ?? "",
            logo: response.data!.logo ?? "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch club data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, you would call an API to update club settings
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log("Settings saved:", settings);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file and get a URL
      setSettings((prev) => ({ ...prev, logo: file.name }));
    }
  };

  const formatFileSize = (mb: number) => {
    if (mb < 1024) return `${mb} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const getStorageUsagePercentage = () => {
    if (!club || !club.storageQuotaMb) return 0;
    return ((club.storageUsedMb || 0) / club.storageQuotaMb) * 100;
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "advanced", label: "Advanced", icon: Key },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-1">
            Manage your club's configuration and preferences
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-neutral-900 text-white hover:bg-neutral-800"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1 border-neutral-200 bg-white h-fit">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-neutral-100 text-neutral-900 font-medium"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic information about your club
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="clubName">Club Name</Label>
                  <Input
                    id="clubName"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter club name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clubBio">Club Description</Label>
                  <Textarea
                    id="clubBio"
                    value={settings.bio}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Describe your club and its activities"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clubLogo">Club Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-neutral-900 text-white flex items-center justify-center text-lg font-bold rounded-lg">
                      {settings.logo || club?.logo || "CL"}
                    </div>
                    <div>
                      <Button variant="outline" asChild>
                        <label htmlFor="logoUpload" className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New Logo
                        </label>
                      </Button>
                      <input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-neutral-600 mt-1">
                        Recommended: 256x256px, PNG or JPG
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Club</Label>
                    <p className="text-sm text-neutral-600">
                      Make your club discoverable to the public
                    </p>
                  </div>
                  <Switch
                    checked={settings.isPublic}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, isPublic: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Member Uploads</Label>
                    <p className="text-sm text-neutral-600">
                      Allow club members to upload photos
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMemberUploads}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        allowMemberUploads: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can access your club and its content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Guest Viewing</Label>
                    <p className="text-sm text-neutral-600">
                      Let non-members view public albums
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacySettings.allowGuestViewing}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        privacySettings: {
                          ...prev.privacySettings,
                          allowGuestViewing: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Login for Downloads</Label>
                    <p className="text-sm text-neutral-600">
                      Users must be logged in to download photos
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacySettings.requireLoginForDownload}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        privacySettings: {
                          ...prev.privacySettings,
                          requireLoginForDownload: checked,
                        },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure when you receive email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Photo Uploads</Label>
                    <p className="text-sm text-neutral-600">
                      Get notified when members upload new photos
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationSettings.newPhotoUploads}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          newPhotoUploads: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Members</Label>
                    <p className="text-sm text-neutral-600">
                      Get notified when someone joins your club
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationSettings.newMembers}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          newMembers: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Storage Alerts</Label>
                    <p className="text-sm text-neutral-600">
                      Get notified when approaching storage limits
                    </p>
                  </div>
                  <Switch
                    checked={settings.notificationSettings.storageAlerts}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notificationSettings: {
                          ...prev.notificationSettings,
                          storageAlerts: checked,
                        },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          {activeTab === "advanced" && (
            <Card className="border-neutral-200 bg-white">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Technical configuration and limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="maxPhotoSize">Maximum Photo Size (MB)</Label>
                  <Select
                    value={settings.maxPhotoSize.toString()}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        maxPhotoSize: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maximum file size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 MB</SelectItem>
                      <SelectItem value="10">10 MB</SelectItem>
                      <SelectItem value="25">25 MB</SelectItem>
                      <SelectItem value="50">50 MB</SelectItem>
                      <SelectItem value="100">100 MB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-approve Photos</Label>
                    <p className="text-sm text-neutral-600">
                      Automatically approve member photo uploads
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoApprovePhotos}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        autoApprovePhotos: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Storage Overview */}
          <Card className="border-neutral-200 bg-white">
            <CardHeader>
              <CardTitle>Storage Overview</CardTitle>
              <CardDescription>
                Monitor your club's storage usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {club && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-neutral-900">
                      Storage Used
                    </span>
                    <span className="text-sm text-neutral-600">
                      {formatFileSize(club.storageUsedMb || 0)} of{" "}
                      {formatFileSize(club.storageQuotaMb)}
                    </span>
                  </div>
                  <div className="bg-neutral-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        getStorageUsagePercentage() > 80
                          ? "bg-red-500"
                          : "bg-neutral-900"
                      }`}
                      style={{
                        width: `${Math.min(getStorageUsagePercentage(), 100)}%`,
                      }}
                    />
                  </div>
                  {getStorageUsagePercentage() > 80 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        You're running low on storage space. Consider upgrading
                        your plan or cleaning up old files.
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-white">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Delete Club
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your club, all albums, photos, and member data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                      Yes, delete club
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
