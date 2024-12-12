import {
  exitTeamUsingPOST,
  joinTeamUsingPOST,
  listTeamByPageUsingPOST, listTeamMyJoinedByPageUsingPOST,
} from '@/services/lingxibi/teamController';
import { useModel } from '@@/exports';
import { LogoutOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Avatar, Form, List, message } from 'antd';
import React, { useEffect, useState } from 'react';

const TeamPage: React.FC = () => {
  const [form] = Form.useForm();
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  // const [isSearch, setIsSearch] = useState(false);
  const [searchParams, setSearchParams] = useState<API.TeamQueryRequest>({ ...initSearchParams });
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [teamVOList, setTeamVOList] = useState<API.TeamVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // 页面加载时加载数据
  const initData = async () => {
    setLoading(true);
    try {
      const res = await listTeamMyJoinedByPageUsingPOST(searchParams);
      if (res.data) {
        setTeamVOList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
      } else {
        message.error('获取队伍失败,' + `${res.message}`);
      }
    } catch (e: any) {
      message.error('获取队伍失败，' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [searchParams]);

  const joinTeam = async (id: number) => {
    try {
      const res = await joinTeamUsingPOST({ id });
      if (res.data) {
        message.success('加入队伍成功');
      }
    } catch (e: any) {
      message.error('加入队伍失败，' + e.message);
    }
  };

  const exitTeam = async (id: number) => {
    try {
      const res = await exitTeamUsingPOST({ id });
      if (res.data) {
        message.success('退出队伍成功');
      }
    } catch (e: any) {
      message.error('退出队伍失败，' + e.message);
    }
  };

  return (
    <div className="my-chart-page">
      <List
        bordered={true}
        itemLayout="vertical"
        size="large"
        loading={loading}
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize,
            });
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total,
        }}
        dataSource={teamVOList}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <PlusCircleOutlined key="pluscircle-icon" onClick={() => joinTeam(item.id)} />,
              <LogoutOutlined key="logout-icon" onClick={() => exitTeam(item.id)} />,
            ]}
            extra={<img width={120} src={item.imgUrl} />}
          >
            <List.Item.Meta
              avatar={<Avatar src={item.userVO && item.userVO.userAvatar} />}
              title={item.name}
              description={item.description}
            />
          </List.Item>
        )}
      ></List>
    </div>
  );
};

export default TeamPage;