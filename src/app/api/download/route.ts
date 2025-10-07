import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { decryptBuffer } from "@/lib/crypto";
import { readFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

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
      // Delete file that reached print limit
      await deleteFile(file.encryptedFileName);
      await db.delete(files).where(eq(files.fileId, fileId));
      
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

    // Read and decrypt file
    const filePath = join(process.cwd(), "temp_uploads", file.encryptedFileName);
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "File data not found on server" },
        { status: 404 }
      );
    }

    const encryptedBuffer = await readFile(filePath);
    const decryptedBuffer = decryptBuffer(
      encryptedBuffer,
      file.encryptionKey,
      file.encryptionIv
    );

    // Increment print count
    const newPrintCount = file.printCount + 1;
    await db.update(files)
      .set({ 
        printCount: newPrintCount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(files.fileId, fileId));
    
    // If max prints reached, delete the file
    if (newPrintCount >= file.maxPrints) {
      await deleteFile(file.encryptedFileName);
      
      // Delete from database after a short delay (to ensure download completes)
      setTimeout(async () => {
        try {
          await db.delete(files).where(eq(files.fileId, fileId));
        } catch (error) {
          console.error("Error deleting file record:", error);
        }
      }, 5000);
    }

    // Return decrypted file
    return new NextResponse(decryptedBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.fileName}"`,
        "Content-Length": decryptedBuffer.length.toString(),
        "X-Print-Count": newPrintCount.toString(),
        "X-Max-Prints": file.maxPrints.toString(),
        "X-Prints-Remaining": (file.maxPrints - newPrintCount).toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}

async function deleteFile(encryptedName: string): Promise<void> {
  try {
    const filePath = join(process.cwd(), "temp_uploads", encryptedName);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}