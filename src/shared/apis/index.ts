import {request} from './request-core';
import {RequestMethodProps, WithErrorHandling} from './request-type';

/**
 * @description GET 메서드로 API 요청을 보내는 함수
 * @param {RequestMethodProps} props - API 요청을 위한 프로퍼티 객체 (baseUrl, endpoint, headers, errorHandlingType)
 * @returns {Promise<T>} - API 응답을 반환하는 Promise 객체
 */
export async function requestGet<T>({
  headers = {},
  errorHandlingType = 'errorBoundary',
  withResponse = true,
  ...args
}: WithErrorHandling<RequestMethodProps>): Promise<T> {
  return request<T>({
    ...args,
    method: 'GET',
    headers,
    withResponse,
    errorHandlingType,
  });
}

/**
 * @description POST 메서드로 API 요청을 보내는 함수
 * @param {RequestMethodProps} props - API 요청을 위한 프로퍼티 객체 (baseUrl, endpoint, headers, body)
 * @returns {Promise<T>} - API 응답을 반환하는 Promise 객체
 */
export async function requestPost<T = void>({
  headers = {},
  withResponse = false,
  ...args
}: RequestMethodProps): Promise<T> {
  return request<T>({
    ...args,
    method: 'POST',
    headers,
    withResponse,
  });
}

/**
 * @description PUT 메서드로 API 요청을 보내는 함수
 * @param {RequestMethodProps} props - API 요청을 위한 프로퍼티 객체 (baseUrl, endpoint, headers, body)
 * @returns {Promise<T>} - API 응답을 반환하는 Promise 객체
 */
export async function requestPut<T = void>({
  headers = {},
  withResponse = false,
  ...args
}: RequestMethodProps): Promise<T> {
  return request<T>({
    ...args,
    method: 'PUT',
    headers,
    withResponse,
  });
}

/**
 * @description DELETE 메서드로 API 요청을 보내는 함수
 * @param {RequestMethodProps} props - API 요청을 위한 프로퍼티 객체 (baseUrl, endpoint, headers)
 * @returns {Promise<T>} - API 응답을 반환하는 Promise 객체
 */
export async function requestDelete<T = void>({
  headers = {},
  withResponse = false,
  ...args
}: RequestMethodProps): Promise<T> {
  return request<T>({
    ...args,
    method: 'DELETE',
    headers,
    withResponse,
  });
}

/**
 * @description PATCH 메서드로 API 요청을 보내는 함수
 * @param {RequestMethodProps} props - API 요청을 위한 프로퍼티 객체 (baseUrl, endpoint, headers, body)
 * @returns {Promise<T>} - API 응답을 반환하는 Promise 객체
 */
export async function requestPatch<T = void>({
  headers = {},
  withResponse = false,
  ...args
}: RequestMethodProps): Promise<T> {
  return request<T>({
    ...args,
    method: 'PATCH',
    headers,
    withResponse,
  });
}
