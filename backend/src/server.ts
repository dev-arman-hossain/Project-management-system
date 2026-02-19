import { prisma } from "./lib/prisma";
import app from "./app";

const PORT = process.env.PORT || 5000;
async function main() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

main();