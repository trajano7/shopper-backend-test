import fs from 'fs';
import path from 'path';

// Converts a image in base64 to binary and save in local storage
function saveBase64Img(base64Data: string, fileName: string) {
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Image, 'base64');

    const filePath = path.join(process.cwd(), 'images', fileName);
    fs.writeFileSync(filePath, imageBuffer);
}

// Deletes a image from the local storage
async function deleteImage(fileName: string) {
    const filePath = path.join(process.cwd(), 'images', fileName + ".jpg");
  
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Erro ao deletar a imagem ${fileName}:`, err);
      }
      console.log(`Imagem ${fileName} deletada com sucesso.`);
    });
  }

exports.saveBase64Img = saveBase64Img;
exports.deleteImage = deleteImage;