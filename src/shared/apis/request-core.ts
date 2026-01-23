import {RequestError, RequestGetError} from './request-error';
import {
  CreateErrorProps,
  CreateRequestInitProps,
  RequestInitWithMethod,
  RequestProps,
  TErrorInfo,
  WithErrorHandling,
} from './request-type';

/**
 * @description fetch API의 두 번째 인자인 RequestInit 객체를 생성하는 함수
 * @param {CreateRequestInitProps} props - RequestInit 객체를 생성하는 데 필요한 프로퍼티 객체 (body, method, headers)
 * @returns {RequestInitWithMethod} - RequestInit 객체를 반환
 */
export function createRequestInit({
  method,
  body,
  headers,
  cacheOptions,
}: CreateRequestInitProps): RequestInitWithMethod {
  const requestInit: RequestInitWithMethod = {
    credentials: 'include',
    method,
    ...cacheOptions,
  };

  if (body instanceof FormData) {
    return {...requestInit, body};
  } else {
    return {
      ...requestInit,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    };
  }
}

/**
 * @description API 요청을 위한 URL과 RequestInit 객체를 생성하는 함수
 * @param {RequestProps} props - API 요청을 위한 프로퍼티 객체 (baseUrl, endpoint, method, headers, body, queryParams)
 * @returns {Object} - URL과 RequestInit 객체를 반환
 */
export function prepareRequest({
  baseUrl = process.env.NEXT_PUBLIC_API_URL,
  endpoint,
  method,
  headers,
  body,
  queryParams,
  cacheOptions,
}: RequestProps): {
  url: string;
  requestInit: RequestInitWithMethod;
} {
  let url = `${baseUrl}${endpoint}`;

  if (queryParams) {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    url += `?${queryString}`;
  }

  const requestInit = createRequestInit({method, body, headers, cacheOptions});

  return {url, requestInit};
}

/**
 * @description API 요청 중 발생한 에러를 처리하는 함수
 * @param {WithErrorHandling<CreateErrorProps>} props - API 요청 중 발생한 에러를 처리하는 데 필요한 프로퍼티 객체 (response, body, requestInit, errorHandlingType)
 * @returns {Promise<RequestError | RequestGetError>} - API 요청 중 발생한 에러 객체를 반환하는 Promise 객체
 */
export async function handleRequestError({
  response,
  body,
  requestInit,
  errorHandlingType,
}: WithErrorHandling<CreateErrorProps>): Promise<RequestError | RequestGetError> {
  const defaultErrorInfo: TErrorInfo = {
    title: 'UNKNOWN_ERROR',
    detail: '알 수 없는 에러가 발생했어요.',
    status: response.status,
  };

  let parsedErrorInfo: Partial<TErrorInfo> = {};

  try {
    parsedErrorInfo = await response.json();
  } catch {
    // 실패 시 defaultErrorInfo 사용
  }

  const {title, detail, status} = {...defaultErrorInfo, ...parsedErrorInfo};

  if (requestInit.method === 'GET') {
    return new RequestGetError({
      name: title,
      message: detail,
      status,
      requestBody: body,
      endpoint: response.url,
      method: requestInit.method,
      errorHandlingType,
    });
  }

  return new RequestError({
    name: title,
    message: detail,
    status,
    method: requestInit.method,
    endpoint: response.url,
    requestBody: body,
  });
}

/**
 * @description API 요청을 보내는 함수
 * @param {RequestProps} props - API 요청을 위한 프로퍼티 객체 (baseUrl, endpoint, method, headers, body, queryParams)
 * @returns {Promise<T>} - API 응답을 반환하는 Promise 객체
 */
export async function request<T>(props: WithErrorHandling<RequestProps>): Promise<T> {
  const {url, requestInit} = prepareRequest(props);

  let response: Response = await fetch(url, requestInit);

  if (response.status === 401) {
    const refreshResponse = await fetch(process.env.NEXT_PUBLIC_API_URL + '/token/refresh', {
      cache: 'no-cache',
      next: {revalidate: 0},
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      response = await fetch(url, requestInit);
    } else {
      if (typeof window !== 'undefined') {
        throw new RequestError({
          name: 'TOKEN_EXPIRED',
          message: '로그인 세션이 만료되었습니다.',
          status: 401,
          endpoint: url,
          method: requestInit.method,
          requestBody: requestInit.body ?? null,
        });
      }
    }
  }

  if (!response.ok) {
    throw await handleRequestError({
      response,
      body: requestInit.body ?? null,
      requestInit,
      errorHandlingType: props.errorHandlingType,
    });
  }

  if (props.withResponse) {
    return await response.json();
  }

  return undefined as T;
}
