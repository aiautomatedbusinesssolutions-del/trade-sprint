import type { SprintData } from "@/lib/types";
import { generateMockSprintData } from "./mock-data";

export async function getSprintData(): Promise<SprintData> {
  // Always use mock data for now.
  // When ready to switch to Polygon.io, this function will call the API route instead.
  return generateMockSprintData();
}
