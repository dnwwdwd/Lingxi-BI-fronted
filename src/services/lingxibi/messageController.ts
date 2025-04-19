import {request} from "@@/exports";

export async function readAllMessageUsingPOST(
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/message/read/all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

export async function listMyMessageUsingGET(
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseMessage_>('/message/list/my', {
    method: 'GET',
    ...(options || {}),
  });
}

