"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.replace("/login");
          return;
        }
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${baseUrl}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });
        if (!res.ok) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }
        const data = await res.json();
        const role = data?.user?.role;
        if (!role || !allowedRoles.includes(role)) {
          router.replace("/login");
          return;
        }
        setAuthorized(true);
      } catch (e) {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };
    checkAuth();

  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return <>{children}</>;
}