import React, {useEffect, useRef, useState} from 'react';
import {Avatar, Badge, Button, Card, Form, Input, List, message, Modal, Select} from 'antd';
import {EyeOutlined, ReadOutlined} from '@ant-design/icons';
import {listMyMessageUsingGET, readAllMessageUsingPOST} from "@/services/lingxibi/messageController";
import ReactECharts from "echarts-for-react";
import MdEditor from "@/components/MdEditor";
import MdViewer from "@/components/MdViewer";

const MessageListPage = () => {
  const [messages, setMessages] = useState<API.MessageVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChartModalVisible, setIsChartModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const chartRef = useRef<ReactECharts | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<API.MessageVO | null>(null);
  // const [value, setValue] = useState<string>('');
  const [form] = Form.useForm();

  // // 处理编辑器内容变化
  // const handleEditorChange = (newValue: string) => {
  //   setValue(newValue);
  // };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await listMyMessageUsingGET();
      setMessages(res.data || []);
    } catch (err) {
      message.error('获取消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await readAllMessageUsingPOST();
      if (res.code === 0) {
        message.success('全部标记为已读');
        fetchMessages();
      } else {
        message.error(res.message);
      }
    } catch (err) {
      message.error('标记失败');
    }
  };

  // 查看更新前的图标信息
  const viewBeforeUpdateChartInfo = (message: API.MessageVO) => {
    setSelectedMessage(message);
    setIsModalVisible(true);
    form.setFieldsValue(message.chartHistory);
  };

  // 查看更新前的图标
  const viewBeforeUpdateChart = (message: API.MessageVO) => {
    setIsChartModalVisible(true);
    setSelectedMessage(message);
    setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    }, 100);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div style={{width: '100%'}}>
      <Card
        title="消息列表"
        extra={
          <Button icon={<ReadOutlined/>} style={{backgroundColor: '#16C2C3', color: 'white'}} variant="solid"
                  onClick={handleMarkAllRead} disabled={!messages || messages.length < 1}>
            全部已读
          </Button>
        }
      >
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button size="small" icon={<EyeOutlined/>} type="primary"
                        onClick={() => viewBeforeUpdateChartInfo(item)}>
                  查看更新前图表信息
                </Button>,
                <Button size="small" icon={<EyeOutlined/>} style={{backgroundColor: '#FD8553', color: 'white'}}
                        onClick={() => viewBeforeUpdateChart(item)}>
                  查看更新前图表
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot={item.isRead === 0} offset={[-4, 4]}>
                    <Avatar src={item.fromUser?.userAvatar}/>
                  </Badge>
                }
                title={<span>{item.fromUser?.userName || '未知用户'}</span>}
                description={<span style={{color: item.isRead === 0 ? '#1890ff' : '#666'}}>{item.content}</span>}
              />
            </List.Item>
          )}
        />
      </Card>


      <Modal
        title={'修改图表信息'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        cancelText="取消"
      >
        <Form form={form} labelCol={{span: 6}} wrapperCol={{span: 16}}>
          <Form.Item label="ID" name="id">
            <Input disabled/>
          </Form.Item>
          <Form.Item label="图表名称" name="name" rules={[{required: true, message: '请输入图表名称'}]}>
            <Input disabled/>
          </Form.Item>
          <Form.Item label="目标" name="goal" rules={[{required: true, message: '请输入目标'}]}>
            <Input disabled/>
          </Form.Item>
          <Form.Item label="图表类型" name="chartType" rules={[{required: true, message: '请选择图表类型'}]}>
            <Select placeholder="请选择图表类型" disabled>
              <Select.Option value="折线图">折线图</Select.Option>
              <Select.Option value="柱状图">柱状图</Select.Option>
              <Select.Option value="饼图">饼图</Select.Option>
              <Select.Option value="雷达图">雷达图</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{required: true, message: '请选择状态'}]}>
            <Select placeholder="请选择状态" disabled>
              <Select.Option value="succeed">成功</Select.Option>
              <Select.Option value="running">生成中</Select.Option>
              <Select.Option value="failed">失败</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="生成结果" name="genResult">
            <Input.TextArea rows={2} disabled/>
          </Form.Item>
          <Form.Item label="图表数据" name="chartData">
            <Input.TextArea rows={4} disabled/>
          </Form.Item>
          <Form.Item label="生成的图表配置" name="genChart">
            <MdViewer value={JSON.parse(selectedMessage?.chartHistory?.genChart || '{}')}/>
          </Form.Item>
          <Form.Item label="执行消息" name="execMessage">
            <Input.TextArea rows={2} disabled/>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={'修改图表信息'}
        visible={isChartModalVisible}
        onCancel={() => setIsChartModalVisible(false)}
        footer={null}
        cancelText="取消">
        <ReactECharts ref={chartRef}
                      option={selectedMessage && selectedMessage.chartHistory.genChart && JSON.parse(selectedMessage.chartHistory.genChart)}/>
      </Modal>
    </div>

  );
};

export default MessageListPage;
