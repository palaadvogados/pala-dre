import { Pool } from "pg"

const connectionString =
  process.env["DATABASE_URL"] ??
  "postgres://atendimento:08b322d9cfe1312e1708a695c4ce85cb5573003509056e55@72.60.155.16:55432/pala_dre?sslmode=disable"

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})
