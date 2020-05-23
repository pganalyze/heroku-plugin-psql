/*

This code is based heavily on

  https://github.com/heroku/cli/blob/3bce4bc9fe3e47fc675fea18d3b946a4497aa854/packages/pg-v5/lib/psql.js

which was made available under the following license:

The ISC License (ISC)

Copyright © Heroku 2017

Permission to use, copy, modify, and/or distribute this software for any purpose with
or without fee is hereby granted, provided that the above copyright notice and this
permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD
TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN
NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL
DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

*/

import debugLog from 'debug'

const debug = debugLog('psql')
const noOp = () => { /* do nothing */ }

type ProcessOutput = { toString: () => string };

export const caseInsensitiveEq = (a: string, b: string): boolean => {
  return a.toLowerCase() === b.toLowerCase()
}

export const caseInsensitiveIncludes = (str: string, substr: string): boolean => {
  return str.toLowerCase().includes(substr.toLowerCase())
}

export const findMatchingKeyValuePair = (candidateKey: string, values: { [k: string]: string }): [ string, string ] | undefined => {
  const exactMatch = candidateKey in values ? [candidateKey, values[candidateKey]] as [ string, string ] : undefined
  return exactMatch ||
  Object.entries(values).find(([k]) => caseInsensitiveEq(candidateKey, k)) ||
    Object.entries(values).find(([k]) => caseInsensitiveIncludes(k, candidateKey))
}

function handlePsqlError(reject: any, psql: any) {
  psql.on('error', (err: any) => {
    if (err.code === 'ENOENT') {
      reject('The local psql command could not be located. For help installing psql, see https://devcenter.heroku.com/articles/heroku-postgresql#local-setup')
    } else {
      reject(err)
    }
  })
}

async function execPsql(url: string, query: string): Promise<string> {
  const {spawn} = require('child_process')
  return new Promise((resolve, reject) => {
    let result = ''
    debug('Running query: %s', query.trim())
    const psql = spawn('psql', ['-c', query, '--set', 'sslmode=require', url], {
      env: {PGAPPNAME: 'psql non-interactive', PATH: process.env.PATH},
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    })
    psql.stdout.on('data', function (data: ProcessOutput) {
      result += data.toString()
    })
    psql.on('close', function () {
      resolve(result)
    })
    handlePsqlError(reject, psql)
  })
}

async function execPsqlWithFile(url: string, file: string): Promise<string> {
  const {spawn} = require('child_process')
  return new Promise((resolve, reject) => {
    let result = ''
    debug('Running sql file: %s', file.trim())
    const psql = spawn('psql', ['-f', file, '--set', 'sslmode=require', url], {
      env: {PGAPPNAME: 'psql non-interactive', PATH: process.env.PATH},
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    })
    psql.stdout.on('data', function (data: ProcessOutput) {
      result += data.toString()
    })
    psql.on('close', function () {
      resolve(result)
    })
    handlePsqlError(reject, psql)
  })
}

async function psqlInteractive(url: string, prompt: string): Promise<void> {
  const {spawn} = require('child_process')
  return new Promise((resolve, reject) => {
    let psqlArgs = ['--set', `PROMPT1=${prompt}`, '--set', `PROMPT2=${prompt}`]
    const psqlHistoryPath = process.env.HEROKU_PSQL_HISTORY
    if (psqlHistoryPath) {
      const fs = require('fs')
      const path = require('path')
      if (fs.existsSync(psqlHistoryPath) && fs.statSync(psqlHistoryPath).isDirectory()) {
        const appLogFile = `${psqlHistoryPath}/${prompt.split(':')[0]}`
        debug('Logging psql history to %s', appLogFile)
        psqlArgs = psqlArgs.concat(['--set', `HISTFILE=${appLogFile}`])
      } else if (fs.existsSync(path.dirname(psqlHistoryPath))) {
        debug('Logging psql history to %s', psqlHistoryPath)
        psqlArgs = psqlArgs.concat(['--set', `HISTFILE=${psqlHistoryPath}`])
      } else {
        reject(new Error(`HEROKU_PSQL_HISTORY is set but is not a valid path (${psqlHistoryPath})`))
      }
    }
    psqlArgs = psqlArgs.concat(['--set', 'sslmode=require', url])

    const psql = spawn('psql', psqlArgs, {
      env: {PGAPPNAME: 'psql interactive', PATH: process.env.PATH},
      stdio: 'inherit',
    })
    handlePsqlError(reject, psql)
    psql.on('close', () => {
      resolve()
    })
  })
}

function handleSignals() {
  process.removeAllListeners('SIGINT')
  process.on('SIGINT', noOp)
}

async function exec(url: string, query: string) {
  handleSignals()
  return execPsql(url, query)
}

async function execFile(url: string, file: string) {
  handleSignals()

  return execPsqlWithFile(url, file)
}

async function interactive(url: string, name: string) {
  const prompt = `${name}%R%# `
  handleSignals()

  return psqlInteractive(url, prompt)
}

export default {
  exec, execFile, interactive,
}
