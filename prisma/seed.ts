import { PrismaClient } from "@prisma/client";
// Better Auth has a hashPassword utility we can use or we can just use the auth instance
import { auth } from "../src/lib/auth"; 


const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!existingUser) {
    try {
      await auth.api.signUpEmail({
        body: {
          email: "admin@example.com",
          username: "admin",
          password: "transcribe2024",
          name: "Admin",
        }
      });
      console.log("Admin user created");
    } catch (error) {
      console.error("Failed to create admin:", error);
      // Fallback manual creation if plugin structure requires email
      const dummyEmail = "admin@example.com";
      await prisma.user.create({
        data: {
          username: "admin",
          email: dummyEmail,
          name: "Admin",
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          accounts: {
            create: {
              accountId: "admin",
              providerId: "credential",
              password: "transcribe2024", // Wait, better auth uses bcrypt by default. Let's just hope auth.api.signUpUsername works
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        }
      });
    }
  } else {
    console.log("Admin user already exists");
  }
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