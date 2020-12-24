var cors = require('cors');
const express = require("express");
var bodyParser = require('body-parser')
const app = express();

const cheerio = require('cheerio');
const getUrls = require('get-urls');
const fetch = require('node-fetch');

var jsonParser = bodyParser.json()

// Allow cross origin requests.
app.use(cors());

const scrapeMetatags = (text) => {
    // Parse urls from text.
    const urls = Array.from(getUrls(text));

    const requests = urls.map(async url => {
        const res = await fetch(url);

        const html = await res.text();
        const $ = cheerio.load(html);

        const getMetatag = (name) =>
            $(`meta[name=${name}]`).attr('content') ||
            $(`meta[name="og:${name}"]`).attr('content') ||
            $(`meta[name="twitter:${name}"]`).attr('content');

        return {
            url,
            title: $('title').first().text(),
            favicon: $('link[rel="shortcut icon"]').attr('href'),
            description: getMetatag('description'),
            image: getMetatag('image'),
            author: getMetatag('author'),
        }
    });

    // Return an array to the results of all the promises.
    return Promise.all(requests);
}

app.post('/parse', jsonParser, async (req, res) => {
    const data = await scrapeMetatags(req.body.text);

    res.send(data);
})

const PORT = 4000 || process.env.PORT;
app.listen(PORT, () => console.log(`Running on ${PORT}`));