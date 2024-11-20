import {VectorDBQAChain} from "langchain/chains";
import {ChatOllama, OllamaEmbeddings} from "@langchain/ollama";
import {MemoryVectorStore} from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class MemoryService {
    constructor() {
        // specify LLM model
        this.llmModel = new ChatOllama({
            model: process.env.OLLAMA.MODEL,
            temperature: 0,
            maxRetries: 2,
            baseUrl: process.env.OLLAMA,
        });

        // specify embeddings model
        this.embeddingsModel = new OllamaEmbeddings({
            model: process.env.OLLAMA.MODEL,
            baseUrl: process.env.OLLAMA,
        });

        // create vector store by combining OpenSearch store with the embeddings model
        this.vectorStore = new MemoryVectorStore(this.embeddingsModel);

        // combine the LLM model and the vector store to get a chain
        this.chain = VectorDBQAChain.fromLLM(this.llmModel, this.vectorStore, {
            k: 1,
            returnSourceDocuments: true,
        });
    }

    async storeMemory(data) {
        // Package a memory in a document
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize:500,
            separators: ['\n\n','\n',' ',''],
            chunkOverlap: 20
        });

        const splitDocs = await splitter.splitDocuments(data);

        await this.vectorStore.addDocuments(splitDocs);
    }

    async getRelevantMemory(query) {
        const response = await this.chain.call({query});
        return response.text;
    }
}
