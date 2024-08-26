const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function getTweetContext(tweetUrl) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('running getTweetContext')
        await page.goto(tweetUrl, { waitUntil: 'networkidle2' });

        // Wait for the tweet to load
        await page.waitForSelector('article');

        // Get the page content
        const content = await page.content();
        const $ = cheerio.load(content);

        // Extract the tweet and replies using selectors
        const tweets = [];

        $('article').each((index, element) => {
            const tweetText = $(element).find('div[lang]').text();
            // const tweetAuthor = $(element).find('a[href*="/status/"] span').first().text();
            const tweetTimestamp = $(element).find('time').attr('datetime');
        
            const images = $(element).find('img').map((i, img) => $(img).attr('src')).get();
            const links = $(element).find('a').map((i, link) => $(link).attr('href')).get();

            const authorHandle = links[0].substring(1);

            const userNameDiv = $(element).find('div[data-testid="User-Name"]').text();

           const author = userNameDiv.split('@')[0];

            tweets.push({
                author: author,
                handle: authorHandle,
                pfp: images[0],
                text: tweetText,
                timestamp: tweetTimestamp,
                images,
                links,
            });
        });

        await browser.close();
        console.log("🚀 ~ getTweetContext ~ tweets:", tweets)
        return { content, tweets };
    } catch (error) {
        console.error('Error scraping tweet context:', error);
        await browser.close();
        return null;
    }
}

function isTwitterDomain(url) {
    try {
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;

        // Normalize the domain and check if it matches Twitter or X domains
        const normalizedDomain = domain.replace(/^www\./, '').toLowerCase();

        return normalizedDomain === 'twitter.com' || normalizedDomain === 'x.com';
    } catch (error) {
        console.error('Invalid URL:', error);
        return false;
    }
}

module.exports = {
    getTweetContext,
    isTwitterDomain,
};

// // Example usage
// const tweetUrl = 'https://twitter.com/username/status/1234567890';
// getTweetContext(tweetUrl).then(context => console.log(context));
