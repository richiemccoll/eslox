import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ESLox } from '../bin/eslox'

describe('ESLox - run()', () => {
  let eslox = null

  beforeEach(() => {
    eslox = new ESLox()
  })

  afterEach(() => {
    eslox = null
  })

  it('run("/") should generate the correct token list', () => {
    const res = eslox.run('/').map(token => token.toString())
    expect(res).toEqual([
      'type=/ lexeme=/ literal=undefined',
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("//") should generate the correct token list for comments', () => {
    const res = eslox.run('//').map(token => token.toString())
    expect(res).toEqual(['type=eof lexeme=empty literal=undefined'])
  })

  it('run("(( )){}") should generate the correct token list for groupings', () => {
    const res = eslox.run('(( )){}').map(token => token.toString())
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
    const res = eslox.run('!*+-/=<> <= ==').map(token => token.toString())
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
    const res = eslox.run('"test"').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="test" literal=test`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("") should generate the correct token list', () => {
    const res = eslox.run('""').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="" literal=`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("test a word") should generate the correct token list', () => {
    const res = eslox.run('"test a word"').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="test a word" literal=test a word`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("1") should generate the correct token list', () => {
    const res = eslox.run('1').map(token => token.toString())
    expect(res).toEqual([
      `type=num lexeme=1 literal=1`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("120") should generate the correct token list', () => {
    const res = eslox.run('120').map(token => token.toString())
    expect(res).toEqual([
      `type=num lexeme=120 literal=120`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("120.50") should generate the correct token list', () => {
    const res = eslox.run('120.50').map(token => token.toString())
    expect(res).toEqual([
      `type=num lexeme=120.50 literal=120.5`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("test=120.50") should generate the correct token list', () => {
    const res = eslox.run('"test"=120.50').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="test" literal=test`,
      `type== lexeme== literal=undefined`,
      `type=num lexeme=120.50 literal=120.5`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("class") should generate the correct token list', () => {
    const res = eslox.run('class').map(token => token.toString())
    expect(res).toEqual([
      `type=class lexeme=class literal=undefined`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("var test = "value"") should generate the correct token list', () => {
    const res = eslox.run(`var test = "value"`).map(token => token.toString())
    expect(res).toEqual([
      'type=var lexeme=var literal=undefined',
      'type=id lexeme=test literal=undefined',
      'type== lexeme== literal=undefined',
      `type=str lexeme="value" literal=value`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("var test = "value"") should generate the correct token list', () => {
    const res = eslox.run(`var test = "value"`).map(token => token.toString())
    expect(res).toEqual([
      'type=var lexeme=var literal=undefined',
      'type=id lexeme=test literal=undefined',
      'type== lexeme== literal=undefined',
      `type=str lexeme="value" literal=value`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('run("var test = "value"\nif(test) { return }") should generate the correct token list', () => {
    const res = eslox
      .run(
        `var test = "value"
         if (test) { return }
        `
      )
      .map(token => token.toString())
    expect(res).toEqual([
      'type=var lexeme=var literal=undefined',
      'type=id lexeme=test literal=undefined',
      'type== lexeme== literal=undefined',
      `type=str lexeme="value" literal=value`,
      'type=if lexeme=if literal=undefined',
      'type=( lexeme=( literal=undefined',
      'type=id lexeme=test literal=undefined',
      'type=) lexeme=) literal=undefined',
      'type={ lexeme={ literal=undefined',
      'type=return lexeme=return literal=undefined',
      'type=} lexeme=} literal=undefined',
      'type=eof lexeme=empty literal=undefined'
    ])
  })
})
