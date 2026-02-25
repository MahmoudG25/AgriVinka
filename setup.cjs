require('dotenv').config();
const admin = require('firebase-admin');

// Ensure you have downloaded your serviceAccountKey.json 
// from Firebase Console -> Project settings -> Service accounts
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
  console.error('\n❌ ERROR: Please download your Firebase Service Account JSON file as instructed.');
  console.error('Save it as "serviceAccountKey.json" in the root directory next to this script.\n');
  process.exit(1);
}

// 1. INITIALIZE ADMIN SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Variables you can change before running
const ADMIN_EMAIL = 'admin@namaa.academy';
const ADMIN_PASSWORD = 'password123';
const ADMIN_DISPLAY_NAME = 'مدير النظام';

async function bootstrapDatabase() {
  console.log('🚀 Starting Namaa Academy Database Setup...\n');

  // --- Step 1: Create Admin User ---
  console.log('1️⃣ Creating Admin User...');
  let adminUid;
  try {
    // Check if user already exists
    const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
    adminUid = userRecord.uid;
    console.log(`✅ Admin user already exists with UID: ${adminUid}`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_DISPLAY_NAME,
        emailVerified: true
      });
      adminUid = userRecord.uid;
      console.log(`✅ Admin user created successfully with UID: ${adminUid}`);
      console.log(`📧 Email: ${ADMIN_EMAIL}`);
      console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    } else {
      console.error('❌ Error creating user:', error);
      process.exit(1);
    }
  }

  // --- Step 2: Set Admin Document in Firestore ---
  console.log('\n2️⃣ Setting Admin Role in Database...');
  try {
    const userRef = db.collection('users').doc(adminUid);
    await userRef.set({
      uid: adminUid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_DISPLAY_NAME,
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`✅ User profile created with 'admin' role.`);
  } catch (err) {
    console.error('❌ Error setting user document:', err);
  }

  // --- Step 3: Seed Global Theme Config ---
  console.log('\n3️⃣ Seeding Global Site Configuration...');
  try {
    const configRef = db.collection('siteConfig').doc('global');
    await configRef.set({
      colors: {
        primary: '#059669', // Default green
        secondary: '#D97706', // Default amber
      },
      typography: {
        scale: 1,
      },
      status: 'published',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Global theme settings seeded.`);
  } catch (err) {
    console.error('❌ Error seeding config:', err);
  }

  // --- Step 4: Seed Homepage Structure (from Page Builder Registry) ---
  console.log('\n4️⃣ Seeding Default Homepage Layout...');
  try {
    const homeRef = db.collection('pages').doc('home');
    const defaultHomeDoc = await homeRef.get();

    if (!defaultHomeDoc.exists) {
      await homeRef.set({
        title: 'الرئيسية',
        sections: [
          {
            id: 'sec_1700000000000',
            type: 'hero',
            data: {
              title: 'أكاديمية نماء للتعليم التقني',
              subtitle: 'بدل ما تضيع سنين في التشتت، ابدأ بمسار واضح وشامل يوصلك لهدفك مع أفضل الخبراء.',
              badge: '🚀 الاستثمار الأفضل لمستقبلك',
              ctaText: 'ابدأ دراستك الآن'
            }
          },
          {
            id: 'sec_1700000000001',
            type: 'featuredCourses',
            data: {} // Default empty is fine, UI fetches actual courses
          }
        ],
        seo: {
          metaTitle: 'أكاديمية نماء للتعليم التقني',
          metaDescription: 'منصة التدريب التقني الرائدة',
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Default Homepage sections created.`);
    } else {
      console.log(`✅ Homepage data already exists, skipping.`);
    }
  } catch (err) {
    console.error('❌ Error seeding homepage:', err);
  }

  console.log('\n🎉 Setup Complete!');
  console.log('You can now log in to the website:');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  process.exit(0);
}

bootstrapDatabase();
