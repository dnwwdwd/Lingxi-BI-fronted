import {
  Avatar,
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Result,
  Select,
  Typography, Upload
} from 'antd';

import {regenChartFromTeamUsingPOST,} from '@/services/lingxibi/chartController';
import {useModel} from '@@/exports';
import {useForm} from 'antd/es/form/Form';
import ReactECharts from 'echarts-for-react';
import React, {useEffect, useState} from 'react';
import Search from 'antd/es/input/Search';
import {useParams} from "react-router";
import {
  getTeamByIdUsingGET,
  listTeamChartByPageUsingPOST,
  updateTeamUsingPOST
} from "@/services/lingxibi/teamController";
import {request} from "@/app";
import {EditOutlined, PlusOutlined} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {UploadFile} from "antd/lib";

const TeamChartPage: React.FC = () => {

  const {id} = useParams<{ id: string }>();

  console.log(id);

  const [form] = useForm();
  const [teamForm] = useForm();

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
  const [team, setTeam] = useState<API.Team>();
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<API.Chart | null>(null);
  const [open, setOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 创建 SSE 连接
  const initializeSSE = () => {
    if (!currentUser || !currentUser.id) {
      message.error('无法获取当前用户信息，无法创建 SSE 连接');
      return;
    }

    const eventSource = new EventSource(request.baseURL + `/sse/team/connect?teamId=${id}`);

    eventSource.addEventListener('team-chart-update', (event) => {
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
      const res = await listTeamChartByPageUsingPOST({...searchParams, teamId: id});
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
        message.info('暂无任何图表');
      }
    } catch (e: any) {
      message.error('获取我的图表失败，' + e.message);
    }
    try {
      const res = await getTeamByIdUsingGET({id: id});
      teamForm.setFieldsValue(res.data);
      setTeam(res.data);
      if (res.data && res.data.imgUrl) {
        // 将 imgUrl 转换为 UploadFile 对象
        const file = {
          uid: '-1',
          name: 'image',
          status: 'done',
          url: res.data.imgUrl,
        };
        setFileList([file]);
        teamForm.setFieldsValue({ imgUrl: res.data.imgUrl });
      }
    } catch (e: any) {
      message.error('获取队伍信息失败，' + e.message);
    }
    setLoading(false);
  };

  // 搜索框加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listTeamChartByPageUsingPOST({...searchParams, teamId: id});
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

  const handleOk = async () => {
    try {
      const res = await updateTeamUsingPOST(team!);
      if (res.data) {
        message.success('更新成功');
        onClose();
        window.location.reload();
      }
    } catch (e: any) {
      message.error('更新失败，' + e.message);
    }
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


  const onClose = () => {
    setOpen(false);
  }

  const onOpen = () => {
    setOpen(true);
  };

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
      const res = await regenChartFromTeamUsingPOST({...values, teamId: id});
      if (!res?.data) {
        message.error('分析失败,' + `${res.message}`);
      } else {
        message.success('正在重新生成，稍后请在我的图表页面刷新查看');
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    }
  };

  const onUploadChange = (info: any) => {
    const { file, fileList: newFileList } = info;
    if (file.status === 'done') {
      const response = file.response;
      if (response && response.data) {
        const uploadedUrl = response.data;
        setImgUrl(uploadedUrl);
        setFileList(newFileList);
        teamForm.setFieldsValue({ imgUrl: uploadedUrl });
        message.success('图片上传成功');
      } else {
        message.error('图片上传失败，请检查接口返回值');
      }
    } else if (file.status === 'error') {
      message.error('图片上传失败，请稍后重试');
    } else {
      setFileList(newFileList);
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

      <div style={{marginTop: '10px', display: 'flex', justifyContent: 'space-between'}}>
        <Typography.Title
          level={3}
        >
          {team?.name}
        </Typography.Title>

        <EditOutlined style={{marginRight: '5'}} onClick={onOpen}/>
      </div>

      <div className="margin-16"/>

      <Modal
        open={open}
        title="队伍介绍"
        onOk={handleOk}
        onCancel={onClose}>
        <Form
          labelCol={{span: 4}}
          wrapperCol={{span: 14}}
          layout="horizontal"
          style={{maxWidth: 600}}
          form={teamForm}
        >
          <Form.Item
            label="队伍名称"
            name="name"
            rules={[{required: true, message: '请输入队伍名称'}]}
          >
            <Input disabled={currentUser.id !== team?.userId}/>
          </Form.Item>
          <Form.Item
            label="最大人数"
            name="maxNum"
            rules={[{required: true, message: '请输入最大人数'}]}
          >
            <InputNumber disabled={currentUser.id !== team?.userId}/>
          </Form.Item>
          <Form.Item
            label="队伍描述"
            name="description"
            rules={[{required: true, message: '请输入队伍描述'}]}
          >
            <TextArea rows={4} disabled={currentUser.id !== team?.userId}/>
          </Form.Item>
          <Form.Item
            label="队伍图片"
            name="imgUrl"
            rules={[{required: true, message: '请上传队伍图片'}]}
          >
            <Upload
              action={`${request.baseURL}/image/upload`}
              listType="picture-card"
              maxCount={1}
              onChange={onUploadChange}
              fileList={fileList}
              disabled={currentUser.id !== team?.userId}>
              <button style={{border: 0, background: 'none'}} type="button">
                <PlusOutlined/>
                <div style={{marginTop: 8}}>上传图片</div>
              </button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

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
            <Form.Item label="" name="id" initialValue={selectedItem.id} hidden>
              <Input/>
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
        locale={{
          emptyText: (
            <Empty
              description="该队伍暂无任何图表"
            />
          ),
        }}
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

export default TeamChartPage;
