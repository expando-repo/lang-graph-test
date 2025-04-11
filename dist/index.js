import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createSwarm, createHandoffTool } from "@langchain/langgraph-swarm";
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
// Initialize the model with API key from environment variables
const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    openAIApiKey: process.env.OPENAI_API_KEY
});
// Create specialized tools
const add = tool(async (args) => args.a + args.b, {
    name: "add",
    description: "Sečti dvě čísla.",
    schema: z.object({
        a: z.number(),
        b: z.number()
    })
});
// Create agents with handoff tools
const alice = createReactAgent({
    llm: model,
    tools: [add, createHandoffTool({ agentName: "Bob" })],
    name: "Alice",
    prompt: "Jsi Alice, expertka na matematiku. Pokud jsi jako Alice odpověděl na dotaz, tak se pod odpověď podepiš jako 'made by alice'. "
});
const bob = createReactAgent({
    llm: model,
    tools: [createHandoffTool({
            agentName: "Alice",
            description: "Přehod to na Alici, ona dokáže pomoci s matematikou"
        })],
    name: "Bob",
    prompt: "Jsi Bob, specialista na speedmetal jako je Helloween nebo Gamma Ray nebo Avantasia. Pokud jsi jako Bob odpověděl na dotaz, tak se pod odpověď podepiš jako 'made by bob'."
});
const checkpointer = new MemorySaver();
// Create swarm workflow
const workflow = createSwarm({
    agents: [alice, bob],
    defaultActiveAgent: "Alice"
});
export const app = workflow.compile({
    checkpointer
});
/*
const config = { configurable: { thread_id: "1" } };

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to handle the conversation
async function handleConversation() {
  try {
    const answer = await new Promise<string>((resolve) => {
      rl.question('Napiš zprávu (nebo "konec" pro ukončení): ', resolve);
    });

    if (answer.toLowerCase() === 'konec') {
      console.log('Na shledanou!');
      rl.close();
      return;
    }

    const response = await app.invoke(
      { messages: [{ role: "user", content: answer }] },
      config
    );
    console.log(response);

    console.log('\nOdpověď:', response.messages[response.messages.length - 1].content, '\n');
    
    // Continue the conversation
    handleConversation();
  } catch (error) {
    console.error('Došlo k chybě:', error);
    rl.close();
  }
}

// Start the conversation
console.log('Vítejte! Můžete začít konverzaci.');
handleConversation();
*/
/*
const turn1 = await app.invoke(
  { messages: [{ role: "user", content: "i'd like to speak to Bob" }] },
  config
);
console.log(turn1);

const turn2 = await app.invoke(
  { messages: [{ role: "user", content: "what's 5 + 7?" }] },
  config
);
console.log(turn2);
*/ 
