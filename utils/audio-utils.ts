export async function blobToFile(blob: Blob, fileName: string): Promise<File> {
  return new File([blob], fileName, { type: blob.type })
}

export async function audioUrlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  return await response.blob()
}
