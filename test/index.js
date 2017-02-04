'use strict';
let aws = require('aws-sdk')
let secureBackup = require('../');
let path = require('path');
let s3 = require('../lib/handlers/s3.js');
let pgHandler = require('../lib/handlers/pg');

let bp = secureBackup({
  pubKeyPath: path.resolve(__dirname, './public.pem'),
  outputName: 'backup.sql',
  outputPath: '/home/oscar/code/backup/',
  compress: true,
  pg: pgHandler({
    user: 'postgres',
    database: 'tourip'
  }),
  s3: s3({
    handler: new aws.S3({
      signatureVersion: 'v4'
    }),
    bucket: 'tourip'
  })
})
