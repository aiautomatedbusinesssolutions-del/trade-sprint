import { sql } from "@vercel/postgres";

let initialized = false;

export async function ensureTable() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id             SERIAL PRIMARY KEY,
      player_name    VARCHAR(30)    NOT NULL,
      return_percent NUMERIC(10,4)  NOT NULL,
      final_value    NUMERIC(12,2)  NOT NULL,
      trade_count    INTEGER        NOT NULL,
      year_traded    INTEGER        NOT NULL,
      archetype      VARCHAR(60)    NOT NULL,
      is_mock_data   BOOLEAN        NOT NULL DEFAULT false,
      created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_return
    ON leaderboard_entries (is_mock_data, return_percent DESC)
  `;
  initialized = true;
}

export { sql };
