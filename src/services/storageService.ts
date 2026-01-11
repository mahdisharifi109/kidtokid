import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage"
import { storage } from "@/src/lib/firebase"

// Upload de imagem de produto
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const timestamp = Date.now()
  const fileName = `${timestamp}_${file.name}`
  const storageRef = ref(storage, `products/${productId}/${fileName}`)

  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)

  return downloadURL
}

// Upload de múltiplas imagens
export async function uploadProductImages(
  files: File[],
  productId: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadProductImage(file, productId))
  return Promise.all(uploadPromises)
}

// Eliminar imagem
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (error) {
    console.error("Erro ao eliminar imagem:", error)
    throw error
  }
}

// Eliminar todas as imagens de um produto
export async function deleteProductImages(productId: string): Promise<void> {
  const folderRef = ref(storage, `products/${productId}`)

  try {
    const listResult = await listAll(folderRef)
    const deletePromises = listResult.items.map((itemRef) => deleteObject(itemRef))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error("Erro ao eliminar imagens do produto:", error)
    throw error
  }
}

// Upload de imagem de perfil do utilizador
export async function uploadUserAvatar(
  file: File,
  userId: string
): Promise<string> {
  const storageRef = ref(storage, `avatars/${userId}`)

  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)

  return downloadURL
}

// Eliminar avatar do utilizador
export async function deleteUserAvatar(userId: string): Promise<void> {
  const avatarRef = ref(storage, `avatars/${userId}`)

  try {
    await deleteObject(avatarRef)
  } catch (error) {
    console.error("Erro ao eliminar avatar:", error)
    throw error
  }
}
