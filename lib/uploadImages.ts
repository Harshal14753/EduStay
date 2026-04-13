import fs from 'fs';
import path from 'path';

export async function uploadLocalImages(files: File[]) {
  try {
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imageUrls = await Promise.all(
      files.map(async (file) => {
        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadDir, filename);

        // Convert File to Buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Write file
        fs.writeFileSync(filePath, buffer);

        // Return the public URL
        return `/uploads/${filename}`;
      })
    );

    return imageUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images');
  }
}
