require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shikor-showpno';

const UserSchema = new mongoose.Schema(
  { name: String, email: { type: String, unique: true }, password: String, role: String, status: String, isReviewer: { type: Boolean, default: false } },
  { timestamps: true }
);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({ key: String, value: String }));

const USERS = [
  { name: 'Rafi Ahmed',    email: 'member@shikor.com',  password: 'member123', role: 'member', status: 'active' },
  { name: 'Tahmina Khan',  email: 'member2@shikor.com', password: 'member123', role: 'member', status: 'active' },
  { name: 'Karim Hossain', email: 'member3@shikor.com', password: 'member123', role: 'member', status: 'active' },
  { name: 'Nasrin Akter',  email: 'member4@shikor.com', password: 'member123', role: 'member', status: 'active' },
  { name: 'Team Reviewer', email: 'reviewer@shikor.com', password: 'reviewer123', role: 'member', isReviewer: true, status: 'active' },
  { name: 'Admin User',    email: 'admin@shikor.com',   password: 'admin123',  role: 'admin',  status: 'active' },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  // Wipe existing data
  await User.deleteMany({});
  await Settings.deleteMany({});
  console.log('🗑  Cleared users + settings');

  for (const u of USERS) {
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`✅ Created: ${u.email} (${u.role}${u.isReviewer ? ', reviewer' : ''})`);
  }

  console.log('\n🌱 Seed complete!\n');
  console.log('Demo credentials:');
  console.log('  member@shikor.com  / member123');
  console.log('  reviewer@shikor.com / reviewer123');
  console.log('  admin@shikor.com   / admin123');
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
