const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crime_predictor';

async function check() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('crimes');
  const result = await col.aggregate([
    { $group: { _id: '$State_UT_Name', region: { $first: '$Region' }, zone: { $first: '$Zone' } } },
    { $sort: { _id: 1 } }
  ]).toArray();
  const map = {};
  result.forEach(r => { map[r._id] = { region: r.region, zone: r.zone }; });
  console.log('Bihar:', JSON.stringify(map['Bihar']));
  console.log('Maharashtra:', JSON.stringify(map['Maharashtra']));
  console.log('Total states mapped:', Object.keys(map).length);
  await mongoose.disconnect();
}
check().catch(console.error);
