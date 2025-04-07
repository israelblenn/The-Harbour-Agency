import fs from 'fs';
import path from 'path';

export function getImagesFromPublicFolder() {
  const imagesDirectory = path.join(process.cwd(), 'public/images');
  let fileNames = [];
  
  try {
    fileNames = fs.readdirSync(imagesDirectory);
    // Filter to only include image files
    fileNames = fileNames.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
  } catch (error) {
    console.error('Error reading image directory:', error);
  }
  
  return fileNames;
}