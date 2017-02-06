# secure-backup

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

secure-backup is a nodejs module which you can use to safely encrypt your mysql or postgres database backups.
your backups will never touch your server disk without being encrypted first, you can also directly upload your backup directly to aws s3 storage.
To use this module it is required to have a public/private key pair

### Install

```
 npm install secure-backup
```

### requirements
secure-backup needs the following software to work properly
 - openssl (required)
 - public/private key pair (required)
 - nodejs v4+
 - postgres/mysql (required)
 - aws-sdk (optional)
