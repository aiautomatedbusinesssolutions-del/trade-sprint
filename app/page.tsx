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
  const initializeSprint = useSprintStore((s) => s.initializeSprint);

  const handleStart = async () => {
    setIsLoading(true);
    const data = await getSprintData();
    initializeSprint(data);
    router.push("/dashboard");
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <WelcomeScreen onStart={handleStart} isLoading={isLoading} />
    </>
  );
}
