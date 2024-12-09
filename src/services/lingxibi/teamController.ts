// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** listMyChartByPage POST /api/chart/my/list/page */
export async function listTeamByPageUsingPOST(
  body: API.TeamQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageTeamVO>('/api/team/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
