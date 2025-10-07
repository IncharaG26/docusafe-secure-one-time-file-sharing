import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { fileId, otp } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Fetch file metadata
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.fileId, fileId))
      .limit(1);

    if (!file) {
      return NextResponse.json(
        { error: "File not found or has been deleted" },
        { status: 404 }
      );
    }

    // Check if already accessed
    if (file.accessed) {
      return NextResponse.json(
        { error: "This file has already been accessed and deleted" },
        { status: 410 }
      );
    }

    // Check if print limit reached
    if (file.printCount >= file.maxPrints) {
      return NextResponse.json(
        { error: "This file has reached its maximum print count and been deleted" },
        { status: 410 }
      );
    }

    // Verify OTP if required
    if (file.otpHash) {
      if (!otp) {
        return NextResponse.json(
          { error: "OTP is required for this file" },
          { status: 401 }
        );
      }

      const otpValid = await compare(otp, file.otpHash);
      if (!otpValid) {
        return NextResponse.json(
          { error: "Invalid OTP" },
          { status: 401 }
        );
      }
    }

    // Return file info
    return NextResponse.json({
      success: true,
      fileName: file.fileName,
      fileSize: formatFileSize(file.fileSize),
      requiresOtp: !!file.otpHash,
      verified: true,
      printCount: file.printCount,
      maxPrints: file.maxPrints,
      printsRemaining: file.maxPrints - file.printCount,
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify file" },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}