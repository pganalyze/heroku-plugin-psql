import {
  caseInsensitiveEq,
  caseInsensitiveIncludes,
  findMatchingKeyValuePair,
} from './util'

import {expect} from '@oclif/test'

describe('caseInsensitiveEq', () => {
  const cases: [ string, string, boolean ][] = [
    ['foo', 'foo', true],
    ['foo', 'FOO', true],
    ['FOO', 'Foo', true],
    ['foo', 'bar', false],
  ]

  cases.forEach(([arg1, arg2, expected]) => {
    it(`evalutes ${arg1} and ${arg2} as ${expected ? 'equal' : 'different'}`, () => {
      expect(caseInsensitiveEq(arg1, arg2)).to.equal(expected)
    })
  })
})

describe('caseInsensitiveIncludes', () => {
  const cases: [ string, string, boolean ][] = [
    ['postgres', 'postgres', true],
    ['postgres', 'stgr', true],
    ['postgres', 'postgresql', false],
    ['POSTGRES', 'postgres', true],
    ['POSTGRES', 'stgr', true],
    ['POSTGRES', 'postgresql', false],
  ]

  cases.forEach(([str, substr, expected]) => {
    it(`considers ${str} to ${expected ? '' : 'not '}include ${substr}`, () => {
      expect(caseInsensitiveIncludes(str, substr)).to.equal(expected)
    })
  })
})

describe('findMatchingKeyValuePair', () => {
  type ConfigType = { [k: string]: string };
  type ConfigPair = [ string, string ] | undefined;
  const cases: [ string, ConfigType, ConfigPair ][] = [
    ['DB', {DB: 'postgres:///db'}, ['DB', 'postgres:///db']],
    ['D', {DB: 'postgres:///db'}, ['DB', 'postgres:///db']],
    ['ALT_DB', {DB: 'postgres:///db'}, undefined],
    ['db', {DB: 'postgres:///db'}, ['DB', 'postgres:///db']],
    ['d', {DB: 'postgres:///db'}, ['DB', 'postgres:///db']],
    ['alt_db', {DB: 'postgres:///db'}, undefined],
  ]

  cases.forEach(([candidateKey, hash, expected]) => {
    const fmtKeypair = (pair: [ string, string ] | undefined): string => {
      if (!pair) {
        return 'no match'
      }
      const [k, v] = pair
      return `(${k},${v})`
    }
    it(`finds ${fmtKeypair(expected)} in ${JSON.stringify(hash)} using ${candidateKey}`, () => {
      expect(findMatchingKeyValuePair(candidateKey, hash)).to.deep.equal(expected)
    })
  })
})
