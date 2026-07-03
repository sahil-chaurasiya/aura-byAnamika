/**
 * Standalone seed script that renames the existing admin user (and the
 * `authorName` snapshot stored on their blog posts) from the old
 * "Glamics" branding to "Aura by Anamika".
 *
 * This ONLY updates:
 *   - the admin user's firstName / lastName / email (matched by the old
 *     email admin@glamics.com)
 *   - the `authorName` field on any Blog post whose author is that admin
 *     (authorName is a stored snapshot, not derived live from the user,
 *     so it has to be updated separately)
 *
 * It deliberately does NOT touch:
 *   - the admin's password
 *   - any products, orders, categories, other users, or other blog fields
 *   - it does NOT delete or recreate anything (unlike seed.js, this is
 *     non-destructive)
 *
 * Run with:   node utils/seedAdminName.js
 */
const path = require('path');
// Resolve .env relative to THIS file's location (server/.env), not the
// current working directory -- avoids silently connecting to the wrong
// database when the script is run from a different folder.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/glamics';

// Old -> new identity for the admin account
const OLD_EMAIL = 'admin@glamics.com';
const NEW_FIRST_NAME = 'Admin';
const NEW_LAST_NAME = 'Anamika';
const NEW_EMAIL = 'admin@aurabyanamika.com';
const NEW_AUTHOR_NAME = `${NEW_FIRST_NAME} ${NEW_LAST_NAME}`;

const run = async () => {
  console.log('🔌 Connecting using MONGO_URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const admin = await User.findOne({ email: OLD_EMAIL });
  if (!admin) {
    console.warn(`⚠️  No user found with email "${OLD_EMAIL}" — nothing to rename. ` +
      `If you already changed the admin email before, update OLD_EMAIL at the top of this script and re-run.`);
    process.exit(0);
  }

  const oldAuthorName = `${admin.firstName} ${admin.lastName}`;

  admin.firstName = NEW_FIRST_NAME;
  admin.lastName = NEW_LAST_NAME;
  admin.email = NEW_EMAIL;
  await admin.save();
  console.log(`✏️  Admin renamed: "${oldAuthorName}" (${OLD_EMAIL}) → "${NEW_AUTHOR_NAME}" (${NEW_EMAIL})`);

  const result = await Blog.updateMany(
    { author: admin._id },
    { $set: { authorName: NEW_AUTHOR_NAME } }
  );
  console.log(`✏️  Updated authorName on ${result.modifiedCount} blog post(s)`);

  console.log('\n✅ Done. Log in from now on with:');
  console.log(`   Email:    ${NEW_EMAIL}`);
  console.log(`   Password: (unchanged — whatever it already was)`);
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Admin rename failed:', err);
  process.exit(1);
});