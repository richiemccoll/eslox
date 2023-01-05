import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ESLox } from '../bin/eslox'

function parseLiteral(val) {
  return JSON.parse(JSON.stringify(val))
}

describe('ESLox - scanSource()', () => {
  let eslox = null

  beforeEach(() => {
    eslox = new ESLox()
  })

  afterEach(() => {
    eslox = null
  })

  it('scanSource("/") should generate the correct token list', () => {
    const res = eslox.scanSource('/').map(token => token.toString())
    expect(res).toEqual([
      'type=/ lexeme=/ literal=undefined',
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("//") should generate the correct token list for comments', () => {
    const res = eslox.scanSource('//').map(token => token.toString())
    expect(res).toEqual(['type=eof lexeme=empty literal=undefined'])
  })

  it('scanSource("(( )){}") should generate the correct token list for groupings', () => {
    const res = eslox.scanSource('(( )){}').map(token => token.toString())
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

  it('scanSource("!*+-/=<> <= ==") should generate the correct token list for operators', () => {
    const res = eslox
      .scanSource('!*+-/=<> <= ==')
      .map(token => token.toString())
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

  it('scanSource("test") should generate the correct token list', () => {
    const res = eslox.scanSource('"test"').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="test" literal=test`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("") should generate the correct token list', () => {
    const res = eslox.scanSource('""').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="" literal=`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("test a word") should generate the correct token list', () => {
    const res = eslox.scanSource('"test a word"').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="test a word" literal=test a word`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("1") should generate the correct token list', () => {
    const res = eslox.scanSource('1').map(token => token.toString())
    expect(res).toEqual([
      `type=num lexeme=1 literal=1`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("120") should generate the correct token list', () => {
    const res = eslox.scanSource('120').map(token => token.toString())
    expect(res).toEqual([
      `type=num lexeme=120 literal=120`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("120.50") should generate the correct token list', () => {
    const res = eslox.scanSource('120.50').map(token => token.toString())
    expect(res).toEqual([
      `type=num lexeme=120.50 literal=120.5`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("test=120.50") should generate the correct token list', () => {
    const res = eslox.scanSource('"test"=120.50').map(token => token.toString())
    expect(res).toEqual([
      `type=str lexeme="test" literal=test`,
      `type== lexeme== literal=undefined`,
      `type=num lexeme=120.50 literal=120.5`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("class") should generate the correct token list', () => {
    const res = eslox.scanSource('class').map(token => token.toString())
    expect(res).toEqual([
      `type=class lexeme=class literal=undefined`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("var test = "value"") should generate the correct token list', () => {
    const res = eslox
      .scanSource(`var test = "value"`)
      .map(token => token.toString())
    expect(res).toEqual([
      'type=var lexeme=var literal=undefined',
      'type=id lexeme=test literal=undefined',
      'type== lexeme== literal=undefined',
      `type=str lexeme="value" literal=value`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("var test = "value"") should generate the correct token list', () => {
    const res = eslox
      .scanSource(`var test = "value"`)
      .map(token => token.toString())
    expect(res).toEqual([
      'type=var lexeme=var literal=undefined',
      'type=id lexeme=test literal=undefined',
      'type== lexeme== literal=undefined',
      `type=str lexeme="value" literal=value`,
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("var test = "value"\nif(test) { return }") should generate the correct token list', () => {
    const res = eslox
      .scanSource(
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

  it('scanSource("/* comment */") should generate the correct token list', () => {
    const res = eslox
      .scanSource(
        `/* comment */
        `
      )
      .map(token => token.toString())
    expect(res).toEqual([
      'type=/* lexeme=/* literal=undefined',
      'type=*/ lexeme=*/ literal=undefined',
      'type=eof lexeme=empty literal=undefined'
    ])
  })

  it('scanSource("/* this is a block level comment */") should generate the correct token list', () => {
    const res = eslox
      .scanSource(
        `/*
        this is a block level
        comment
        */
        `
      )
      .map(token => token.toString())
    expect(res).toEqual([
      'type=/* lexeme=/* literal=undefined',
      'type=*/ lexeme=*/ literal=undefined',
      'type=eof lexeme=empty literal=undefined'
    ])
  })
})

describe('ESLox - parseTokens()', () => {
  let eslox

  beforeEach(() => {
    eslox = new ESLox()
  })

  afterEach(() => {
    eslox = null
  })

  it('should parse literal values', () => {
    const f = eslox.parseTokens(eslox.scanSource('false'))
    expect(parseLiteral(f)).toEqual({ val: false })

    const t = eslox.parseTokens(eslox.scanSource('true'))
    expect(parseLiteral(t)).toEqual({ val: true })

    const n = eslox.parseTokens(eslox.scanSource('1'))
    expect(parseLiteral(n)).toEqual({ val: 1 })

    const s = eslox.parseTokens(eslox.scanSource('"string"'))
    expect(parseLiteral(s)).toEqual({ val: 'string' })
  })
})

describe('ESLox - run()', () => {
  let eslox

  beforeEach(() => {
    eslox = new ESLox()
  })

  afterEach(() => {
    eslox = null
  })

  it('should interpret literal values', () => {
    const f = eslox.run('false')
    expect(f).toEqual(false)

    const t = eslox.run('true')
    expect(t).toEqual(true)

    const n = eslox.run('nil')
    expect(n).toEqual('nil')
  })
})
