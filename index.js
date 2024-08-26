
require("dotenv").config();
const path = require("path");
const url = require('url');
const express = require("express");
const OpenAI = require('openai');

const { getTweetContext, isTwitterDomain } = require('./twitterScrape.js');


//https://andrejgajdos.com/how-to-create-a-link-preview/


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
        console.log(isTwitterDomain(url))

        if (isTwitterDomain(url)) {
            const { tweets } = await getTweetContext(url)
            res.status(200).json({ type: "tweet", data: tweets[0] });
            return
        }

        const response = await fetch(url);
        const html = await response.text();
        const metadata = await metascraper({ html, url });

        const dom = new JSDOM(html);
        const document = dom.window.document;

        const serializedHtml = dom.serialize();

        let parsedDoc = readable(document)

        const favicon = getFavicon(document, url)
        const title = document.querySelector('title')?.textContent || 'No title available';

        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;

        const links = Array.from(document.querySelectorAll('a'))
            .map(anchor => {
                // Resolve the relative URLs to absolute URLs
                try {
                    return new URL(anchor.href, url).href;
                } catch (err) {
                    console.warn(`Invalid URL skipped: ${anchor.href}`);
                    return null;
                }
            })
            .filter(href => href); // Ensure there are no empty hrefs
        const uniqueLinks = [...new Set(links)];

        // res.status(200).json({ metadata, parsedDoc, data: { domain, title, favicon, links: uniqueLinks }, document, serializedHtml });
        res.status(200).json({ type: 'page', data: { title: metadata.title, image: metadata.image, description: metadata.description, domain, favicon, url: metadata.url } });
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

function getFavicon(document, url) {

    let faviconUrl = document.querySelector('link[rel="icon"]')?.getAttribute('href') ||
        document.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
        document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href');

    if (faviconUrl) {
        // If the favicon URL is relative, resolve it against the base URL
        if (!faviconUrl.startsWith('http')) {
            const baseUrl = new URL(url).origin;
            faviconUrl = new URL(faviconUrl, baseUrl).href;
        }
    } else {
        // Fallback to a common location if no favicon link is found
        faviconUrl = `${new URL(url).origin}/favicon.ico`;
    }

    return faviconUrl;
}

const PORT = 3001 || process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
