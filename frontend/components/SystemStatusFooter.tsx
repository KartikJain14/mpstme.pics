"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function SystemStatusFooter() {
  const [systemStatus, setSystemStatus] = useState<
    "CHECKING" | "OPERATIONAL" | "ERROR"
  >("CHECKING");
  const [lastHealthCheck, setLastHealthCheck] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.getHealth();
        if (response.success && response.data?.status === "ok") {
          setSystemStatus("OPERATIONAL");
          setLastHealthCheck(response.data.time);
        } else {
          setSystemStatus("ERROR");
        }
      } catch (error) {
        setSystemStatus("ERROR");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-t bg-secondary/10 mt-20">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div>© 2025 MPSTME.PICS</div>
          <div className="flex items-center gap-4">
            <span>SYSTEM STATUS: {systemStatus}</span>
            <div
              className={`w-2 h-2 rounded-full ${
                systemStatus === "OPERATIONAL"
                  ? "bg-emerald-300"
                  : systemStatus === "ERROR"
                  ? "bg-red-400"
                  : "bg-yellow-400 animate-pulse"
              }`}
            ></div>
            {lastHealthCheck && systemStatus === "OPERATIONAL" && (
              <span className="text-[10px] opacity-60">
                Last check: {new Date(lastHealthCheck).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
