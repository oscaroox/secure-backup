# secure-backup

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

secure-backup is a nodejs module which you can use to safely encrypt your mysql or postgres database backups with asymmetric encryption.
your backups will never touch your server disk without being encrypted first, you can also directly upload your backup directly to aws s3 storage.
To use this module it is required to have a public/private key pair.
Secure-backup uses `openssl smime` to encrypt your backups you can decrypt your backups using your private key.

* [secure-backup](#secure-backup)
* [Install](#install)
* [Requirements](#requirements)
* [Decryption](#decryption)
* [Quick example](#quick-example)
* [Usage](#usage)
* [Todos](#todos)
* [License](#license)

Install
========

```cli
 npm install secure-backup
```

Requirements
============
secure-backup needs the following software/files to work properly and must be in your env Path
 - openssl (required)
 - a public/private key pair (required)
 - gzip (optional)
 - nodejs v4+
 - postgres/mysql (required)
 - aws-sdk v2.1.0+ (optional)


Decryption
==========

example decrypting a gzip compressed backup using `openssl smime`
you can omit the `-binary` flag if you didn't use compression.
```cli
openssl smime -decrypt -in 2017-01-25:23:21:22-mysql_dump.sql.gz.enc \
-binary -inform DEM inkey private.pem -out mysql_dump.sql.gz
```
using gzip to decompress a backup
```cli
gzip -d mysql_dump.sql.gz
```
if all went well you should be able to read the .sql file and restore your backup.


Quick example
=============

Basic example.
```js
let secureBackup = require('secure-backup');
let pgHandler = require('secure-backup/lib/handlers/pg')
let backup = secureBackup({
  pubKeyPath: '/path/to/postgres_backup.pub.pem', // path to your public key
  outputPath: '/path/to/output/', // where to output your encrypted backup
  compress: true, // enable compression (gzip)
  handler: pgHandler({
    user: 'postgres',
    database: 'my_database'
  })
})
backup() // can be invoked directly

// or used with a cron-job module like node-schedule
let schedule = nodeSchedule.scheduleJob('0 4 8-14 * *', backup)
```

 Example with s3
 ```js
let secureBackup = require('secure-backup')
let mysqlHandler = require('secure-backup/lib/handlers/mysql')
let s3Handler = require('secure-backup/lib/handlers/s3')
let aws = require('aws-sdk')

let backup = secureBackup({
  pubKeyPath: '/path/to/postgres_backup.pub.pem', // path to your public key
  compress: true, // enable compression (gzip)
  handler: mysqlHandler({
    user: 'mysql_user',
    password: 'my_password', // you can also pass in the password,
    database: 'my_database'
  }),
  s3: s3Handler({
    handler: new aws.S3(),
    bucket: 'my_bucket'
  })
})
backup() // can be invoked directly

// or used with a cron-job module like node-schedule
let nodeSchedule = require('node-schedule')
let schedule = nodeSchedule.scheduleJob('0 4 8-14 * *', backup)
 ```
Usage
======
Before using this module you will need to generate a public/private key pair.

#### `secureBackup({options})`
##### options
###### pubKeyPath
Path to public key, absolute path recommended
Type: `string` (required)

###### outputPath
Where to store the encrypted backup locally, can be omitted when using s3 otherwise required.
absolute path recommended
Type: `string` (optional | required)
default: `null`

###### outputName
What to name the backup should have a extension like .sql or something else.
will be concatenated with a timestamp in the format YYYY-MM-DD:HH:MM:SS
when omitted will use the a default name depending on postgres/mysql handler
Type:  `string` (optional)
default: `pg_dump.sql/mysql_dump.sql`

###### handler
What database handler to use.
Type: `function` (required)

###### compress
will use gzip to compress your backup
Type: `Boolean` (optional)
default: `false`

###### s3
`outputPath` should be omitted when using the s3 handler.
Type: `function` (optional)
default: `null`

 ```js
 let secureBackup = require('secure-backup')
 let pgHandler = require('secure-backup/libs/handlers/pg')
 let s3Handler = require('secure-backup/libs/handlers/s3')
 let backup = secureBackup({
    pubKeyPath: '/path/to/key.pub.pem',
    outputPath: '/path/to/output/',
    outputName: 'my_backup.sql',
    handler: pgHander(...),
    compress: true,
    s3: s3Handler(...)
 })
 ```


 #### `pgHandler({options}) / mysqlHandler({options})`
 ##### options
 ###### user
 postgres/mysql user
 Type: `string` (required)

 ###### password
 postgres/mysql password, can be omitted when using a .pgaccess or .my.cnf file
 Type: `string` (optional)
 default: `null`

 ###### database
 what database to backup
 Type: `string` (required)

 ```js
 let dbHandler = require('secure-backup/lib/handlers/pg') // or mysql require('secure-backup/lib/handlers/mysql')
 ...
  dbHandler({
      user: 'postgres',
      password: 'postgres',
      database: 'my_database'
  })
...
 ```

 #### `s3Handler({options})`
 ##### options
 ###### handler
 Requires a aws s3 instance
 Type: `Instance` (required)

 ###### bucket
 s3 bucket name
 Type: `string` (required)

 ```js
 let s3Handler = require('secure-backup/lib/handlers/s3')
 let aws = require('aws-sdk')
 ...
   s3Handler({
      handler: new aws.S3(),
      bucket: 'my_bucket'
   })
 ...
 ```


Todos
=====

 - Write Tests
 - allow to override gzip options
 - allow other compression software than gzip
 - Add Code Comments
 - Allow gpg?

License
=======

MIT
