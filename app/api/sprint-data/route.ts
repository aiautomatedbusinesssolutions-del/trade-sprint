import { NextResponse } from "next/server";
import { generateMockSprintData } from "@/lib/services/mock-data";
import { fetchTiingoSprintData } from "@/lib/services/tiingo";

export async function GET() {
  try {
    const useMock = process.env.USE_MOCK_DATA === "true";

    if (useMock || !process.env.TIINGO_API_KEY) {
      const data = generateMockSprintData();
      return NextResponse.json({ ...data, isMockData: true });
    }

    const data = await fetchTiingoSprintData();
    return NextResponse.json({ ...data, isMockData: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sprint data error:", message, "— falling back to mock data");

    // Fallback to mock data if Tiingo fails (rate limit, network error, etc.)
    try {
      const fallback = generateMockSprintData();
      return NextResponse.json({ ...fallback, isMockData: true });
    } catch {
      return NextResponse.json(
        { error: "Failed to generate sprint data", details: message },
        { status: 500 }
      );
    }
  }
}
