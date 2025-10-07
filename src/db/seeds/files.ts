import { db } from '@/db';
import { files } from '@/db/schema';

async function main() {
    const sampleFiles = [
        {
            fileId: 'file_01h4kxt2e8z9y3b1n7m6q5w8r4',
            fileName: 'Q4_Financial_Report_2024.pdf',
            encryptedFileName: 'enc_q4_financial_report_2024_a8f7d3e9b2c1.pdf',
            fileSize: 2457600,
            mimeType: 'application/pdf',
            encryptionKey: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
            encryptionIv: 'q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
            otpHash: '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjefOJXqWQTQQ.T5nxLz2zl1qX3Zqm',
            requiresOtp: true,
            expiresAt: new Date('2024-01-16T10:00:00.000Z').toISOString(),
            maxPrints: 3,
            printCount: 1,
            accessed: true,
            accessedAt: new Date('2024-01-15T11:30:00.000Z').toISOString(),
            createdAt: new Date('2024-01-15T10:00:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-15T11:30:00.000Z').toISOString(),
        },
        {
            fileId: 'file_02j9mzx5k2p8q4r7t1w3v6y9b2d5g8',
            fileName: 'Product_Roadmap_2025.pptx',
            encryptedFileName: 'enc_product_roadmap_2025_f4e3d2c1b0a9.pptx',
            fileSize: 4823040,
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            encryptionKey: 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
            encryptionIv: 'j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8',
            otpHash: null,
            requiresOtp: false,
            expiresAt: new Date('2024-02-01T15:30:00.000Z').toISOString(),
            maxPrints: 5,
            printCount: 0,
            accessed: false,
            accessedAt: null,
            createdAt: new Date('2024-01-31T15:30:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-31T15:30:00.000Z').toISOString(),
        },
        {
            fileId: 'file_03k5nxb7m4w9t2v8q1p6r3y0d9f2h5',
            fileName: 'Employee_Data_January.xlsx',
            encryptedFileName: 'enc_employee_data_january_c5b4a3z2y1x0.xlsx',
            fileSize: 1572864,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            encryptionKey: 'm4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9',
            encryptionIv: 'c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5',
            otpHash: '$2b$10$8JLiOHq3KZqZQ7xVfRxF1.EzG4YvPwNjXdKlM8RtSuWqA5BcN9Vxy',
            requiresOtp: true,
            expiresAt: new Date('2024-02-06T08:45:00.000Z').toISOString(),
            maxPrints: 1,
            printCount: 1,
            accessed: true,
            accessedAt: new Date('2024-02-05T09:15:00.000Z').toISOString(),
            createdAt: new Date('2024-02-05T08:45:00.000Z').toISOString(),
            updatedAt: new Date('2024-02-05T09:15:00.000Z').toISOString(),
        },
    ];

    await db.insert(files).values(sampleFiles);
    
    console.log('✅ Files seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});