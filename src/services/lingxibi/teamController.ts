// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** listMyChartByPage POST /chart/my/list/page */
export async function listTeamByPageUsingPOST(
  body: API.TeamQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTeamVO>('/team/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function listTeamMyJoinedByPageUsingPOST(
  body: API.TeamQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTeamVO>('/team/page/my/joined', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function joinTeamUsingPOST(
  body: API.ChartUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/team/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}


export async function exitTeamUsingPOST(
  body: API.ChartUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/team/exit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}


/** listTeamChartByPageUsingPOST POST /team/chart/page */
export async function listTeamChartByPageUsingPOST(
  body: API.ChartQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageChart_>('/team/chart/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
