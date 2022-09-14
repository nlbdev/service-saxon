/* jshint esversion: 9 */
require('dotenv').config();

// Create a new instance of the express app
const express = require('express');
const app = express();
const port = process.env.port || 19150;

// Load libraries
const SaxonJS = require('saxon-js');
const shellExec = require('shell-exec');


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
        res.type("application/json").status(500).send({ success: false, error });
    }
});

// HTTP POST /xslt/:ProcessName Payload: sourceXmlFile
app.post('/xslt/:ProcessName', (req, res) => {
    try {


        // Transform the content file with the sef.json file using SaxonJS
        SaxonJS.transform({
            stylesheetFileName: xsltSefPath,
            sourceFileName: xsltProcessAbsPath,
            destination: "serialized"
        }, "async").then(output => {
            // Store the result in the output folder
            const outputFilename = `${outputPath}/${xsltFilename}.xml`;
            shellExec(`echo "${output.principalResult}" > ${outputFilename}`).then(console.log).catch(console.error);
            res.type("application/xml").send(output.principalResult);
        });
    } catch (error) {
        console.log(error);
        res.type("application/json").status(500).send({ success: false, error });
    }
});

// HTTP POST /xslt/:ProcessName/update Payload: sourceXsltFile
app.post('/xslt/:ProcessName/update', (req, res) => {
    try {
        const xsltName = req.params.ProcessName;
        const sourceXsltFile = req.body;
        const xsltSefAbsPath = sourceXsltFile.replace(".xsl", ".sef.json");

        shellExec(`xslt3 -xsl:${xsltName} -export:${xsltSefAbsPath} -t -ns:##html5`).then((log) => {
            res.type("application/json").send({ success: true });
        }).catch((error) => {
            console.log(error);
            res.type("application/json").status(500).send({ success: false, error });
        });
    } catch (error) {
        console.log(error);
        res.type("application/json").status(500).send({ success: false, error });
    }
});

// Server start
app.listen(port, () => {
    console.log(`service-saxon listening at http://localhost:${port}`);
});
