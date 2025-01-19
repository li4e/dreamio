import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { OpenAI } from "openai";

const filesToTranslate = [
  "description.txt",
  "subtitle.txt",
  "name.txt",
  "release_notes.txt",
];

const locales = [
  "ar-SA",
  "ca",
  "cs",
  "da",
  "de-DE",
  "el",
  "en-AU",
  "en-CA",
  "en-GB",
  "es-ES",
  "es-MX",
  "fi",
  "fr-CA",
  "fr-FR",
  "he",
  "hi",
  "hr",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "ms",
  "nl-NL",
  "no",
  "pl",
  "pt-BR",
  "pt-PT",
  "ro",
  "ru",
  "sk",
  "sv",
  "th",
  "tr",
  "uk",
  "vi",
  "zh-Hans",
  "zh-Hant",
];

// Create OpenAI client
const client = new OpenAI();

// Function to calculate the file hash
async function getFileHash(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
}

// Function to load hashes from the file
async function loadHashes(
  hashesFile: string
): Promise<Record<string, { original: string; translations: string[] }>> {
  try {
    const data = await fs.readFile(hashesFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Function to save hashes to the file
async function saveHashes(
  hashesFile: string,
  hashes: Record<string, { original: string; translations: string[] }>
) {
  try {
    await fs.writeFile(hashesFile, JSON.stringify(hashes, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving hashes to ${hashesFile}:`, error);
  }
}

// Function to translate text with length limit
async function translateTextWithLengthLimit(
  text: string,
  destLang: string,
  sourceLang: string,
  fileName: string
) {
  let prompt: string;

  if (["name.txt", "subtitle.txt"].includes(fileName)) {
    prompt = `You are a translation assistant specialized in App Store metadata. Translate the following text from ${sourceLang} to ${destLang}, keeping the tone professional and ensuring it aligns with App Store guidelines. The translation should not exceed 30 characters in total, including spaces. Make sure the translation is concise, clear, and reflects the original meaning.`;
  } else {
    // Default prompt for all other files
    prompt = `You are a translation assistant specialized in App Store metadata. Translate the following text from ${sourceLang} to ${destLang}, keeping the tone professional and ensuring it aligns with App Store guidelines. Maintain clarity and accuracy.`;
  }

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: text,
      },
    ],
  };

  const chatCompletion: OpenAI.Chat.ChatCompletion =
    await client.chat.completions.create(params);

  if (!chatCompletion.choices[0]?.message?.content) {
    throw new Error("chatCompletion is null");
  }

  return chatCompletion.choices[0]?.message?.content.trim() || "";
}

// Function to check length of file content after translation
async function checkLength(filePath: string, filename: string, locale: string) {
  if (!["subtitle.txt", "name.txt"].includes(filename)) {
    return;
  }

  const max = 30;

  const content = await fs.readFile(filePath, "utf-8");
  if (content.length > max) {
    console.error(
      `\x1b[31mContent in file "${filename}" (locale: ${locale}) exceeds ${max} characters: "${content}" in file ${filePath}\x1b[0m`
    );
  }
}

// Main function for translating metadata
async function translateMetadata(
  destLang: string,
  sourceLang: string = "en-US",
  translationsFolder: string = "fastlane/metadata"
) {
  const inputDir = path.resolve(translationsFolder, sourceLang); // Directory for source files
  const outputDir = path.resolve(translationsFolder, destLang); // Directory for translated files
  const hashesFile = path.resolve("scripts", "translation", ".hashes.json"); // Path to the file storing hashes

  try {
    // 1. Check if the translation directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // 2. Load hashes for the given locale
    const hashes = await loadHashes(hashesFile);

    // 3. Get the list of all files in the source directory
    const files = await fs.readdir(inputDir);

    // 4. Copy all files from the source directory to the target directory
    for (const fileName of files) {
      const inputFilePath = path.join(inputDir, fileName);
      const outputFilePath = path.join(outputDir, fileName);

      try {
        // Check if the file exists in the source directory
        await fs.access(inputFilePath);

        // Only for files that need translation, calculate the hash
        if (filesToTranslate.includes(fileName)) {
          const fileHash = await getFileHash(inputFilePath);

          // Check if the file has already been translated for this locale
          const existingHashes = hashes[fileName];
          if (existingHashes) {
            // If the hash has changed, reset the list of translated locales
            if (existingHashes.original !== fileHash) {
              console.log(
                `File has changed, resetting translations for ${fileName}`
              );
              existingHashes.translations = []; // Reset translated locales
            }

            // If a translation for this locale already exists, skip it
            if (existingHashes.translations.includes(destLang)) {
              console.log(
                `File already translated for ${destLang}: ${fileName}`
              );
              await checkLength(outputFilePath, fileName, destLang);
              continue; // Skip translation
            }
          } else {
            // If the hash of the original file is not saved, create an entry
            hashes[fileName] = {
              original: fileHash,
              translations: [],
            };
          }
        }

        // Check if the file exists in the target directory
        try {
          await fs.access(outputFilePath);
          console.log(`File already exists: ${outputFilePath}`);
        } catch {
          // If the file does not exist, copy it
          await fs.copyFile(inputFilePath, outputFilePath);
          console.log(`File copied to: ${outputFilePath}`);
        }

        // 5. Translate only the files that need translation
        if (filesToTranslate.includes(fileName)) {
          const content = await fs.readFile(inputFilePath, "utf-8");
          console.log(`Translating file: ${fileName}`);

          // Translate the text considering the length limit
          const translation = await translateTextWithLengthLimit(
            content,
            destLang,
            sourceLang,
            fileName
          );

          // Write the translated text to the file
          await fs.writeFile(outputFilePath, translation, "utf-8");
          console.log(`File translated and saved: ${outputFilePath}`);

          // Update the hash and add the locale to the list of translated ones
          if (filesToTranslate.includes(fileName)) {
            hashes[fileName].translations.push(destLang);
          }

          // Save the hashes immediately after translating each file
          await saveHashes(hashesFile, hashes);

          await checkLength(outputFilePath, fileName, destLang);
          // Check the translated file for length
        }
      } catch (error) {
        console.error(`Error handling file ${fileName}:`, error);
      }
    }

    console.log("All files have been processed successfully!");
  } catch (error) {
    console.error("Error during translation:", error);
  }
}

async function run() {
  for (const locale of locales) {
    await translateMetadata(locale);
  }
}

run();
