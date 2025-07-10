"use client";

import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, user } = useAuth();

  // Handle redirection when user changes (login or on page load)
  useEffect(() => {
    if (user) {
      // Get redirect URL if it exists
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get("redirect");

      // Redirect based on user role with hard navigation
      let targetPath;
      if (user.role === "superadmin") {
        targetPath = redirectPath
          ? decodeURIComponent(redirectPath)
          : "/dashboard/superadmin";
      } else if (user.role === "clubadmin") {
        targetPath = redirectPath
          ? decodeURIComponent(redirectPath)
          : "/dashboard/clubadmin";
      } else {
        targetPath = redirectPath
          ? decodeURIComponent(redirectPath)
          : "/dashboard";
      }

      // Use window.location for hard navigation
      window.location.href = targetPath;
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid email or password");
      }
      // The redirect will happen automatically via the useEffect
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-semibold text-neutral-900">
            mpstme.pics
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-semibold text-neutral-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-neutral-600">
              Sign in to manage your club's photo gallery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-neutral-900"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-neutral-200 focus:border-neutral-400 focus:ring-0"
                  placeholder="admin@club.edu"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-neutral-900"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-neutral-200 focus:border-neutral-400 focus:ring-0"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-600 mb-2">Demo credentials:</p>
              <div className="text-xs text-neutral-500 space-y-1">
                <div>Superadmin: superadmin@mpstme.edu / password123</div>
                <div>Club Admin: admin@csi.edu / password123</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            ← Back to gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
