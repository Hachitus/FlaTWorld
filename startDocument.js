/* global require, __dirname */
'use strict';

/**
 * This script starts the whole engine public-path, so we can try the tests, using express framework.
 */

// Express dependencies
var express = require('express');

var app = express();

app.use("/", express.static(__dirname + '/documentation/'));
app.listen(9002);