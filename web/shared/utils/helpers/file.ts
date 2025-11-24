/**
 * File helper utilities for handling file uploads
 */

import { SerializableFile } from "@/shared";

/**
 * Convert File to base64 serializable format
 */
export async function fileToSerializable(
    file: File,
): Promise<SerializableFile> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const base64 = reader.result as string;
            resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64.split(",")[1], // Remove data:image/png;base64, prefix
            });
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
}

/**
 * Convert multiple Files to serializable format
 */
export async function filesToSerializable(
    files: File[],
): Promise<SerializableFile[]> {
    return Promise.all(files.map(fileToSerializable));
}

/**
 * Convert serializable file back to File
 */
export function serializableToFile(serializable: SerializableFile): File {
    const byteCharacters = atob(serializable.data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: serializable.type });

    return new File([blob], serializable.name, { type: serializable.type });
}

/**
 * Convert multiple serializable files back to Files
 */
export function serializablesToFiles(
    serializables: SerializableFile[],
): File[] {
    return serializables.map(serializableToFile);
}
