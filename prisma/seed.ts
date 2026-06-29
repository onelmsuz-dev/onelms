import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seed boshlandi...");

  // Platform Admins
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
      console.log("✅ Platform Admin:", pa.phone);
    }
  }

  // Demo org (faqat login uchun)
  const org = await db.organization.upsert({
    where:  { subdomain: "demo" },
    update: {},
    create: {
      name:     "Demo O'quv Markaz",
      subdomain: "demo",
      plan:     "PRO",
      isActive: true,
    },
  });

  await db.user.upsert({
    where:  { phone_organizationId: { phone: "+998901234567", organizationId: org.id } },
    update: {},
    create: {
      organizationId: org.id,
      phone:    "+998901234567",
      name:     "Super Admin",
      password: await bcrypt.hash("admin123", 12),
      role:     "SUPER_ADMIN",
    },
  });

  console.log("✅ Seed tayyor");
  console.log("Platform Admin : +998915610586 / OneRoom2026!");
  console.log("Super Admin    : +998901234567 / admin123");
}

main().catch(console.error).finally(() => db.$disconnect());
