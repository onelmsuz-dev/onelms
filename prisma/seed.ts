import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seed boshlandi...");

  // ─── Platform Admins ─────────────────────────────────────────────────────
  const platformAdmins = [
    { phone: "+998915610586", name: "Shavkatov Fayzulloh" },
    { phone: "+998338880133", name: "Platform Admin 2" },
  ];
  for (const pa of platformAdmins) {
    const exists = await db.user.findFirst({
      where: { phone: pa.phone, role: "PLATFORM_ADMIN", organizationId: null },
    });
    if (!exists) {
      await db.user.create({
        data: {
          phone:          pa.phone,
          name:           pa.name,
          role:           "PLATFORM_ADMIN",
          organizationId: null,
          password:       await bcrypt.hash("OneRoom2026!", 12),
        },
      });
      console.log("✅ Platform Admin qo'shildi:", pa.phone);
    }
  }

  // ─── Demo Organization ────────────────────────────────────────────────────
  const org = await db.organization.upsert({
    where:  { subdomain: "demo" },
    update: {},
    create: {
      name:      "Demo O'quv Markaz",
      subdomain: "demo",
      plan:      "PRO",
      features:  ["SMS_NOTIFY", "CUSTOM_REPORTS", "MULTI_BRANCH"],
      isActive:  true,
    },
  });
  console.log("✅ Organization:", org.subdomain);

  const orgId = org.id;

  // ─── Users ───────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash("admin123", 12);
  const admin = await db.user.upsert({
    where:  { phone_organizationId: { phone: "+998901234567", organizationId: orgId } },
    update: {},
    create: {
      organizationId: orgId,
      phone:    "+998901234567",
      name:     "Super Admin",
      email:    "admin@demo.oneroom.uz",
      password: adminPass,
      role:     "SUPER_ADMIN",
    },
  });
  console.log("✅ Super admin:", admin.phone);

  const recPass = await bcrypt.hash("rec123", 12);
  await db.user.upsert({
    where:  { phone_organizationId: { phone: "+998901111111", organizationId: orgId } },
    update: {},
    create: {
      organizationId: orgId,
      phone:    "+998901111111",
      name:     "Malika Qodirov",
      email:    "reception@demo.oneroom.uz",
      password: recPass,
      role:     "RECEPTIONIST",
    },
  });

  const accPass = await bcrypt.hash("acc123", 12);
  await db.user.upsert({
    where:  { phone_organizationId: { phone: "+998902222222", organizationId: orgId } },
    update: {},
    create: {
      organizationId: orgId,
      phone:    "+998902222222",
      name:     "Zulfiya Hasanov",
      email:    "finance@demo.oneroom.uz",
      password: accPass,
      role:     "ACCOUNTANT",
    },
  });

  // ─── Branch & Rooms ───────────────────────────────────────────────────────
  const branch = await db.branch.upsert({
    where:  { id: "branch_main" },
    update: {},
    create: { id: "branch_main", organizationId: orgId, name: "Asosiy filial", address: "Toshkent, Chilonzor" },
  });

  const r1 = await db.room.upsert({
    where:  { id: "room_1" },
    update: {},
    create: { id: "room_1", organizationId: orgId, branchId: branch.id, name: "1-xona", capacity: 15 },
  });
  const r2 = await db.room.upsert({
    where:  { id: "room_2" },
    update: {},
    create: { id: "room_2", organizationId: orgId, branchId: branch.id, name: "2-xona", capacity: 15 },
  });
  const rLab = await db.room.upsert({
    where:  { id: "room_lab" },
    update: {},
    create: { id: "room_lab", organizationId: orgId, branchId: branch.id, name: "Kompyuter lab", capacity: 12 },
  });

  // ─── Courses ─────────────────────────────────────────────────────────────
  const c1 = await db.course.upsert({
    where:  { id: "course_eng" },
    update: {},
    create: { id: "course_eng", organizationId: orgId, name: "Ingliz tili", description: "A1 dan C1 gacha", duration: "3 oy", price: 400000, color: "bg-blue-500" },
  });
  const c2 = await db.course.upsert({
    where:  { id: "course_math" },
    update: {},
    create: { id: "course_math", organizationId: orgId, name: "Matematika", description: "5-11 sinf", duration: "1 oy", price: 300000, color: "bg-green-500" },
  });
  const c3 = await db.course.upsert({
    where:  { id: "course_it" },
    update: {},
    create: { id: "course_it", organizationId: orgId, name: "IT Dasturlash", description: "Python, Web, Mobile", duration: "6 oy", price: 600000, color: "bg-purple-500" },
  });

  // ─── Teachers ─────────────────────────────────────────────────────────────
  const t1pass = await bcrypt.hash("teacher123", 12);
  const t1user = await db.user.upsert({
    where:  { phone_organizationId: { phone: "+998901002000", organizationId: orgId } },
    update: {},
    create: { organizationId: orgId, phone: "+998901002000", name: "Mohira Xasanova", email: "mohira@demo.oneroom.uz", password: t1pass, role: "TEACHER" },
  });
  const t1 = await db.teacher.upsert({
    where:  { userId: t1user.id },
    update: {},
    create: { organizationId: orgId, userId: t1user.id, phone: "+998901002000", email: "mohira@demo.oneroom.uz", subjects: ["Ingliz tili"], salary: 3000000, salaryType: "FIXED" },
  });

  const t2pass = await bcrypt.hash("teacher123", 12);
  const t2user = await db.user.upsert({
    where:  { phone_organizationId: { phone: "+998912003000", organizationId: orgId } },
    update: {},
    create: { organizationId: orgId, phone: "+998912003000", name: "Jamshid Tursunov", email: "jamshid@demo.oneroom.uz", password: t2pass, role: "TEACHER" },
  });
  const t2 = await db.teacher.upsert({
    where:  { userId: t2user.id },
    update: {},
    create: { organizationId: orgId, userId: t2user.id, phone: "+998912003000", subjects: ["Matematika", "Fizika"], salary: 25, salaryType: "PERCENT" },
  });

  const t3pass = await bcrypt.hash("teacher123", 12);
  const t3user = await db.user.upsert({
    where:  { phone_organizationId: { phone: "+998933004000", organizationId: orgId } },
    update: {},
    create: { organizationId: orgId, phone: "+998933004000", name: "Sardor Hasanov", password: t3pass, role: "TEACHER" },
  });
  const t3 = await db.teacher.upsert({
    where:  { userId: t3user.id },
    update: {},
    create: { organizationId: orgId, userId: t3user.id, phone: "+998933004000", subjects: ["IT Dasturlash", "Python"], salary: 3500000, salaryType: "FIXED" },
  });

  // ─── Groups ───────────────────────────────────────────────────────────────
  const g1 = await db.group.upsert({
    where:  { id: "group_eng_a1" },
    update: {},
    create: {
      id: "group_eng_a1", organizationId: orgId, name: "Ingliz A1 - 1",
      courseId: c1.id, teacherId: t1.id, roomId: r1.id, branchId: branch.id,
      maxStudents: 15, scheduleDays: ["Dushanba", "Chorshanba", "Juma"],
      startTime: "09:00", endTime: "10:30", startDate: new Date("2024-03-01"),
      color: "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
  });
  const g2 = await db.group.upsert({
    where:  { id: "group_math_9" },
    update: {},
    create: {
      id: "group_math_9", organizationId: orgId, name: "Matematika 9-sinf",
      courseId: c2.id, teacherId: t2.id, roomId: r2.id, branchId: branch.id,
      maxStudents: 15, scheduleDays: ["Seshanba", "Payshanba", "Shanba"],
      startTime: "11:00", endTime: "12:30", startDate: new Date("2024-02-15"),
      color: "bg-green-100 border-green-400 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
  });
  const g3 = await db.group.upsert({
    where:  { id: "group_it_beg" },
    update: {},
    create: {
      id: "group_it_beg", organizationId: orgId, name: "IT Dasturlash - Boshlang'ich",
      courseId: c3.id, teacherId: t3.id, roomId: rLab.id, branchId: branch.id,
      maxStudents: 12, scheduleDays: ["Dushanba", "Chorshanba", "Juma"],
      startTime: "14:00", endTime: "16:00", startDate: new Date("2024-04-01"),
      color: "bg-purple-100 border-purple-400 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    },
  });

  // ─── Students ─────────────────────────────────────────────────────────────
  const students = [
    { name: "Abdulloh Mirzayev",  phone: "+998901112233", balance: -250000, groupId: g1.id },
    { name: "Barno Qodirov",      phone: "+998932223344", balance: 0,       groupId: g1.id },
    { name: "Davron Ergashev",    phone: "+998953334455", balance: 150000,  groupId: g2.id },
    { name: "Ezgulik Norova",     phone: "+998904445566", balance: 0,       groupId: g3.id },
    { name: "Farhodjon Usmonov",  phone: "+998935556677", balance: -450000, groupId: g2.id },
    { name: "Gulbahor Raximova",  phone: "+998946667788", balance: 0,       groupId: g1.id },
    { name: "Hamidjon Tojiboyev", phone: "+998907778899", balance: -200000, groupId: g3.id },
    { name: "Jasur Qosimov",      phone: "+998949990011", balance: 0,       groupId: g2.id },
  ];

  for (const s of students) {
    const { groupId, ...data } = s;
    const student = await db.student.create({ data: { ...data, organizationId: orgId } }).catch(() => null);
    if (student) {
      const ps: "TOLANDI" | "QARZDOR" | "QISMAN" =
        s.balance < 0 ? "QARZDOR" : s.balance > 0 ? "QISMAN" : "TOLANDI";
      await db.studentGroup.create({
        data: { studentId: student.id, groupId, paymentStatus: ps },
      }).catch(() => null);
    }
  }

  // ─── Leads ───────────────────────────────────────────────────────────────
  const leads = [
    { name: "Sherzod Karimov", phone: "+998901230001", source: "Instagram",    status: "YANGI"          as const, course: "Ingliz tili" },
    { name: "Nafisa Yusupova", phone: "+998901230002", source: "Telegram",     status: "ALOQA_QILINGAN" as const, course: "IT Dasturlash" },
    { name: "Behruz Xolmatov", phone: "+998901230003", source: "Do'st orqali", status: "SINOV_DARSI"    as const, course: "Matematika" },
  ];
  for (const l of leads) {
    await db.lead.create({ data: { ...l, organizationId: orgId } }).catch(() => null);
  }

  console.log("✅ Seed muvaffaqiyatli tugadi!");
  console.log("─────────────────────────────────────────────────────");
  console.log("🌐 Subdomen: demo.localhost:3000  (yoki demo.oneroom.uz)");
  console.log("👤 Kirish ma'lumotlari:");
  console.log("   Super Admin : +998901234567 / admin123");
  console.log("   Receptionist: +998901111111 / rec123");
  console.log("   Accountant  : +998902222222 / acc123");
  console.log("   O'qituvchi  : +998901002000 / teacher123");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
