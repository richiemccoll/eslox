import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { JSLox } from '../bin/jslox'

describe('JSLox - run()', () => {
  let jslox = null

  beforeEach(() => {
    jslox = new JSLox()
  })

  afterEach(() => {
    jslox = null
  })

  it('run("/") should generate the correct token list', () => {
    const res = jslox.run('/').map(token => token.toString())
    expect(res).toEqual([
      'type=/ lexeme=/ literal=undefined',
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("//") should generate the correct token list for comments', () => {
    const res = jslox.run('//').map(token => token.toString())
    expect(res).toEqual(['type=eof lexeme=empty literal=undefined'])
  })

  it('run("(( )){}") should generate the correct token list for groupings', () => {
    const res = jslox.run('(( )){}').map(token => token.toString())
    expect(res).toEqual([
      'type=( lexeme=( literal=undefined',
      'type=( lexeme=( literal=undefined',
      'type=) lexeme=) literal=undefined',
      'type=) lexeme=) literal=undefined',
      'type={ lexeme={ literal=undefined',
      'type=} lexeme=} literal=undefined',
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("!*+-/=<> <= ==") should generate the correct token list for operators', () => {
    const res = jslox.run('!*+-/=<> <= ==').map(token => token.toString())
    expect(res).toEqual([
      'type=! lexeme=! literal=undefined',
      'type=* lexeme=* literal=undefined',
      'type=+ lexeme=+ literal=undefined',
      'type=- lexeme=- literal=undefined',
      'type=/ lexeme=/ literal=undefined',
      'type== lexeme== literal=undefined',
      'type=< lexeme=< literal=undefined',
      'type=> lexeme=> literal=undefined',
      'type=<= lexeme=<= literal=undefined',
      'type=== lexeme=== literal=undefined',
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("test") should generate the correct token list', () => {
    const res = jslox.run('"test"').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="test" literal=test`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("") should generate the correct token list', () => {
    const res = jslox.run('""').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="" literal=`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("test a word") should generate the correct token list', () => {
    const res = jslox.run('"test a word"').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="test a word" literal=test a word`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })
})
