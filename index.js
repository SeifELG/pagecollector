
require("dotenv").config();
const path = require("path");
const express = require("express");
const OpenAI = require('openai');

//https://andrejgajdos.com/how-to-create-a-link-preview/

// const metascraper = require('metascraper')([
//     require('metascraper-url')(),
//     require('metascraper-title')(),
//     require('metascraper-description')(),
//     require('metascraper-author')(),
//     require('metascraper-publisher')(),
// ]);

const metascraper = require('metascraper')([
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-logo')(),
    require('metascraper-clearbit')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
]);

// const got = require('got');

const { JSDOM } = require("jsdom");
const { Readability } = require('@mozilla/readability')


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

app.get("/health", (req, res) => {
    res.send("healthy");
});

app.post("/echo", (req, res) => {
    const data = req.body;
    res.status(200).json({ data: data });
});

app.post("/prompt", async (req, res) => {
    try {
        const data = req.body.prompt;
        const chatCompletion = await simplePrompt(data);
        res.status(200).json(chatCompletion);
    } catch (error) {
        console.error("Error", error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

async function simplePrompt(inputStr) {
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: inputStr }],
        model: 'gpt-4o-mini',
    });
    return chatCompletion;
}

app.post("/fetch-metadata", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const response = await fetch(url);
        const html = await response.text();
        const metadata = await metascraper({ html, url });

        const dom = new JSDOM(html);
        const document = dom.window.document;

        let parsedDoc = readable(document)


        res.status(200).json({ metadata, parsedDoc });
    } catch (error) {
        console.error("Error fetching metadata", error);
        res.status(500).send("An error occurred while fetching the metadata.");
    }
});


//https://stackoverflow.com/questions/62314251/how-can-i-implement-mozilla-readability-js-to-my-website
function readable(document) {
    const reader = new Readability(document)
    const article = reader.parse()
    return article
}

const PORT = 3001 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
