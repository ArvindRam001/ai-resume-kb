const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function testAPI() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "You are a helpful assistant." }],
      model: "gpt-4",
    });

    console.log(completion.choices[0].message);
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();

  

  


