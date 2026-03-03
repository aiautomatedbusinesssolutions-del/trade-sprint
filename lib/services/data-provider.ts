import type { SprintData } from "@/lib/types";

export async function getSprintData(): Promise<SprintData> {
  const res = await fetch("/api/sprint-data");
  if (!res.ok) {
    throw new Error("Failed to fetch sprint data");
  }
  return res.json();
}
