import {regenChartUsingPOST,} from '@/services/lingxibi/chartController';
import {useModel} from '@@/exports';
import {Avatar, Button, Card, Form, Input, List, message, Modal, Result, Select} from 'antd';
import {useForm} from 'antd/es/form/Form';
import ReactECharts from 'echarts-for-react';
import React, {useEffect, useState} from 'react';
import Search from 'antd/es/input/Search';
import {useParams} from "react-router";
import {listTeamChartByPageUsingPOST} from "@/services/lingxibi/teamController";

const TeamChartPage: React.FC = () => {

  const {id} = useParams<{ id: string }>();

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
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<API.Chart | null>(null);

  // 页面加载时加载数据
  const initData = async () => {
    setLoading(true);
    try {
      const res = await listTeamChartByPageUsingPOST({...searchParams, teamId: Number(id)});
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
      const res = await listTeamChartByPageUsingPOST({...searchParams, teamId: Number(id)});
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
        title="表单"
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
            <Form.Item label="" name="id" initialValue={selectedItem.id}>
              {/*                  <Input />*/}
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
                      <Button type="primary" onClick={() => handleOpenModal(item)}>
                        修改诉求
                      </Button>
                    </div>
                    <div style={{marginBottom: 16}}/>
                    <ReactECharts option={item.genChart && JSON.parse(item.genChart)}/>
                  </>
                )}
                {item.status === 'succeed' && (
                  <>
                    <div style={{marginBottom: 16}}/>
                    <p>{'分析结果：' + item.genResult}</p>
                  </>
                )}
                {item.status === 'failed' && (
                  <>
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

export default TeamChartPage;
