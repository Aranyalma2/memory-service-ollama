import readline from 'readline';
import { MemoryService } from './memoryService.js';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const memoryService = new MemoryService();
const loader = new PDFLoader("data/data.pdf");

async function initializeMemory() {
  const documents = await loader.load(); // Load PDF content
  await memoryService.storeMemory(documents); // Store loaded content into memory
}

await initializeMemory();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = () => {
  rl.question('Enter your query: ', async (query) => {
    const response = await memoryService.getRelevantMemory(query);
    console.log(response);
    askQuestion();
  });
};

askQuestion();
