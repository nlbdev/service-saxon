/* jshint esversion: 9 */
require('dotenv').config();

// Create a new instance of the express app
const express = require('express');
const app = express();
const port = process.env.port || 19150;
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const multer  = require('multer');
const { stringify } = require('flatted');

// Load libraries
const SaxonJS = require('saxon-js');
const shellExec = require('shell-exec').default;

/**
 * Convert XSLT to SEF.JSON
 * @param {string} xsltAbsPath Absolute path for the XSLT file
 * @param {string} xsltSefAbsPath Absolute path for the SEF JSON file
 */
var xslt2sef = function(xsltAbsPath, xsltSefAbsPath) {
    shellExec(`xslt3 -xsl:${xsltAbsPath} -export:${xsltSefAbsPath} -t -ns:##html5`);
};

/**
 * Validate options sent to the server
 * @param {{stylesheetLocation: String?, stylesheetFileName: String?, stylesheetText: String?, stylesheetInternal: {}?, stylesheetBaseURI: String?, sourceType: String?, sourceLocation: String?, sourceFileName: (Object|String)?, sourceNode: {}?, sourceText: String?, sourceBaseURI: String?, stylesheetParams: {}?, initialTemplate: String?, templateParams: {}?, tunnelParams: {}?, initialFunction: String?, functionParams: []?, initialMode: String?, initialSelection: {}?, documentPool: {}?, textResourcePool: {}?, destination: ["replaceBody", "appendToBody", "prependToBody", "raw", "document", "application", "file", "stdout", "serialized"]?, resultForm: ["default","array","iterator","xdm"]?, outputProperties: {}?, deliverMessage: Function?, deliverResultDocument: Function?, masterDocument: {}?, baseOutputURI: String?, collations: {}?, collectionFinder: Function?, logLevel: Number?, nonInteractive: Boolean?}} opts 
 * @returns {{success: Boolean; message: String, opts: {stylesheetLocation: String?, stylesheetFileName: String?, stylesheetText: String?, stylesheetInternal: {}?, stylesheetBaseURI: String?, sourceType: String?, sourceLocation: String?, sourceFileName: (Object|String)?, sourceNode: {}?, sourceText: String?, sourceBaseURI: String?, stylesheetParams: {}?, initialTemplate: String?, templateParams: {}?, tunnelParams: {}?, initialFunction: String?, functionParams: []?, initialMode: String?, initialSelection: {}?, documentPool: {}?, textResourcePool: {}?, destination: ["replaceBody", "appendToBody", "prependToBody", "raw", "document", "application", "file", "stdout", "serialized"]?, resultForm: ["default","array","iterator","xdm"]?, outputProperties: {}?, deliverMessage: Function?, deliverResultDocument: Function?, masterDocument: {}?, baseOutputURI: String?, collations: {}?, collectionFinder: Function?, logLevel: Number?, nonInteractive: Boolean?}?} The return object
 */
 var validate = function(opts) {
    // If stylesheetLocation is defined, then stylesheetFileName, stylesheetText, stylesheetInternal and stylesheetBaseURI must not be defined
    if (opts.stylesheetLocation !== undefined) {
        if (opts.stylesheetFileName !== undefined || opts.stylesheetText !== undefined || opts.stylesheetInternal !== undefined || opts.stylesheetBaseURI !== undefined) {
            return {success: false, message: 'stylesheetLocation is defined, then stylesheetFileName, stylesheetText, stylesheetInternal and stylesheetBaseURI must not be defined'};
        }
    }
    // If stylesheetFileName is defined, then stylesheetLocation, stylesheetText, stylesheetInternal and stylesheetBaseURI must not be defined
    if (opts.stylesheetFileName !== undefined) {
        if (opts.stylesheetLocation !== undefined || opts.stylesheetText !== undefined || opts.stylesheetInternal !== undefined || opts.stylesheetBaseURI !== undefined) {
            return {success: false, message: 'stylesheetFileName is defined, then stylesheetLocation, stylesheetText, stylesheetInternal and stylesheetBaseURI must not be defined'};
        }
    }

    // If stylesheetText is defined, then stylesheetLocation, stylesheetFileName, stylesheetInternal and stylesheetBaseURI must not be defined
    if (opts.stylesheetText !== undefined) {
        if (opts.stylesheetLocation !== undefined || opts.stylesheetFileName !== undefined || opts.stylesheetInternal !== undefined || opts.stylesheetBaseURI !== undefined) {
            return {success: false, message: 'stylesheetText is defined, then stylesheetLocation, stylesheetFileName, stylesheetInternal and stylesheetBaseURI must not be defined'};
        }
    }

    // If stylesheetInternal is defined, then stylesheetLocation, stylesheetText, stylesheetFileName and stylesheetBaseURI must not be defined
    if (opts.stylesheetInternal !== undefined) {
        if (opts.stylesheetLocation !== undefined || opts.stylesheetText !== undefined || opts.stylesheetFileName !== undefined || opts.stylesheetBaseURI !== undefined) {
            return {success: false, message: 'stylesheetInternal is defined, then stylesheetLocation, stylesheetText, stylesheetFileName and stylesheetBaseURI must not be defined'};
        }
    }

    // If stylesheetBaseURI is defined, then stylesheetLocation, stylesheetText, stylesheetInternal and stylesheetFileName must not be defined
    if (opts.stylesheetBaseURI !== undefined) {
        if (opts.stylesheetLocation !== undefined || opts.stylesheetText !== undefined || opts.stylesheetInternal !== undefined || opts.stylesheetFileName !== undefined) {
            return {success: false, message: 'stylesheetBaseURI is defined, then stylesheetLocation, stylesheetText, stylesheetInternal and stylesheetFileName must not be defined'};
        }
    }

    // If sourceText is defined, then sourceLocation, sourceFileName and sourceNode must not be defined
    if (opts.sourceText !== undefined) {
        if (opts.sourceLocation !== undefined || opts.sourceFileName !== undefined || opts.sourceNode !== undefined) {
            return {success: false, message: 'sourceText is defined, then sourceLocation, sourceFileName and sourceNode must not be defined'};
        }
    }

    // If sourceLocation is defined, then sourceText, sourceFileName and sourceNode must not be defined
    if (opts.sourceLocation !== undefined) {
        if (opts.sourceText !== undefined || opts.sourceFileName !== undefined || opts.sourceNode !== undefined) {
            return {success: false, message: 'sourceLocation is defined, then sourceText, sourceFileName and sourceNode must not be defined'};
        }
    }

    // If sourceFileName is defined, then sourceLocation, sourceText and sourceNode must not be defined
    if (opts.sourceFileName !== undefined) {
        if (opts.sourceLocation !== undefined || opts.sourceText !== undefined || opts.sourceNode !== undefined) {
            return {success: false, message: 'sourceFileName is defined, then sourceLocation, sourceText and sourceNode must not be defined'};
        }
    }

    // If sourceNode is defined, then sourceLocation, sourceFileName and sourceText must not be defined
    if (opts.sourceNode !== undefined) {
        if (opts.sourceLocation !== undefined || opts.sourceFileName !== undefined || opts.sourceText !== undefined) {
            return {success: false, message: 'sourceNode is defined, then sourceLocation, sourceFileName and sourceText must not be defined'};
        }
    }

    // If destination = "file", then baseOutputURI must be defined
    if (opts.destination !== undefined && opts.destination === 'file') {
        if (opts.baseOutputURI === undefined) {
            return {success: false, message: 'destination = "file", then baseOutputURI must be defined'};
        }
    }

    return { success: true, message: "Valid", opts };
};

// HTTP GET /health
app.get('/health', (req, res) => {
    res.send('OK');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
const cpUpload = upload.fields([{ name: 'xslt', maxCount: 1 }, { name: 'source', maxCount: 1 }]);

// HTTP POST /xslt/:processName
app.post('/xslt/:processName', cpUpload, (req, res) => {
    try {
        const opts = req.query;

        // Check for required options
        var valid = validate(opts);
        if (valid.success == false) {
            res.type("application/json").status(400).send({ success: valid.success, message: valid.message });
            return;
        }
        var options = valid.opts;

        var xslt;
        var xsltTempFile;
        var xsltSefAbsPath = path.join(__dirname, 'xslt', req.params.processName + '.sef.json');

        // Check if the POST has multipart form data
        if (req.is('multipart/form-data')) {
            // Get the multipart form data for XSLT
            xslt = req.files.xslt[0];

            // Store the file in a temporary file
            xsltTempFile = path.join(__dirname, 'xslt', req.params.processName + '.xsl');
            
            // Write the file stored in memory to the temporary file
            fs.writeFileSync(xsltTempFile, xslt.buffer);

            // Convert XSLT to SEF.JSON
            xslt2sef(xsltTempFile, xsltSefAbsPath);
            options.stylesheetLocation = xsltSefAbsPath;
            options.sourceLocation = xsltTempFile;
        } else if(req.query.stylesheetFileName !== undefined) {
            // Get the absolute path to the XSLT file from the query string
            xsltPath = req.query.stylesheetFileName;

            // Convert XSLT to SEF.JSON
            xslt2sef(xsltPath, xsltSefAbsPath);
            options.sourceLocation = xsltPath;
            options.stylesheetLocation = xsltSefAbsPath;
        } else if( req.query.stylesheetText !== undefined) {
            // Get the XSLT text from the query string
            xslt = req.query.stylesheetText;

            // Store the text in a temporary file
            xsltTempFile = path.join(__dirname, 'xslt', req.params.processName + '.xsl');
            fs.writeFileSync(xsltTempFile, xslt);

            // Convert XSLT to SEF.JSON
            xslt2sef(xsltTempFile, xsltSefAbsPath);
            options.sourceLocation = xsltTempFile;
            options.stylesheetLocation = xsltSefAbsPath;
        }

        // Transform the XML
        SaxonJS.transform(options, "async").then(output => {
            // If the input is a file, return a file
            if(req.files.xslt !== undefined) {
                res.type("application/xml").status(200).send(stringify(output.principalResult));
            }
            // Else if options.stylesheetFileName is defined, store the output in a file on the server, and return a link to the file
            // TODO
            else {
                // Else return the output
                res.type("application/xml").status(200).send(stringify(output.principalResult));
            }
        });
    } catch (error) {
        console.log(error);
        res.type("application/json").status(500).send({ success: false, message: stringify(error) });
    }
});

// Server start
app.listen(port, () => {
    console.log(`service-saxon listening at http://localhost:${port}`);
});
