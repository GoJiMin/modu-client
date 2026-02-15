import {getSearchLimitStatus} from '../getSearchLimitStatus';

describe('getSearchLimitStatus 유틸리티 테스트', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-14'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const TODAY = '2026-02-14';
  const MAX_LIMIT = 3;

  it('총 제한량이 3회일 때 올바른 형식의 쿠키(2회 사용)가 전달되면, 남은 횟수(1회)와 현재 사용 횟수(2회)를 반환한다.', () => {
    const cookie = {
      name: 'search_limit',
      value: JSON.stringify({usage: 2, lastSearchDate: TODAY}),
    };

    const status = getSearchLimitStatus(MAX_LIMIT, cookie);

    expect(status.isBlocked).toBe(false);
    expect(status.remaining).toBe(1);
    expect(status.currentUsage).toBe(2);
    expect(status.lastSearchDate).toBe(TODAY);
    expect(status.today).toBe(TODAY);
  });

  it('JSON 파싱이 불가능한 문자열 쿠키라면, 사용량을 초기화한다.', () => {
    const cookie = {
      name: 'search_limit',
      value: 'invalid-json-string',
    };

    const status = getSearchLimitStatus(MAX_LIMIT, cookie);

    expect(status.remaining).toBe(3);
    expect(status.currentUsage).toBe(0);
    expect(status.isBlocked).toBe(false);
  });

  it('JSON 형식이지만 스키마(타입)가 다르면, 사용량을 초기화한다.', () => {
    const cookie = {
      name: 'search_limit',
      value: JSON.stringify({usage: 'not-a-number', lastSearchDate: 'invalid-date'}),
    };

    const status = getSearchLimitStatus(MAX_LIMIT, cookie);

    expect(status.remaining).toBe(3);
    expect(status.currentUsage).toBe(0);
    expect(status.isBlocked).toBe(false);
  });

  it('쿠키가 아예 없다면(undefined), 사용량을 초기화한다.', () => {
    const status = getSearchLimitStatus(MAX_LIMIT);

    expect(status.remaining).toBe(3);
    expect(status.currentUsage).toBe(0);
    expect(status.isBlocked).toBe(false);
  });

  it('마지막 사용 날짜가 오늘이 아니라면(어제), 사용량을 초기화한다.', () => {
    const YESTERDAY = '2026-02-13';
    const cookie = {
      name: 'search_limit',
      value: JSON.stringify({usage: 3, lastSearchDate: YESTERDAY}),
    };

    const status = getSearchLimitStatus(MAX_LIMIT, cookie);

    expect(status.remaining).toBe(3);
    expect(status.currentUsage).toBe(0);
    expect(status.isBlocked).toBe(false);
    expect(status.lastSearchDate).toBe(TODAY);
  });
});
