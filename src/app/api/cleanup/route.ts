import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { gte, eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(request: NextRequest) {
  try {
    // Find files that reached their print limit
    const exhaustedFiles = await db
      .select()
      .from(files)
      .where(gte(files.printCount, files.maxPrints));

    let deletedCount = 0;

    // Delete each exhausted file
    for (const file of exhaustedFiles) {
      try {
        // Delete from disk
        const filePath = join(process.cwd(), "temp_uploads", file.encryptedFileName);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }

        // Delete from database
        await db.delete(files).where(eq(files.id, file.id));
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting file ${file.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} files that reached print limit`,
      deletedCount,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup exhausted files" },
      { status: 500 }
    );
  }
}