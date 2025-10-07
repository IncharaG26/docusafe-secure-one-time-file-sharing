import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { nanoid } from "nanoid";
import { encryptBuffer, generateEncryptionKey, generateIV, generateOTP } from "@/lib/crypto";
import { hash } from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const requireOtp = formData.get("requireOtp") === "true";
    const maxPrints = parseInt(formData.get("maxPrints") as string) || 1;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate unique file ID
    const fileId = nanoid(16);
    
    // Generate encryption key and IV
    const encryptionKey = generateEncryptionKey();
    const iv = generateIV();

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Encrypt file
    const encryptedBuffer = encryptBuffer(buffer, encryptionKey, iv);

    // Generate OTP if required
    let otpHash: string | null = null;
    let otpPlaintext: string | null = null;
    if (requireOtp) {
      otpPlaintext = generateOTP();
      otpHash = await hash(otpPlaintext, 10);
    }

    // Create temp_uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "temp_uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save encrypted file
    const encryptedFileName = `${fileId}.enc`;
    const filePath = join(uploadsDir, encryptedFileName);
    await writeFile(filePath, encryptedBuffer);

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Store metadata in database
    await db.insert(files).values({
      fileId,
      fileName: file.name,
      encryptedFileName,
      fileSize: buffer.length,
      mimeType: file.type || 'application/octet-stream',
      encryptionKey,
      encryptionIv: iv,
      otpHash,
      requiresOtp: requireOtp,
      expiresAt,
      maxPrints,
      printCount: 0,
      accessed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Generate secure link
    const baseUrl = request.nextUrl.origin;
    const secureLink = `${baseUrl}/access?id=${fileId}`;

    return NextResponse.json({
      success: true,
      link: secureLink,
      fileId,
      otp: otpPlaintext,
      maxPrints,
      expiresAt,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}