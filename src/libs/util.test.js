import {
  isMobile,
  shortenText,
  types,
  validateRoomId,
  validateType,
} from './util'

describe('types', () => {
  test('typesの種類が仕様どおり', () => {
    expect(types.includes('small')).toBe(true)
    expect(types.includes('audio')).toBe(true)
    expect(types.includes('large')).toBe(true)
    expect(types.includes('fuga')).toBe(false)
  })
})

describe('shortenText', () => {
  const len = 8
  test('len以下であればそのまま', () => {
    expect(shortenText('hello', 8)).toBe('hello')
    expect(shortenText('こんにちは', 8)).toBe('こんにちは')
  })
  test('len以上であればshorten', () => {
    expect(shortenText('hellohello', 8)).toBe('...llohello')
    expect(shortenText('こんにちはこんにちは', 8)).toBe('...にちはこんにちは')
  })
})

describe('#validateRoomId()', () => {
  test('roomIdが、uuidフォーマットであればtrue', () => {
    const roomId = 'ef49e49a-e065-450a-a926-aa421baf3786'
    expect(validateRoomId(roomId)).toBe(true)
  })

  test('roomIdが、uuidフォーマットで無いとfalse', () => {
    const roomId = '#f49e49a-e065-450a-a926-aa421baf3786'
    expect(validateRoomId(roomId)).toBe(false)
  })
})

describe('#validateType()', () => {
  test('typeが、仕様どおりなら true', () => {
    expect(validateType('small')).toBe(true)
    expect(validateType('audio')).toBe(true)
    expect(validateType('large')).toBe(true)
  })

  test('typeが仕様以外なら false', () => {
    expect( validateType(0) ).toBe(false)
    expect( validateType(null) ).toBe(false)
    expect( validateType('hoge') ).toBe(false)
  })
})

describe('isMobile', () => {
  test('productが`iPhone`なら true', () => {
    expect(isMobile({product: 'iPhone'})).toBe(true)
  })
  test('productが`iPad`なら true', () => {
    expect(isMobile({product: 'iPad'})).toBe(true)
  })
  test('nameが`Chrome Mobile`なら true', () => {
    expect(isMobile({name: 'Chrome Mobile'})).toBe(true)
  })
  test('nameが`Chrome`なら false', () => {
    expect(isMobile({name: 'Chrome'})).toBe(false)
  })
})