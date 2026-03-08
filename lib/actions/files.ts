'use server'

import { db } from '@/lib/db'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface UploadUrlResult {
  uploadUrl: string
  fileId: string
  publicUrl: string
}

export interface ConfirmUploadInput {
  fileId: string
  orderId: string
  orderItemId?: string
  section?: string
  fileName: string
  fileSize: number
  mimeType?: string
  s3Key: string
  uploaderOrgId: string
  isDesignOutput?: boolean
}

// ─── Get Upload URL ────────────────────────────────────────────────────────

export async function getUploadUrl(
  fileName: string,
  fileType: string,
  fileSizeBytes: number,
): Promise<ActionResult<UploadUrlResult>> {
  try {
    // TODO: Replace with real S3/R2 presigned URL generation
    // const command = new PutObjectCommand({ Bucket, Key, ContentType })
    // const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
    const s3Key = `uploads/${Date.now()}_${fileName.replace(/[^a-z0-9._-]/gi, '_')}`
    const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2)}`

    console.log('getUploadUrl:', { fileName, fileType, fileSizeBytes })

    return {
      success: true,
      data: {
        uploadUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? 'https://storage.example.com'}/upload/${s3Key}`,
        fileId,
        publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? 'https://storage.example.com'}/${s3Key}`,
      },
    }
  } catch {
    return { success: false, error: 'Failed to generate upload URL' }
  }
}

// ─── Confirm Upload ────────────────────────────────────────────────────────

export async function confirmUpload(
  input: ConfirmUploadInput,
): Promise<ActionResult<{ fileId: string }>> {
  try {
    const sectionMap: Record<string, 'scan' | 'design' | 'clinical_photo' | 'supplementary' | 'other'> = {
      scan:           'scan',
      design:         'design',
      clinical_photo: 'clinical_photo',
      supplementary:  'supplementary',
    }
    const section = sectionMap[input.section ?? ''] ?? 'other'

    const record = await db.fileRecord.create({
      data: {
        orderItemId:   input.orderItemId ?? null,
        uploaderOrgId: input.uploaderOrgId,
        fileName:      input.fileName,
        fileSize:      input.fileSize,
        s3Key:         input.s3Key,
        mimeType:      input.mimeType ?? null,
        section,
        isDesignOutput: input.isDesignOutput ?? false,
      },
    })

    return { success: true, data: { fileId: record.id } }
  } catch {
    return { success: false, error: 'Failed to confirm upload' }
  }
}

// ─── Get File Download URL ─────────────────────────────────────────────────

export async function getFileDownloadUrl(
  fileId: string,
): Promise<ActionResult<{ downloadUrl: string; expiresAt: Date }>> {
  try {
    const record = await db.fileRecord.findUnique({ where: { id: fileId } })
    if (!record) return { success: false, error: 'File not found' }

    // TODO: Replace with real S3/R2 presigned download URL
    // const command = new GetObjectCommand({ Bucket, Key: record.s3Key })
    // const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    const downloadUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? 'https://storage.example.com'}/${record.s3Key}?token=mock`
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    return { success: true, data: { downloadUrl, expiresAt } }
  } catch {
    return { success: false, error: 'Failed to generate download URL' }
  }
}

// ─── Delete File ───────────────────────────────────────────────────────────

export async function deleteFile(fileId: string): Promise<ActionResult<{ fileId: string }>> {
  try {
    // TODO: Also delete from S3/R2 when storage is connected
    await db.fileRecord.delete({ where: { id: fileId } })

    return { success: true, data: { fileId } }
  } catch {
    return { success: false, error: 'Failed to delete file' }
  }
}
