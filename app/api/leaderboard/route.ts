import { NextResponse } from "next/server";
import { ensureTable, sql } from "@/lib/services/db";

export async function GET(req: Request) {
  try {
    await ensureTable();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);
    const mock = searchParams.get("mock") || "include";

    let result;
    if (mock === "exclude") {
      result = await sql`
        SELECT id, player_name, return_percent, final_value, trade_count,
               year_traded, archetype, is_mock_data, created_at
        FROM leaderboard_entries
        WHERE is_mock_data = false
        ORDER BY return_percent DESC
        LIMIT ${limit}
      `;
    } else if (mock === "only") {
      result = await sql`
        SELECT id, player_name, return_percent, final_value, trade_count,
               year_traded, archetype, is_mock_data, created_at
        FROM leaderboard_entries
        WHERE is_mock_data = true
        ORDER BY return_percent DESC
        LIMIT ${limit}
      `;
    } else {
      result = await sql`
        SELECT id, player_name, return_percent, final_value, trade_count,
               year_traded, archetype, is_mock_data, created_at
        FROM leaderboard_entries
        ORDER BY return_percent DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({ entries: result.rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch leaderboard", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureTable();

    const body = await req.json();
    const { playerName, returnPercent, finalValue, tradeCount, yearTraded, archetype, isMockData } = body;

    if (typeof playerName !== "string" || playerName.trim().length === 0 || playerName.trim().length > 30) {
      return NextResponse.json({ error: "Player name must be 1-30 characters" }, { status: 400 });
    }
    if (typeof returnPercent !== "number" || !isFinite(returnPercent)) {
      return NextResponse.json({ error: "Invalid return percent" }, { status: 400 });
    }
    if (typeof finalValue !== "number" || !isFinite(finalValue) || finalValue < 0) {
      return NextResponse.json({ error: "Invalid final value" }, { status: 400 });
    }
    if (typeof tradeCount !== "number" || tradeCount < 0 || !Number.isInteger(tradeCount)) {
      return NextResponse.json({ error: "Invalid trade count" }, { status: 400 });
    }
    if (typeof yearTraded !== "number" || yearTraded < 1990 || yearTraded > 2030) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    if (typeof archetype !== "string" || archetype.trim().length === 0 || archetype.trim().length > 60) {
      return NextResponse.json({ error: "Invalid archetype" }, { status: 400 });
    }
    if (returnPercent > 10000 || returnPercent < -100) {
      return NextResponse.json({ error: "Return percent out of plausible range" }, { status: 400 });
    }

    const sanitizedName = playerName.trim().slice(0, 30);
    const sanitizedArchetype = archetype.trim().slice(0, 60);

    const result = await sql`
      INSERT INTO leaderboard_entries (player_name, return_percent, final_value, trade_count, year_traded, archetype, is_mock_data)
      VALUES (${sanitizedName}, ${returnPercent}, ${finalValue}, ${tradeCount}, ${yearTraded}, ${sanitizedArchetype}, ${!!isMockData})
      RETURNING id, player_name, return_percent, created_at
    `;

    return NextResponse.json({ entry: result.rows[0] }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to submit score", details: message },
      { status: 500 }
    );
  }
}
