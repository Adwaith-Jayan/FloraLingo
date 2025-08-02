const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/analyze', (req, res) => {
    const imageBase64 = req.body.image;
    console.log("hiii")

    // Spawn Python script
    const python = spawn(
        'C:/Users/Adwaith/AppData/Local/Microsoft/WindowsApps/python.exe',
        ['./Analyzer/Analyzer.py']
    );

    let result = '';
    let errorOutput = '';

    // Handle Python stdout
    python.stdout.on('data', (data) => {
        result += data.toString();
    });

    // Handle Python stderr
    python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Python error: ${data}`);
    });

    // Handle Python process exit
    python.on('close', (code) => {
        console.log('Raw Python result:', result);
        if (code === 0) {
            try {
                //const output = JSON.parse(result);
                //console.log('Parsed output:', output);
                res.json(result);
            } catch (e) {
                console.error('Failed to parse JSON from Python:', result);
                res.status(500).json({ error: 'Failed to parse Python output.' });
            }
        } else {
            res.status(500).json({ error: 'Python script failed.', stderr: errorOutput });
        }
    });

    // Send base64 image to Python via stdin
    python.stdin.write(JSON.stringify({ image: imageBase64 }));
    python.stdin.end();
});




app.post('/groqchat', async (req, res) => {
  const { messages, plantTranslation } = req.body;

  const initialPrompt = {
    role: 'system',
    content: `You are a talking plant. Start the conversation based on this mood: "${plantTranslation}". Respond like you're alive and thoughtful, but you're still a plant.`
  };

  const chatPayload = {
    messages: [initialPrompt, ...messages],
    model: 'llama3-8b-8192',
    temperature: 0.7,
    max_tokens: 300,
    stop: null
  };

  try {
    const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', chatPayload, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = groqRes.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Groq error:', error.message);
    res.status(500).json({ error: 'Failed to get response from Groq AI' });
  }
});


app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});
