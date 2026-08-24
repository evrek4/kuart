require('dotenv').config();
const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();
  const res = await client.query('UPDATE "Appointment" SET "staffId" = NULL WHERE "staffId" IS NOT NULL AND "staffId" NOT IN (SELECT id FROM "Staff")');
  console.log('Fixed orphan staffIds:', res.rowCount);
  await client.end();
}

fix().catch(console.error);
