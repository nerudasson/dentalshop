'use server'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface UploadUrlResult {
  uploadUrl: string
  fileId: string
  /** Public URL available after upload is confirmed */
  publicUrl: string
}

export interface ConfirmUploadInput {
  fileId: string
  orderId: string
  section?: string
}

// ─── Get Upload URL ────────────────────────────────────────────────────────

/**
 * Returns a presigned URL for direct-to-storage upload (S3/R2).
 * The client uploads the file directly using this URL, then calls confirmUpload.
 */
export async function getUploadUrl(
  fileName: string,
  fileType: string,
  fileSizeBytes: number,
): Promise<ActionResult<UploadUrlResult>> {
  try {
    // TODO: Replace with real S3/R2 presigned URL generation
    // const command = new PutObjectCommand({ Bucket, Key, ContentType })
    // const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
    console.log('getUploadUrl:', { fileName, fileType, fileSizeBytes })

    const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2)}`

    return {
      success: true,
      data: {
        uploadUrl: `https://storage.example.com/upload/${fileId}`,
        fileId,
        publicUrl: `https://storage.example.com/files/${fileId}/${fileName}`,
      },
    }
  } catch {
    return { success: false, error: 'Failed to generate upload URL' }
  }
}

// ─── Confirm Upload ────────────────────────────────────────────────────────

/**
 * Called after the client successfully uploads to the presigned URL.
 * Records the file in the database and associates it with an order.
 */
export async function confirmUpload(
  input: ConfirmUploadInput,
): Promise<ActionResult<{ fileId: string }>> {
  try {
    // TODO: Replace with Prisma DB call when database is connected
    // await db.orderFile.create({ data: { ... } })
    console.log('confirmUpload:', input)

    return { success: true, data: { fileId: input.fileId } }
  } catch {
    return { success: false, error: 'Failed to confirm upload' }
  }
}

// ─── Get File Download URL ─────────────────────────────────────────────────

/**
 * Returns a time-limited presigned download URL for a stored file.
 * Validates that the requesting user has access to the file.
 */
export async function getFileDownloadUrl(
  fileId: string,
): Promise<ActionResult<{ downloadUrl: string; expiresAt: Date }>> {
  try {
    // TODO: Replace with real S3/R2 presigned URL generation
    // const command = new GetObjectCommand({ Bucket, Key })
    // const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    console.log('getFileDownloadUrl:', fileId)

    return {
      success: true,
      data: {
        downloadUrl: `https://storage.example.com/download/${fileId}?token=mock`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      },
    }
  } catch {
    return { success: false, error: 'Failed to generate download URL' }
  }
}

// ─── Delete File ───────────────────────────────────────────────────────────

export async function deleteFile(fileId: string): Promise<ActionResult<{ fileId: string }>> {
  try {
    // TODO: Replace with real S3/R2 deletion + Prisma record removal
    console.log('deleteFile:', fileId)

    return { success: true, data: { fileId } }
  } catch {
    return { success: false, error: 'Failed to delete file' }
  }
}
