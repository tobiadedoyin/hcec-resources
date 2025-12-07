const fs = require('fs');
const { MongoClient } = require('mongodb');

async function load() {
  const data = JSON.parse(fs.readFileSync('./dummyData.json', 'utf8'));

  const uri = "mongodb+srv://tobi:tobiadedoyin@cluster0.8jfxabh.mongodb.net/hcec";

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('hcec');
    const col = db.collection('dailyhoneys');

    const result = await col.insertMany(data);
    console.log(`✅ Inserted ${result.insertedCount} hymns`);
  } catch (err) {
    console.error('❌ Error inserting data:', err);
  } finally {
    await client.close();
  }
}

load();
