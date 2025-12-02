const useCreateBucketUrl = (fileUrl: string) => {
  if (!fileUrl) return undefined
  return `${process.env.NEXT_PUBLIC_API_BASE_URL || fileUrl}`
}

export default useCreateBucketUrl
