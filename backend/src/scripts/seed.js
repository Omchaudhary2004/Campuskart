import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool } from "../db.js";

dotenv.config();

const categories = [
  "Assignment Help",
  "Tutoring",
  "Design & Creative",
  "Programming",
  "Content Writing",
  "Video Editing",
  "Research",
  "Presentation",
  "Data Entry",
  "Campus Events",
];

const tagSets = [
  ["urgent", "ieee", "latex"],
  ["python", "pandas"],
  ["figma", "ui"],
  ["react", "nodejs"],
  ["hindi", "english"],
  ["premiere", "shorts"],
  ["spss", "stats"],
  ["powerpoint", "canva"],
  ["excel", "sheets"],
  ["marketing", "poster"],
];

function taskTitle(i) {
  const samples = [
    "Need help with DSA assignment (trees & graphs)",
    "Proofread SOP for masters application",
    "Create Instagram reels for college fest",
    "Build a simple attendance tracker in Excel",
    "1-on-1 calculus tutoring before end-sem",
    "Research summary on renewable energy policy",
    "Logo for technical club — minimal, modern",
    "React dashboard for internal hackathon",
    "Translate lab manual EN → HI",
    "Poster design for Model UN event",
    "Python script to scrape public internship listings",
    "Video edit: guest lecture highlights (45 min raw)",
    "PPT deck for entrepreneurship pitch",
    "Literature review chapter on ML fairness",
    "Canva templates for society newsletters",
    "Debug my MERN project deployment on VPS",
    "Data cleaning for survey (n≈500)",
    "Teach basics of SQL for placement prep",
    "Whiteboard animation for awareness campaign",
    "Campus map illustration (vector)",
  ];
  return `${samples[i % samples.length]} — #${i + 1}`;
}

function descriptionFor(i) {
  return `CampusKart seeded task ${i + 1}. Looking for reliable students. Deliverables and timeline to be aligned after bid acceptance. Budget indicative; quality and communication matter.`;
}

async function main() {
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash("demo1234", 10);
    const adminEmail = "admin@university.ac.in";
    const studentEmail = "student@university.ac.in";
    const clientEmail = "client@gmail.com";

    const ensureUser = async (email, role, name, inr = 0, cc = 0) => {
      const ex = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
      if (ex.rows.length) return ex.rows[0].id;
      const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, role, name, avatar_url)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [email, hash, role, name, avatar]
      );
      const id = rows[0].id;
      await client.query(
        `INSERT INTO user_balances (user_id, balance_inr, balance_cc) VALUES ($1,$2,$3)`,
        [id, inr, cc]
      );
      return id;
    };

    await ensureUser(adminEmail, "admin", "Campus Admin", 0, 0);
    await ensureUser(studentEmail, "student", "Priya Sharma", 0, 200);
    await ensureUser(clientEmail, "client", "Rahul Verma", 75000, 500);

    const { rows: mc } = await client.query(`SELECT COUNT(*)::int AS c FROM tasks`);
    const start = mc[0].c;
    const need = Math.max(0, 120 - start);

    const { rows: cu } = await client.query(`SELECT id FROM users WHERE email = $1`, [clientEmail]);
    const clientUserId = cu[0].id;

    for (let i = 0; i < need; i++) {
      const globalIndex = start + i;
      const cat = categories[globalIndex % categories.length];
      const budget = 500 + (globalIndex % 40) * 250;
      const safeImage = `https://picsum.photos/seed/campuskart${globalIndex}/800/500`;
      await client.query(
        `INSERT INTO tasks (client_id, title, description, category, budget_inr, tags, image_url, featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          clientUserId,
          taskTitle(globalIndex),
          descriptionFor(globalIndex),
          cat,
          budget,
          tagSets[globalIndex % tagSets.length],
          safeImage,
          globalIndex % 11 === 0,
        ]
      );
    }

    console.log(`Seed done (+${need} tasks). Demo logins:
  Admin:    ${adminEmail} / demo1234
  Student:  ${studentEmail} / demo1234
  Client:   ${clientEmail} / demo1234
`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
