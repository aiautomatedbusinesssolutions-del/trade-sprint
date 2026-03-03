"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WelcomeScreen } from "@/components/screens/welcome-screen";
import { LoadingScreen } from "@/components/screens/loading-screen";
import { useSprintStore } from "@/lib/store/sprint-store";
import { getSprintData } from "@/lib/services/data-provider";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializeSprint = useSprintStore((s) => s.initializeSprint);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSprintData();
      initializeSprint(data);
      router.push("/dashboard");
    } catch {
      setIsLoading(false);
      setError("Failed to load stock data. Please try again.");
    }
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <WelcomeScreen onStart={handleStart} isLoading={isLoading} error={error} />
    </>
  );
}
