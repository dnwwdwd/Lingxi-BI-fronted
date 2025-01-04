import {
  addChartToTeamUsingPOST,
  listMyChartByPageUsingPOST,
  regenChartUsingPOST,
} from '@/services/lingxibi/chartController';
import {useModel} from '@@/exports';
import {Avatar, Button, Card, Form, Input, List, message, Modal, Result, Select} from 'antd';
import {useForm} from 'antd/es/form/Form';
import ReactECharts from 'echarts-for-react';
import React, {useEffect, useState} from 'react';
import Search from 'antd/es/input/Search';
import {request} from "@/app";
import {listAllTeamMyJoinedByPageUsingGET} from "@/services/lingxibi/teamController";

const MyChartPage: React.FC = () => {
  const [form] = useForm();
  const initSearchParams = {
    current: 1,
    pageSize: 4,
    sortField: 'createTime',
    sortOrder: 'desc',
  };

  const [isSearch, setIsSearch] = useState(false);
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams});
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState ?? {};
  const [chartList, setChartList] = useState<API.Chart[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<API.Chart | null>(null);
  const [teamModalVisible, setTeamModalVisible] = useState(false);

  const [selectedChart, setSelectedChart] = useState<API.Chart>({
    id: 0,
    name: '',
    goal: '',
    chartType: '',
    chartData: '',
    genChart: '',
    genResult: '',
    status: '',
    execMessage: '',
  });
  const [teamList, setTeamList] = useState<API.Team[]>([]);

  const [teamId, setTeamId] = useState<number>();

  const showTeamModal = async (chart: API.Chart) => {
    setTeamModalVisible(true);
    setSelectedChart(chart)
    try {
      const res : any = await listAllTeamMyJoinedByPageUsingGET();
      if (res.data) {
        setTeamList(res.data ?? []);
      } else {
        message.info('暂无任何队伍');
      }
    } catch (e: any) {
      message.error('获取队伍列表失败，' + e.message);
    }
  };

  const addChartToTeam = async () => {
    try {
      const res = await addChartToTeamUsingPOST({chartId: selectedChart.id, teamId: teamId});
      if (res.data) {
        message.success('添加到队伍成功');
      } else {
        message.error('添加到队伍失败,' + `${res.message}`);
      }
    } catch (e: any) {
      message.error('添加到队伍失败，' + e.message);
    }
    setTeamModalVisible(false)
  };

  // 创建 SSE 连接
  const initializeSSE = () => {
    if (!currentUser || !currentUser.id) {
      message.error('无法获取当前用户信息，无法创建 SSE 连接');
      return;
    }

    const eventSource = new EventSource(request.baseURL + `/sse/user/connect?userId=${currentUser.id}`);

    eventSource.addEventListener('chart-update', (event) => {
      const data = JSON.parse(event.data);

      if (data) {
        message.success('图表已更新');
        // 更新 chartList
        setChartList((prevList) => {
          const index = prevList.findIndex((item) => item.id === data.id);
          if (index !== -1) {
            // 替换已存在的图表
            const updatedList = [...prevList];
            updatedList[index] = data;
            return updatedList;
          }
          // 如果不存在，添加到列表末尾
          return [...prevList, data];
        });
      }
    });

    eventSource.onerror = () => {
      message.error('SSE 连接发生错误');
      eventSource.close();
    };

    return () => {
      eventSource.close(); // 清理连接
    };
  };


  // 页面加载时加载数据
  const initData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏图表的 title
        if (res.data.records) {
          res.data.records.forEach((data) => {
            if (data.status === 'succeed') {
              const chartOption = JSON.parse(data.genChart ?? '{}');
              // chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          });
        }
      } else {
        message.error('获取我的图表失败,' + `${res.message}`);
      }
    } catch (e: any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  };

  // 搜索框加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listMyChartByPageUsingPOST(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        // 隐藏图表的 title
        if (res.data.records) {
          res.data.records.forEach((data) => {
            if (data.status === 'succeed') {
              const chartOption = JSON.parse(data.genChart ?? '{}');
              // chartOption.title = undefined;
              data.genChart = JSON.stringify(chartOption);
            }
          });
        }
      } else {
        message.error('获取我的图表失败,' + `${res.message}`);
      }
    } catch (e: any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const cleanup = initializeSSE();
    return cleanup; // 清理 SSE 连接
  }, []);

  useEffect(() => {
    if (isSearch) {
      loadData();
      setIsSearch(false);
    } else {
      initData();
    }
  }, [searchParams]);

  const handleOpenModal = (item: API.Chart) => {
    setSelectedItem(item);
    setModalVisible(true);
    // 设置表单字段的值
    form.setFieldsValue({
      id: item.id,
      name: item.name,
      goal: item.goal,
      chartType: item.chartType,
      chartData: item.chartData,
    });
  };

  const handleCancelModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = async (values: any) => {
    setModalVisible(false);
    try {
      const res = await regenChartUsingPOST(values);
      if (!res?.data) {
        message.error('分析失败,' + `${res.message}`);
      } else {
        message.success('正在重新生成，稍后请在我的图表页面刷新查看');
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
  };

  return (
    <div className="my-chart-page">
      <div>
        <Search
          placeholder="请输入图表名称"
          enterButton
          loading={loading}
          onSearch={(value) => {
            setSearchParams({
              ...initSearchParams,
              name: value,
            });
            setIsSearch(true);
          }}
        />
      </div>
      <div className="margin-16"/>

      <Modal
        title="重新生成图表"
        visible={modalVisible}
        onCancel={handleCancelModal}
        footer={[
          <Button key="cancel" onClick={handleCancelModal}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              form.submit();
            }}
          >
            重新生成
          </Button>,
        ]}
      >
        {selectedItem && (
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item label="ID" name="id" initialValue={selectedItem.id} hidden>
              <Input disabled/>
            </Form.Item>
            <Form.Item label="图表名称" name="name" initialValue={selectedItem.name}>
              <Input/>
            </Form.Item>
            <Form.Item label="分析目标" name="goal" initialValue={selectedItem.goal}>
              <Input/>
            </Form.Item>
            <Form.Item label="原始数据" name="chartType" initialValue={selectedItem.chartType}>
              <Select
                placeholder="请选择图表类型"
                onChange={(value) => form.setFieldsValue({chartType: value})}
              >
                <Select.Option value="折线图">折线图</Select.Option>
                <Select.Option value="柱状图">柱状图</Select.Option>
                <Select.Option value="堆叠图">堆叠图</Select.Option>
                <Select.Option value="饼图">饼图</Select.Option>
                <Select.Option value="雷达图">雷达图</Select.Option>
                <Select.Option value="玫瑰图">玫瑰图</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="原始数据" name="chartData" initialValue={selectedItem.chartData}>
              <textarea rows={15} cols={50}/>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="将图表纳入队伍"
        open={teamModalVisible}
        onOk={() => addChartToTeam()}
        onCancel={() => setTeamModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <div style={{marginTop: 16}}>
          图表名称：
          <Input disabled value={selectedChart!.name} style={{width: 350}}/>
        </div>
        <div style={{marginTop: 10}}>
          队伍 ID：
          <Select
            showSearch
            style={{width: '200px'}}
            placeholder="请选择队伍 ID"
            options={teamList.map(team => ({
              value: team.id,
              label: team.name
            }))}
            onChange={(value) => setTeamId(value)}
          />
        </div>
      </Modal>

      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2,
        }}
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
        loading={loading}
        dataSource={chartList}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{width: '100%'}}>
              <List.Item.Meta
                avatar={<Avatar src={currentUser && currentUser.userAvatar}/>}
                title={item.name}
                description={item.chartType ? '图表类型：' + item.chartType : undefined}
              />

              <>
                {item.status === 'wait' && (
                  <>
                    <Result
                      status="warning"
                      title="待生成"
                      subTitle={item.execMessage ?? '当前图表生成队列繁忙，请耐心等候'}
                    />
                  </>
                )}
                {item.status === 'running' && (
                  <>
                    <Result status="info" title="图表生成中"/>
                  </>
                )}
                {item.status === 'succeed' && (
                  <>
                    <div style={{marginBottom: 16}}/>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <p style={{margin: 0}}>{'分析目标：' + item.goal}</p>
                      <div>
                        <Button style={{marginRight: "5px"}} type="primary" onClick={() => handleOpenModal(item)}>
                          修改诉求
                        </Button>
                        <Button style={{ backgroundColor: '#FD8553', color: 'white'}} onClick={() => showTeamModal(item)}>纳入队伍</Button>
                      </div>

                    </div>
                    <div style={{marginBottom: 16}}/>
                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)}/>
                  </>
                )}
                {item.status === 'failed' && (
                  <>
                    <div style={{marginBottom: 16}}/>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <p style={{margin: 0}}>{'分析目标：' + item.goal}</p>
                      <Button type="primary" onClick={() => handleOpenModal(item)}>
                        修改诉求
                      </Button>
                    </div>
                    <Result status="error" title="图表生成失败" subTitle={item.execMessage}/>
                  </>
                )}
              </>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default MyChartPage;
