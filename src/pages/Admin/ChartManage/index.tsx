import React, {useState, useEffect, useRef} from 'react';
import {Table, Modal, Button, Form, Input, Select, Space, message, Tag, Tooltip} from 'antd';
import {
  deleteChartUsingPOST,
  listChartByPageUsingPOST, regenChartByAdminUsingPOST, regenChartUsingPOST,
  updateChartUsingPOST
} from "@/services/lingxibi/chartController";
import ReactECharts from "echarts-for-react";
import MdEditor from "@/components/MdEditor";

const initSearchParams = {
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'desc',
  searchParams: '',
};

const ChartManage: React.FC = () => {
  const [chartList, setChartList] = useState<API.Chart[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChartModalVisible, setIsChartModalVisible] = useState(false);
  const [selectedChart, setSelectedChart] = useState<API.Chart | null>(null);
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams});
  const [total, setTotal] = useState<number>(0);
  const chartRef = useRef<ReactECharts | null>(null);
  const [form] = Form.useForm();
  const [value, setValue] = useState<string>('');

  // 处理编辑器内容变化
  const handleEditorChange = (newValue: string) => {
    setValue(newValue);
  };

  const handleShowChart = (chart: API.Chart) => {
    setIsChartModalVisible(true);
    setSelectedChart(chart);
    setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    }, 100);
  };

  // 模拟获取图表数据（替换为实际接口调用）
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listChartByPageUsingPOST(searchParams);
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch (error) {
      message.error('加载图表数据失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);


  // 打开修改弹窗
  const handleEdit = (chart: API.Chart) => {
    setSelectedChart(chart);
    setIsModalVisible(true);
    form.setFieldsValue(chart);
  };


  // 删除图表
  const handleDelete = (chartId: number | undefined) => {
    if (!chartId) return;
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该图表吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await deleteChartUsingPOST({id: chartId});
          if (res.data) {
            message.success('删除成功');
            loadData();
          } else {
            message.error('删除失败，' + res.message);
          }
        } catch (e: any) {
          message.error('删除失败，' + e.message);
        }
      },
    });
  };

  // 提交新增或修改
  const handleModalSubmit = async (values: API.Chart) => {
    if (selectedChart) {
      // 修改图表
      try {
        const res = await updateChartUsingPOST(values);
        if (res.data) {
          loadData();
          message.success('操作成功');
        } else {
          message.error('操作失败，' + res.message);
        }
      } catch (e: any) {
        message.error('操作失败，' + e.message);
      }
    }
    setIsModalVisible(false);
  };

  const regenChart = (chart: API.Chart | null) => {
    if (chart) {
      setSelectedChart(chart);
    }
    Modal.confirm({
      title: '重新生成图表',
      content: '确定要重新生成该图表吗？',
      onOk: async () => {
        try {
          const res = await regenChartByAdminUsingPOST({id: selectedChart?.id});
          if (res.data) {
            message.success('操作成功');
            window.location.reload();
          } else {
            message.error('操作失败，' + res.message);
          }
        } catch (e: any) {
          message.error('操作失败，' + e.message);
        }
      }
    });
    setIsChartModalVisible(false);
  };


  // 表格列定义
  const statusMap: Record<string, { text: string; color: string }> = {
    succeed: {text: '成功', color: 'green'},
    running: {text: '生成中', color: 'blue'},
    failed: {text: '失败', color: 'red'},
    wait: {text: '待生成', color: 'yellow'},
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '目标',
      dataIndex: 'goal',
      key: 'goal',
    },
    {
      title: '类型',
      dataIndex: 'chartType',
      key: 'chartType',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
      ),
    },
    {
      title: '生成结果',
      dataIndex: 'genResult',
      key: 'genResult',
      render: (text: string) => {
        const maxLength = 30; // 设置最大显示长度
        return text.length > maxLength ? (
          <Tooltip title={text}>
            {text.slice(0, maxLength)}...
          </Tooltip>
        ) : (
          text
        );
      },
    },
    {
      title: '图表配置',
      dataIndex: 'genChart',
      key: 'genChart',
      render: (text: string) => {
        const maxLength = 30; // 设置最大显示长度
        return text.length > maxLength ? (
          <Tooltip title={text}>
            {text.slice(0, maxLength)}...
          </Tooltip>
        ) : (
          text
        );
      },
    },
    {
      title: '失败原因',
      dataIndex: 'execMessage',
      key: 'execMessage',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: API.Chart) => (
        <>
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              修改
            </Button>
            <Button type="link" onClick={() => regenChart(record)}>
              重新生成
            </Button>
          </Space>
          <Space>
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
            <Button type="link" onClick={() => handleShowChart(record)}>
              显示图表
            </Button>
          </Space>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{textAlign: 'center', marginBottom: 16}}>
        <Space>
          <Input.Search
            placeholder="请输入图表名称或状态"
            allowClear
            enterButton="搜索"
            onSearch={(value) => {
              setSearchParams({
                ...initSearchParams,
                searchParams: value,
              })
            }}
            style={{width: 300}}
          />
        </Space>
      </div>
      <Table
        dataSource={chartList}
        columns={columns}
        loading={loading}
        bordered
        rowKey="id"
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
      />

      {/* 新增/修改弹窗 */}
      <Modal
        title={'修改图表信息'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleModalSubmit} labelCol={{span: 6}} wrapperCol={{span: 16}}>
          <Form.Item label="ID" name="id">
            <Input disabled/>
          </Form.Item>
          <Form.Item label="图表名称" name="name" rules={[{required: true, message: '请输入图表名称'}]}>
            <Input/>
          </Form.Item>
          <Form.Item label="目标" name="goal" rules={[{required: true, message: '请输入目标'}]}>
            <Input/>
          </Form.Item>
          <Form.Item label="图表类型" name="chartType" rules={[{required: true, message: '请选择图表类型'}]}>
            <Select placeholder="请选择图表类型">
              <Select.Option value="折线图">折线图</Select.Option>
              <Select.Option value="柱状图">柱状图</Select.Option>
              <Select.Option value="饼图">饼图</Select.Option>
              <Select.Option value="雷达图">雷达图</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{required: true, message: '请选择状态'}]}>
            <Select placeholder="请选择状态">
              <Select.Option value="succeed">成功</Select.Option>
              <Select.Option value="running">生成中</Select.Option>
              <Select.Option value="failed">失败</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="生成结果" name="genResult">
            <Input.TextArea rows={2}/>
          </Form.Item>
          <Form.Item label="图表数据" name="chartData">
            <Input.TextArea rows={4}/>
          </Form.Item>
          <Form.Item label="生成的图表配置" name="genChart">
            <MdEditor value={value} onChange={handleEditorChange}/>
          </Form.Item>
          <Form.Item label="执行消息" name="execMessage">
            <Input.TextArea rows={2}/>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={'修改图表信息'}
        visible={isChartModalVisible}
        onCancel={() => setIsChartModalVisible(false)}
        onOk={(value) => regenChart(null)}
        okText="重新生成"
        cancelText="取消">
        <ReactECharts ref={chartRef}
                      option={selectedChart && selectedChart.genChart && JSON.parse(selectedChart.genChart)}/>
      </Modal>
    </div>
  );
};

export default ChartManage;
