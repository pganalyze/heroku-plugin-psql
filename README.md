heroku-plugin-psql
==================

Like heroku pg:psql but for any Postgres database

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/heroku-plugin-psql.svg)](https://npmjs.org/package/heroku-plugin-psql)
[![Downloads/week](https://img.shields.io/npm/dw/heroku-plugin-psql.svg)](https://npmjs.org/package/heroku-plugin-psql)
[![License](https://img.shields.io/npm/l/heroku-plugin-psql.svg)](https://github.com/pganalyze/heroku-plugin-psql/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ yarn add --global heroku-plugin-psql
$ heroku psql --app example-app
--> Connecting to DATABASE_URL
DATABASE=> help
You are using psql, the command-line interface to PostgreSQL.
Type:  \copyright for distribution terms
       \h for help with SQL commands
       \? for help with psql commands
       \g or terminate with semicolon to execute query
       \q to quit
DATABASE=> \q
$ heroku psql --help
Like heroku pg:psql but for non-Heroku databases

USAGE
  $ heroku psql [DATABASE]

OPTIONS
  -a, --app=app        (required) app to run command against
  -r, --remote=remote  git remote of app to use
  --command=command    like --command (-c) in psql, runs single command and exits
  --file=file          like --file (-f) in psql, runs commands from a file and exits

EXAMPLE
  $ heroku psql -a sushi
       DATABASE=> 

```
<!-- usagestop -->

_See code: [src/commands/psql.ts](https://github.com/pganalyze/heroku-plugin-psql/blob/v0.0.0/src/commands/psql.ts)
<!-- commandsstop -->
