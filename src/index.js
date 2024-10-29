import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function encodeImageToBase64(imagePath) {
    return fs.readFileSync(imagePath).toString('base64');
}

const imagePath = path.join(__dirname, 'q03-image.png');

const base64Image = encodeImageToBase64(imagePath);

async function sendImageToOpenAI() {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Describe this image and then solve the question explaining your line of reasoning",
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

        console.log(response.choices[0].message.content);
    } catch (error) {
        console.error("Erro ao enviar imagem:", error);
    }
}

sendImageToOpenAI();
