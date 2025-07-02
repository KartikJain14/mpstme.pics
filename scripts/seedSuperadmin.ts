// Seed script for creating a superadmin user
import { db } from "../src/config/db";
import { users } from "../src/db/schema";
import { hashPassword } from "../src/auth/auth.utils";
import { eq } from "drizzle-orm";

async function seedSuperadmin() {
    const email = "superadmin@mpstme.pics";
    const password = "supersecurepassword"; // Change as needed
    const role = "superadmin";

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Check if superadmin already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
        console.log("Superadmin already exists.");
        process.exit(0);
    }

    // Insert superadmin
    await db.insert(users).values({
        email,
        passwordHash,
        role,
        clubId: null,
    });
    console.log("Superadmin user created:", email);
    process.exit(0);
}

seedSuperadmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
