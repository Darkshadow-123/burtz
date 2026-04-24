import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

const adminEmail = "admin@example.com";
const adminUsername = "admin";
const adminPassword = "transcribe2024";

async function main() {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: adminUsername }, { email: adminEmail }],
    },
    select: { id: true },
  });

  if (existingUser) {
    await prisma.session.deleteMany({
      where: { userId: existingUser.id },
    });
    await prisma.account.deleteMany({
      where: { userId: existingUser.id },
    });
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
    console.log("Existing admin user removed");
  }

  await auth.api.signUpEmail({
    body: {
      email: adminEmail,
      username: adminUsername,
      password: adminPassword,
      name: "Admin",
    },
  });

  console.log("Admin user created via Better Auth");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });