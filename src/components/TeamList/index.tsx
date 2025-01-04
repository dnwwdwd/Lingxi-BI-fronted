import React from "react";
import {Avatar, List, message, Tooltip} from "antd";
import {PlusCircleOutlined, LogoutOutlined} from "@ant-design/icons";
import {useNavigate} from "@umijs/max";
import {exitTeamUsingPOST, joinTeamUsingPOST} from "@/services/lingxibi/teamController";

interface TeamListProps {
  teamVOList: API.TeamVO[]; // 队伍数据
  loading?: boolean; // 是否加载中
  total?: number; // 总数据量
  searchParams: API.TeamQueryRequest; // 分页参数
  setSearchParams: (params: { current: number; pageSize: number }) => void; // 设置分页参数
}




const TeamList: React.FC<TeamListProps> = ({
                                             teamVOList, loading = false, total = 0,
                                             searchParams, setSearchParams
                                           }) => {

  const navigate = useNavigate();


  const joinTeam = async (id: number) => {
    try {
      const res = await joinTeamUsingPOST({id});
      if (res.data) {
        message.success('加入队伍成功');
      }
    } catch (e: any) {
      message.error('加入队伍失败，' + e.message);
    }
  };

  const exitTeam = async (id: number) => {
    try {
      const res = await exitTeamUsingPOST({id});
      if (res.data) {
        message.success('退出队伍成功');
        navigate(-1);
      }
    } catch (e: any) {
      message.error('退出队伍失败，' + e.message);
    }
  };

  return (
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
          onClick={() => navigate(`/team/${item.id}/chart`)}
          actions={[
            !item.inTeam && (
              <Tooltip title="加入队伍" key="pluscircle-icon">
                <PlusCircleOutlined onClick={() => joinTeam(item.id)} />
              </Tooltip>
            ),
            item.inTeam && (
              <Tooltip title="退出队伍" key="logout-icon">
                <LogoutOutlined onClick={() => exitTeam(item.id)} />
              </Tooltip>
            ),
          ].filter(Boolean)}
          extra={<img width={120} src={item.imgUrl} />}
        >
          <List.Item.Meta
            avatar={<Avatar src={item.userVO && item.userVO.userAvatar} />}
            title={item.name}
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
};

export default TeamList;
