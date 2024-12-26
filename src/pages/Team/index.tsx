import {
  exitTeamUsingPOST,
  joinTeamUsingPOST,
  listTeamByPageUsingPOST,
} from '@/services/lingxibi/teamController';
import { useModel } from '@@/exports';
import { LogoutOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Drawer,
  FloatButton,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Space,
  Tooltip,
  Upload,
} from 'antd';
import Search from 'antd/es/input/Search';
import TextArea from 'antd/es/input/TextArea';
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
  const [open, setOpen] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<API.Chart | null>(null);

  const onClose = () => {
    setOpen(false);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    console.log(e?.fileList);
    return e?.fileList;
  };

  const onUploadChange = (info: any) => {
    // 检查上传状态
    if (info.file.status === 'done') {
      // 假设返回数据格式为 { url: '图片链接' }
      const response = info.file.response;
      if (response && response.url) {
        // 更新表单中的图片链接
        form.setFieldsValue({ imgs: [{ url: response.url }] });
        message.success('图片上传成功');
      } else {
        message.error('图片上传失败，请检查接口返回值');
      }
    } else if (info.file.status === 'error') {
      message.error('图片上传失败，请稍后重试');
    }
  };

  // 页面加载时加载数据
  const initData = async () => {
    setLoading(true);
    try {
      const res = await listTeamByPageUsingPOST(searchParams);
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
      <div>
        <Search
          placeholder="请输入队伍名称"
          enterButton
          loading={loading}
          onSearch={(value) => {
            setSearchParams({
              ...initSearchParams,
              searchParam: value,
            });
          }}
        />
      </div>

      <div className="margin-16" />
      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 24 }}>
        <FloatButton
          icon={
            <Tooltip title="创建队伍">
              <PlusCircleOutlined onClick={() => setOpen(true)} />
            </Tooltip>
          }
        />
        <FloatButton.BackTop visibilityHeight={0} />
      </FloatButton.Group>

      <Drawer
        title="创建队伍"
        width={500}
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={() => console.log(form.getFieldValue())}>
              创建
            </Button>
          </Space>
        }
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          style={{ maxWidth: 600 }}
          form={form}
        >
          <Form.Item
            label="队伍名称"
            name="name"
            rules={[{ required: true, message: '请输入队伍名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="最大人数"
            name="maxNum"
            rules={[{ required: true, message: '请输入最大人数' }]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="队伍描述"
            name="description"
            rules={[{ required: true, message: '请输入队伍描述' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="队伍图片"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            name="imgs"
            rules={[{ required: true, message: '请上传队伍图片' }]}
          >
            <Upload
              action="/upload.do"
              listType="picture-card"
              maxCount={1}
              onChange={onUploadChange}
            >
              <button style={{ border: 0, background: 'none' }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </button>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>

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
              <Tooltip title="加入队伍" key="join-team-icon">
                <PlusCircleOutlined onClick={() => joinTeam(item.id)} />
              </Tooltip>,
              <Tooltip title="退出队伍" key="exit-team-icon">
                <LogoutOutlined onClick={() => exitTeam(item.id)} />
              </Tooltip>,
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
