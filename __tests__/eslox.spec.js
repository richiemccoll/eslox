import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ESLox } from '../bin/eslox'

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

describe('ESLox - run()', () => {
  let eslox

  beforeEach(() => {
    eslox = new ESLox()
  })

  afterEach(() => {
    eslox = null
  })

  it.each([
    ['false;', false],
    ['true;', true],
    ['nil;', 'nil'],
    ['100;', 100]
  ])('should interpret literal values', (input, expected) => {
    const result = eslox.run(input)
    expect(result).toEqual(expected)
  })

  it.each([
    ['!false;', true],
    ['!true;', false],
    ['-1;', -1]
  ])('should interpret unary values', (input, expected) => {
    const result = eslox.run(input)
    expect(result).toEqual(expected)
  })

  it.each([
    ['1 - 1;', 0],
    ['15 / 3;', 5],
    ['2 * 2;', 4],
    ['2 + 12;', 14],
    [`"a" + "b";`, 'ab'],
    ['5 > 2;', true],
    ['5 >= 5;', true],
    ['4 >= 5;', false],
    ['10 <= 10;', true],
    ['0 == 0;', true],
    ['1 == 1;', true],
    ['3 == 1;', false],
    ['2 != 1;', true],
    ['0 != 0;', false],
    ['100 != 100;', false]
  ])('should interpret binary values', (input, expected) => {
    const result = eslox.run(input)
    expect(result).toEqual(expected)
  })

  it.each([
    ['print 1 - 1;', 0],
    ['print "one";', 'one'],
    ['print true;', true],
    ['print 2 + 1;', 3]
  ])('should handle print statements', (input, expected) => {
    const result = eslox.run(input)
    expect(result).toEqual(expected)
  })

  it('should handle variable assignments', () => {
    eslox.run(`var a = 1;`)
    eslox.run(`var b = 2;`)
    const result = eslox.run(`print a + b;`)
    expect(result).toEqual(3)
  })

  it('should handle variable re-assignments', () => {
    eslox.run(`var a = 1;`)
    eslox.run(`a = 2;`)
    const result = eslox.run(`print a;`)
    expect(result).toEqual(2)
  })
})

describe('ESLox - runFile()', () => {
  let eslox

  beforeEach(() => {
    eslox = new ESLox()
  })

  afterEach(() => {
    eslox = null
  })

  it('should read files', () => {
    const result = eslox.runFile(path.resolve(__dirname, './test.eslox'))
    expect(result).toEqual(true)
  })
})
