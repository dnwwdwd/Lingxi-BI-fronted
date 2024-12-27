// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** doPostFavour POST /post_favour/ */
export async function doPostFavourUsingPOST(
  body: API.PostFavourAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseInt_>('/post_favour/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** listFavourPostByPage POST /post_favour/list/page */
export async function listFavourPostByPageUsingPOST(
  body: API.PostFavourQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePagePostVO_>('/post_favour/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** listMyFavourPostByPage POST /post_favour/my/list/page */
export async function listMyFavourPostByPageUsingPOST(
  body: API.PostQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePagePostVO_>('/post_favour/my/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
