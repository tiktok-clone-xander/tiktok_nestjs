const useCreateBucketUrl = (fileId: string) => {
  if (!fileId) return undefined
  return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/files/image/${fileId}`
}

export default useCreateBucketUrl
