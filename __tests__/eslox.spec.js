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

    const number = eslox.run('100')
    expect(number).toEqual(100)
  })

  it('should interpret unary values', () => {
    const t = eslox.run('!false')
    expect(t).toEqual(true)

    const f = eslox.run('!true')
    expect(f).toEqual(false)

    const n = eslox.run('-1')
    expect(n).toEqual(-1)
  })

  it('should interpret binary values', () => {
    const minus = eslox.run('1 - 1')
    expect(minus).toEqual(0)

    const divide = eslox.run('15 / 3')
    expect(divide).toEqual(5)

    const multiply = eslox.run('2 * 2')
    expect(multiply).toEqual(4)

    const plus = eslox.run('2 + 12')
    expect(plus).toEqual(14)

    const sc = eslox.run(`"a" + "b"`)
    expect(sc).toEqual('ab')

    const gn = eslox.run(`5 > 2`)
    expect(gn).toEqual(true)

    const ge = eslox.run(`5 >= 5`)
    expect(ge).toEqual(true)

    const ge_ = eslox.run(`4 >= 5`)
    expect(ge_).toEqual(false)

    const less = eslox.run('4 < 5')
    expect(less).toEqual(true)

    const lessEqual = eslox.run('10 <= 10')
    expect(lessEqual).toEqual(true)

    const eq = eslox.run('0 == 0')
    expect(eq).toEqual(true)

    const eq_ = eslox.run('1 == 1')
    expect(eq_).toEqual(true)

    const eq__ = eslox.run('3 == 1')
    expect(eq__).toEqual(false)

    const ne = eslox.run('2 != 1')
    expect(ne).toEqual(true)

    const ne_ = eslox.run('0 != 0')
    expect(ne_).toEqual(false)

    const ne__ = eslox.run('100 != "100"')
    expect(ne__).toEqual(false)
  })
})
