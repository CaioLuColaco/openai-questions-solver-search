import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function encodeImageToBase64(imagePath) {
  try {
    return fs.readFileSync(imagePath).toString('base64');
  } catch (error) {
    console.log(error)
  }
}

const getAllImagesInFolder = (folderPath) => {
  try {
    const imageExtensions = ['.png', '.jpg', '.jpeg']
    const imageFiles = []

    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = path.join(folderPath, file)

      if (imageExtensions.includes(path.extname(file).toLowerCase())) {
        imageFiles.push(encodeImageToBase64(filePath));
      }
    });

    return imageFiles;

  } catch (error) {
    console.log
  }
};

async function sendImageToOpenAI(base64Image) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Descreva essa imagem, e resolva a questão explicando o seu raciocínio para definir qual é o item correto para a resposta e o motivo dos outros itens estarem errados. Por fim, dê a respotas no formato Raciocínio: 'Texto explicando os raciocínios solicitados'; Letra do item correto para a resposta final: 'Texto com apenas a letra'; Numero da questao: 'Inteiro com o numero da questão da imagem'",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              },
            },
          ],
        },
      ],
    });

    console.log(response);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
  }
}

const saveResultsToFile = (results, filePath) => {
  try {
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    }

    existingData.push(...results);

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
    console.log(`Resultados salvos em ${filePath}`);
  } catch (error) {
    console.error("Erro ao salvar resultados no arquivo:", error);
  }
};

const initFunction = async () => {
  try {
    const results = []
    const imagesFolderPath = path.join(__dirname, '/materials/questions');
    const allImages = getAllImagesInFolder(imagesFolderPath);

    for (const image of allImages) {
      const response = await sendImageToOpenAI(image);
      results.push({ messageResponse: response });
    }

    console.log(results);

    const resultFilePath = path.join(__dirname, 'results.json');
    saveResultsToFile(results, resultFilePath);

  } catch (error) {
    console.log(error)
  }
}

initFunction();
