const createBucketUrl = (fileId: string) => {
  if (!fileId) return undefined

  // In local development, if fileId is already a full URL, use it directly
  const isLocalEnv =
    process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  // If it's already a full URL (starts with http:// or https://), return as is
  if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
    return fileId
  }

  // In local env, if it looks like a path, use it directly
  if (isLocalEnv && (fileId.startsWith('/') || fileId.startsWith('uploads/'))) {
    return fileId
  }

  // Otherwise, use the bucket URL format
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${fileId}`
}

export default createBucketUrl
