import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

const { parseInteger } = require("./utils");
const { CustomError } = require("./errors");
const { deleteImage } = require("./fileManager");

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is not defined in the environment variables");
}

const fileManager = new GoogleAIFileManager(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Send the request to Gemini API
async function getMeasureValueFromImg(imgPath: string, measureID: string) {

  // Upload the image to the Gemini server using the provided file data
  const uploadResponse = await fileManager.uploadFile(imgPath, {
    mimeType: "image/jpeg",
    displayName: measureID,
  });

  // Send the prompt to Gemini API, asking about the measure value of the image
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri,
      },
    },
    {
      text: "Forneça o valor do medidor de água/gás exibido na imagem. Responda apenas com o valor numerico lido. Caso a foto não seja de um medidor ou não seja possível extrair o valor, retorne exatamente a string 'false'",
    },
  ]);

  // Attempt to parse the value returned by Gemini as an integer. If successful, return the integer value. 
  // If parsing fails, delete the image and throw an error indicating that the number could not be extracted.
  const measureValue = parseInteger(result.response.text());
  if (measureValue !== null) {
    return measureValue;
  }
  else {
    deleteImage(measureID);
    throw new CustomError(422, "UNREADABLE_IMAGE", "Não foi possível extrair um número da imagem fornecida.");
  }

}

exports.getMeasureValueFromImg = getMeasureValueFromImg;
