import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/src/lib/firebase"

/**
 * Upload de imagem de produto para o Firebase Storage
 * @param file - Ficheiro de imagem
 * @param productId - ID do produto (ou temporário para novos)
 * @returns URL pública da imagem
 */
export async function uploadProductImage(
  file: File,
  productId: string = `temp-${Date.now()}`
): Promise<string> {
  // Validar tipo de ficheiro
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Tipo de ficheiro não suportado. Use JPEG, PNG, WebP ou GIF.")
  }

  // Validar tamanho (máx 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error("A imagem deve ter no máximo 5MB.")
  }

  // Gerar nome único para o ficheiro
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const storagePath = `products/${productId}/${fileName}`

  const storageRef = ref(storage, storagePath)

  // Upload
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  })

  // Obter URL pública
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}

/**
 * Eliminar imagem de produto do Firebase Storage
 * @param imageUrl - URL completa da imagem no Firebase Storage
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extrair o path do Storage a partir da URL
    const storageRef = ref(storage, imageUrl)
    await deleteObject(storageRef)
  } catch (error: unknown) {
    // Se a imagem não existir, ignorar
    const code = (error as { code?: string }).code
    if (code !== "storage/object-not-found") {
      throw error
    }
  }
}

/**
 * Upload de múltiplas imagens de produto
 * @param files - Array de ficheiros
 * @param productId - ID do produto
 * @returns Array de URLs públicas
 */
export async function uploadProductImages(
  files: File[],
  productId: string = `temp-${Date.now()}`
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadProductImage(file, productId))
  return Promise.all(uploadPromises)
}
