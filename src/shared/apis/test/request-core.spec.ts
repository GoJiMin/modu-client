import 'whatwg-fetch';
import {createRequestInit, handleRequestError, prepareRequest, request} from '../request-core';
import {RequestError, RequestGetError} from '../request-error';

describe('src/shared/apis/request-core.ts', () => {
  describe('createRequestInit', () => {
    it('요청 본문이 FormData인 경우 Content-type을 설정하지 않는다.', () => {
      const data = new FormData();
      const requestInit = createRequestInit({
        method: 'POST',
        body: data,
      });

      expect(requestInit.headers).toBeUndefined();
      expect(requestInit.body).toStrictEqual(data);
    });

    it('요청 본문이 FormData가 아닌 경우 Content-Type을 application/json으로 설정한다.', () => {
      const requestInit = createRequestInit({
        method: 'POST',
        body: {},
        headers: {
          foo: 'bar',
        },
      });

      expect(requestInit.headers).toStrictEqual({'Content-Type': 'application/json', foo: 'bar'});
    });

    it('요청 본문이 객체 및 원시값인 경우 문자열화한다.', () => {
      const origin = {test: 'test'};
      const requestInit = createRequestInit({
        method: 'POST',
        body: origin,
      });

      expect(requestInit.body).toBe(JSON.stringify(origin));
    });

    it('요청 본문이 없을 경우 null로 초기화된다.', () => {
      const requestInit = createRequestInit({
        method: 'GET',
        headers: {
          foo: 'bar',
        },
      });

      expect(requestInit.body).toBeNull();
      expect(requestInit.headers).toStrictEqual({
        'Content-Type': 'application/json',
        foo: 'bar',
      });
    });
  });

  describe('prepareRequest', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.modu-review.com';
    });

    it('baseUrl을 전달하지 않으면 기본값이 사용된다.', () => {
      const defaultURL = process.env.NEXT_PUBLIC_API_URL;
      const endpoint = '/test';

      const toBe = defaultURL + endpoint;

      const {url} = prepareRequest({method: 'GET', endpoint});

      expect(url).toBe(toBe);
    });

    it('baseUrl을 전달하면 전달한 url을 사용한다.', () => {
      const baseUrl = 'https://modu-review.com';
      const endpoint = '/test';

      const toBe = baseUrl + endpoint;

      const {url} = prepareRequest({method: 'GET', baseUrl, endpoint});

      expect(url).toBe(toBe);
    });

    it('쿼리 파라미터가 인코딩되어 포함된다.', () => {
      const {url} = prepareRequest({
        method: 'GET',
        baseUrl: 'https://modu-review.com',
        endpoint: '/test',
        queryParams: {key1: 'value1', key2: '한글', key3: true, key4: '띄 어쓰기'},
      });

      const parsed = new URL(url);
      expect(parsed.searchParams.get('key1')).toBe('value1');
      expect(parsed.searchParams.get('key2')).toBe('한글');
      expect(parsed.searchParams.get('key3')).toBe('true');
      expect(parsed.searchParams.get('key4')).toBe('띄 어쓰기');
    });

    it('requestInit 객체가 생성된다.', () => {
      const {requestInit} = prepareRequest({
        method: 'GET',
        headers: {
          foo: 'bar',
        },
        endpoint: '/test',
      });

      expect(requestInit.method).toBe('GET');
      expect(requestInit.headers).toStrictEqual({
        'Content-Type': 'application/json',
        foo: 'bar',
      });
    });
  });

  describe('handleRequestError', () => {
    it('응답 본문을 파싱하지 못한 경우 기본 에러 정보를 표시한다.', async () => {
      const status = 500;
      const error = await handleRequestError({
        body: null,
        response: {json: jest.fn().mockRejectedValue(new Error('에러')), status} as unknown as Response,
        requestInit: {method: 'GET'},
      });

      expect(error).toMatchObject({
        name: 'UNKNOWN_ERROR',
        message: '알 수 없는 에러가 발생했어요.',
        status,
      });
    });

    it('응답 본문을 파싱한 경우 본문의 에러 정보를 표시한다.', async () => {
      const json = {
        title: 'TEST_ERROR',
        detail: '테스트 에러',
        status: 400,
      };

      const error = await handleRequestError({
        body: null,
        response: {json: jest.fn().mockResolvedValue(json)} as unknown as Response,
        requestInit: {method: 'GET'},
      });

      expect(error).toMatchObject({
        name: json.title,
        message: json.detail,
        status: json.status,
      });
    });

    it('GET 요청일 경우 RequestGetError 에러 객체가 생성된다.', async () => {
      const url = 'https://modu-review.com/test';
      const json = {
        title: 'TEST_ERROR',
        detail: '테스트 에러',
        status: 400,
      };

      const error = await handleRequestError({
        body: null,
        requestInit: {method: 'GET'},
        response: {
          json: jest.fn().mockResolvedValue(json),
          url,
        } as unknown as Response,
        errorHandlingType: 'toast',
      });

      expect(error).toBeInstanceOf(RequestGetError);
      expect(error).toMatchObject({
        name: json.title,
        message: json.detail,
        status: json.status,
        errorHandlingType: 'toast',
        requestBody: null,
        endpoint: url,
        method: 'GET',
      });
    });

    it('GET 요청이 아닐 경우 RequestError 객체가 생성된다.', async () => {
      const url = 'https://modu-review.com/test';
      const json = {
        title: 'TEST_ERROR',
        detail: '테스트 에러',
        status: 400,
      };

      const error = await handleRequestError({
        body: null,
        response: {json: jest.fn().mockResolvedValue(json), status: 500, url} as unknown as Response,
        requestInit: {method: 'POST'},
      });

      expect(error).not.toBeInstanceOf(RequestGetError);
      expect(error).toBeInstanceOf(RequestError);
      expect(error).toMatchObject({
        name: json.title,
        message: json.detail,
        status: json.status,
        endpoint: url,
        requestBody: null,
        method: 'POST',
      });
    });
  });

  describe('request', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.modu-review.com';
    });

    it('401 응답 시 토큰 재발행 요청을 보내고 성공하면 기존 요청을 재시도한다.', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      fetchSpy
        .mockResolvedValueOnce({ok: false, status: 401} as Response)
        .mockResolvedValueOnce({ok: true} as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ok: true}),
        } as unknown as Response);

      const URL = process.env.NEXT_PUBLIC_API_URL;
      const result = await request<{ok: boolean}>({
        method: 'GET',
        endpoint: '/test',
        withResponse: true,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(fetchSpy.mock.calls[0][0]).toBe(URL + '/test');
      expect(fetchSpy.mock.calls[1][0]).toBe(URL + '/token/refresh');
      expect(fetchSpy.mock.calls[1][1]).toMatchObject({
        cache: 'no-cache',
        credentials: 'include',
        next: {revalidate: 0},
      });
      expect(fetchSpy.mock.calls[2][0]).toBe(URL + '/test');
      expect(result).toStrictEqual({ok: true});
    });

    it('토큰 재발행 실패 시 브라우저 환경일 때만 RequestError를 발생시킨다.', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      fetchSpy
        .mockResolvedValueOnce({ok: false, status: 401} as Response)
        .mockResolvedValueOnce({ok: false} as Response);

      try {
        await request({
          method: 'GET',
          endpoint: '/test',
        });
      } catch (error) {
        expect(error).toMatchObject({
          name: 'TOKEN_EXPIRED',
          status: 401,
        });
      }
    });

    it('401이 아닌 실패 응답은 handleRequestError 결과를 throw한다.', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');
      const json = {
        title: 'TEST_ERROR',
        detail: '테스트 에러',
        status: 500,
      };
      const URL = process.env.NEXT_PUBLIC_API_URL;

      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        url: URL,
        json: jest.fn().mockResolvedValue(json),
      } as unknown as Response);

      try {
        await request({
          method: 'POST',
          endpoint: '/test',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RequestError);
        expect(error).toMatchObject({
          name: json.title,
          message: json.detail,
          status: json.status,
        });
      }
    });

    it('withResponse가 true면 응답을 파싱해 반환한다.', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');
      const value = {data: 1};

      fetchSpy.mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(value),
      } as unknown as Response);

      const result = await request<{data: number}>({
        method: 'GET',
        endpoint: '/test',
        withResponse: true,
      });

      expect(result).toStrictEqual(value);
    });

    it('withResponse가 false면 undefined를 반환한다.', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      fetchSpy.mockResolvedValue({
        ok: true,
        status: 204,
        json: jest.fn(),
      } as unknown as Response);

      const result = await request({
        method: 'GET',
        endpoint: '/test',
        withResponse: false,
      });

      expect(result).toBeUndefined();
    });
  });
});
