import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/index.js';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });


const users = [
    { name: 'Md Arman Hossain', email: 'arman.hossain@team.com', role: 'ADMIN' as const },
    { name: 'Shahriyar Mahbub', email: 'shahriyar.mahbub@team.com', role: 'LEADER' as const },
    { name: 'Shakil Ahmed Billal', email: 'shakil.billal@team.com', role: 'LEADER' as const },
    { name: 'Md. Kausar', email: 'md.kausar@team.com', role: 'MEMBER' as const },
    { name: 'S M Nahid Hasan', email: 'nahid.hasan@team.com', role: 'MEMBER' as const },
    { name: 'Ashik Khan Atul', email: 'ashik.atul@team.com', role: 'MEMBER' as const },
    { name: 'Abu Saeed', email: 'abu.saeed@team.com', role: 'MEMBER' as const },
    { name: 'Nobodip Debnath', email: 'nobodip.debnath@team.com', role: 'MEMBER' as const },
    { name: 'Iftakhar Islam', email: 'iftakhar.islam@team.com', role: 'MEMBER' as const },
    { name: 'Abdullah Tamim', email: 'abdullah.tamim@team.com', role: 'MEMBER' as const },
    { name: 'Kazi Abdullah Jarif', email: 'kazi.jarif@team.com', role: 'MEMBER' as const },
    { name: 'Fahim Muntasir', email: 'fahim.muntasir@team.com', role: 'MEMBER' as const },
    { name: 'Md. Shaoyn Hassan', email: 'shaoyn.hassan@team.com', role: 'MEMBER' as const },
    { name: 'Hamim Ahmad', email: 'hamim.ahmad@team.com', role: 'MEMBER' as const },
    { name: 'Siam Sheikh', email: 'siam.sheikh@team.com', role: 'MEMBER' as const },
    { name: 'Zahidul Islam', email: 'zahidul.islam@team.com', role: 'MEMBER' as const },
    { name: 'Md. Abdullah Al Mukit', email: 'abdullah.mukit@team.com', role: 'MEMBER' as const },
    { name: 'Rafizul Islam Rimon', email: 'rafizul.rimon@team.com', role: 'MEMBER' as const },
    { name: 'Ajhar Uddin Bhuiyan', email: 'ajhar.bhuiyan@team.com', role: 'MEMBER' as const },
    { name: 'Md Arif Hasan Sagor', email: 'arif.sagor@team.com', role: 'MEMBER' as const },
    { name: 'Najmul Haque Talukder', email: 'najmul.talukder@team.com', role: 'MEMBER' as const },
    { name: 'Sadat Arefin', email: 'sadat.arefin@team.com', role: 'MEMBER' as const },
    { name: 'Md Arif Rahman', email: 'arif.rahman@team.com', role: 'MEMBER' as const },
    { name: 'Zihadul Islam', email: 'zihadul.islam@team.com', role: 'MEMBER' as const },
    { name: 'Apurbo Sarker', email: 'apurbo.sarker@team.com', role: 'MEMBER' as const },
];

async function main() {
    console.log('🌱 Starting seed...');

    const defaultPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    let created = 0;
    let skipped = 0;

    for (const user of users) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });

        if (existing) {
            console.log(`  ⏭  Skipping existing user: ${user.name} (${user.email})`);
            skipped++;
            continue;
        }

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role,
            },
        });

        const badge = user.role === 'ADMIN' ? '👑' : user.role === 'LEADER' ? '🔷' : '👤';
        console.log(`  ${badge} Created: ${user.name} [${user.role}]`);
        created++;
    }

    console.log(`\n✅ Seed complete! Created: ${created}, Skipped: ${skipped}`);
    console.log(`\n🔑 Default password for all users: ${defaultPassword}`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
