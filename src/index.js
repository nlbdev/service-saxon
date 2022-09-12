/* jshint esversion: 9 */
require('dotenv').config();

const express = require('express');
const SaxonJS = require('saxon-js');

const app = express();
const port = process.env.port || 19150;

// HTTP GET /health
app.get('/health', (req, res) => {
    res.send('OK');
});

// HTTP GET /xslt/:processName?editionId=
app.get('/xslt/:processName', (req, res) => {
    try {
        const xslt = req.params.processName;
        const xsltPath = `${process.env.XsltBasePath || "./test/xslt"}/${xslt}.sef.json`;
        const editionId = req.query.editionId;
        const xmlPath = `${process.env.BooksBasePath || "./test/books"}/${editionId}/${editionId}.xml`;
        SaxonJS.transform({
            stylesheetFileName: xsltPath,
            sourceFileName: xmlPath,
            destination: "serialized"
        }, "async").then(output => {
            // Write new file from output.principalResult at outputPath
            res.send(output.principalResult);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// HTTP POST /xslt/:processName
app.post('/xslt/:processName', (req, res) => {
    try {
        const xslt = req.params.processName;
        const xsltPath = `${process.env.XsltBasePath || "./test/xslt"}/${xslt}.sef.json`;
        const xmlString = req.body;
        SaxonJS.transform({
            stylesheetFileName: xsltPath,
            sourceText: xmlString,
            destination: "serialized"
        }, "async").then(output => {
            res.type("application/xml").send(output.principalResult);
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// Server start
app.listen(port, () => {
    console.log(`service-saxon listening at http://localhost:${port}`);
});
