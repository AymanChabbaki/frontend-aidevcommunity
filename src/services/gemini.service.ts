import api from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GenerationInput {
  name: string;
  interests: string;
  dream: string;
  photoBase64?: string | null;
  photoMimeType?: string | null;
}

export interface GenerationResult {
  imageDataUrl: string;
  compliment: string;
}

// ─── Combined generation via backend ─────────────────────────────────────────

export async function generateAll(input: GenerationInput): Promise<GenerationResult> {
  const response = await api.post<GenerationResult>('/womensday/generate', input);
  return response.data;
}

// ─── Photo upload via backend → Cloudinary ───────────────────────────────────

export async function uploadPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await api.post<{ url: string }>('/womensday/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.url;
}

// ─── Helper: File → base64 ───────────────────────────────────────────────────

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeType = header.split(':')[1]?.split(';')[0] ?? file.type;
      resolve({ base64: data, mimeType });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

