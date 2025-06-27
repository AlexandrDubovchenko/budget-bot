// Need a single client?:
import { createPool } from '@vercel/postgres';
export const dbpool = createPool({
  /* config */
  connectionString: process.env.DB_STRING
});

