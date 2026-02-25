import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

import courses from "../data/courses.json";
import roadmaps from "../data/roadmaps.json";
import homePage from "../data/homepage.json";

export const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding...");

    /* =========================
       1️⃣ Upload Courses
    ========================== */
    for (const course of courses) {
      if (!course.id) {
        console.warn("⚠️ Skipping course without ID:", course);
        continue;
      }

      await setDoc(doc(db, "courses", course.id), course);
      console.log(`✅ Course Uploaded: ${course.title}`);
    }

    /* =========================
       2️⃣ Upload Roadmaps
    ========================== */
    for (const roadmap of roadmaps) {
      if (!roadmap.id) {
        console.warn("⚠️ Skipping roadmap without ID:", roadmap);
        continue;
      }

      await setDoc(doc(db, "roadmaps", roadmap.id), roadmap);
      console.log(`✅ Roadmap Uploaded: ${roadmap.title}`);
    }

    /* =========================
       3️⃣ Upload Home Page
       (Document واحد فقط)
    ========================== */
    await setDoc(doc(db, "pages", "home"), homePage);
    console.log("✅ Home page uploaded successfully!");

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};
