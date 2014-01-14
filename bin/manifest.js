#!/usr/bin/env node
var os = require('os');
var path = require('path');
var level = require('level');
var multilevel = require('multilevel');
var liveFeed = require('level-livefeed');

var db = level(path.join(os.tmpdir(), Math.random() + '.db'));
db.methods = db.methods || {};
db.methods.livefeed = { type: 'readable' };
db.livefeed = function (opts) { return liveFeed(opts) };

multilevel.writeManifest(db, __dirname + '/../manifest.json');
