import { PrismaClient } from '@prisma/client';

async function main() {
    console.log('Testing Prisma connection...');
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://postgres:postgres@localhost:5432/postgres"
            }
        }
    } as any);
    try {
        await prisma.$connect();
        console.log('Successfully connected!');
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
