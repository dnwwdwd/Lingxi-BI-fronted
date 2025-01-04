import React, {useEffect, useState} from 'react';
import {Button, Form, Image, Input, message, Modal, Select, Space, Table} from 'antd';
import {deleteUserUsingPOST, pageUserUsingPOST, updateUserOrAddUserUsingPOST} from "@/services/lingxibi/userController";

const UserManage: React.FC = () => {
  const initSearchParams = {
    current: 1,
    pageSize: 10,
    sortField: 'createTime',
    sortOrder: 'desc',
    searchParams: '',
  };

  const [userList, setUserList] = useState<API.User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<API.User | null>(null);
  const [searchParams, setSearchParams] = useState<API.UserQueryRequest>({...initSearchParams});
  const [total, setTotal] = useState<number>(0);

  const [form] = Form.useForm();

  // 模拟获取用户数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await pageUserUsingPOST(searchParams);
      if (res.data) {
        setUserList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch (e: any) {
      message.error('获取用户列表失败，' + e.message);
    }
    setLoading(false);
  };


  useEffect(() => {
    loadData();
  }, [searchParams]);


  // 新增用户弹窗
  const handleAdd = () => {
    setSelectedUser(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // 修改用户弹窗
  const handleEdit = (user: API.User) => {
    setSelectedUser(user);
    setIsModalVisible(true);
    form.setFieldsValue(user);
  };

  // 删除用户
  const handleDelete = (userId: number | undefined) => {
    if (!userId) return;
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该用户吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        // 删除用户
        try {
          const res = await deleteUserUsingPOST({id: userId});
          loadData();
          if (res.data) {
            message.success('删除成功');
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
  const handleModalSubmit = async (values: API.User) => {
    try {
      const res = await updateUserOrAddUserUsingPOST(values);
      if (res.data) {
        message.success('操作成功');
        loadData();
      } else {
        message.error('操作失败，' + res.message);
      }
    } catch (e: any) {
      message.error('操作，' + e.message);
    }
    setIsModalVisible(false);
  };

  // 表格列定义
  const columns = [
    {title: 'ID', dataIndex: 'id', key: 'id'},
    {title: '账号', dataIndex: 'userAccount', key: 'userAccount'},
    {title: '用户名', dataIndex: 'userName', key: 'userName'},
    {title: '头像', dataIndex: 'userAvatar', key: 'userAvatar', render: (url: string) => <Image src={url} width={150} height={150} alt="队伍图片" />},
    {title: '角色', dataIndex: 'userRole', key: 'userRole'},
    {title: '积分', dataIndex: 'score', key: 'score'},
    {title: '生成次数', dataIndex: 'generatingCount', key: 'generatingCount'},
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: API.User) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            修改
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{textAlign: 'center', marginBottom: 16}}>
        <Space>
          <Input.Search
            placeholder="请输入用户名或角色"
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
          <Button type="primary" onClick={handleAdd}>
            新增用户
          </Button>
        </Space>
      </div>
      <Table
        dataSource={userList}
        columns={columns}
        loading={loading}
        rowKey="id"
        bordered
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

      {/* 新增/修改用户弹窗 */}
      <Modal
        title={selectedUser ? '修改用户信息' : '新增用户'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleModalSubmit} labelCol={{span: 6}} wrapperCol={{span: 16}}>
          <>
            {selectedUser && (
              <Form.Item label="id" name="id">
                <Input disabled />
              </Form.Item>
            )}
          </>
          <Form.Item label="账号" name="userAccount" rules={[{required: true, message: '请输入账号'}]}>
            <Input/>
          </Form.Item>
          <Form.Item label="密码" name="userPassword" rules={[{required: true, message: '请输入密码'}]}>
            <Input type="password"/>
          </Form.Item>
          <Form.Item label="用户名" name="userName" rules={[{required: true, message: '请输入用户名'}]}>
            <Input/>
          </Form.Item>
          <Form.Item label="头像" name="userAvatar" rules={[{required: true, message: '请输入头像'}]}>
            <Input/>
          </Form.Item>
          <Form.Item label="角色" name="userRole" rules={[{required: true, message: '请选择角色'}]}>
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="积分" name="score">
            <Input type="number"/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManage;
