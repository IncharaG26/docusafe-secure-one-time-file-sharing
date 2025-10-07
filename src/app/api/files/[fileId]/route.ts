import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { files } from '@/db/schema';
import { eq } from 'drizzle-orm';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function GET(
  request: NextRequest,
  context: { params: { fileId: string } }
) {
  try {
    const { fileId } = context.params;

    if (!fileId || typeof fileId !== 'string' || fileId.trim() === '') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Valid fileId is required',
          code: 'INVALID_FILE_ID'
        },
        { status: 400 }
      );
    }

    const fileRecords = await db
      .select()
      .from(files)
      .where(eq(files.fileId, fileId))
      .limit(1);

    if (fileRecords.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'File not found',
          code: 'FILE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const fileRecord = fileRecords[0];

    const printsRemaining = fileRecord.maxPrints - fileRecord.printCount;
    const formattedFileSize = formatFileSize(fileRecord.fileSize);

    const fileInfo = {
      fileId: fileRecord.fileId,
      fileName: fileRecord.fileName,
      fileSize: formattedFileSize,
      mimeType: fileRecord.mimeType,
      requiresOtp: fileRecord.requiresOtp,
      maxPrints: fileRecord.maxPrints,
      printCount: fileRecord.printCount,
      printsRemaining: printsRemaining,
      accessed: fileRecord.accessed,
      createdAt: fileRecord.createdAt
    };

    return NextResponse.json(
      {
        success: true,
        file: fileInfo
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('GET /api/files/[fileId] error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    );
  }
}