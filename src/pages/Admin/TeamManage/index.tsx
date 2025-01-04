import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Space, Table, Image, Select} from 'antd';
import {deleteTeamUsingPOST, listAllTeamByPageUsingPOST, updateTeamUsingPOST} from "@/services/lingxibi/teamController";
import {listAllUsersUsingGET} from "@/services/lingxibi/userController";
import {lodash} from "@umijs/utils";

const TeamManage: React.FC = () => {

  const initSearchParams = {
    current: 1,
    pageSize: 10,
    sortField: 'createTime',
    sortOrder: 'desc',
    searchParams: '',
  };

  const [teamList, setTeamList] = useState<API.Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<API.Team | null>(null);
  const [searchParams, setSearchParams] = useState<API.UserQueryRequest>({...initSearchParams});
  const [total, setTotal] = useState<number>(0);
  const [userList, setUserList] = useState<API.User[]>([]);

  const [form] = Form.useForm();

  const loadAllUsers = async () => {
    try {
      const res = await listAllUsersUsingGET();
      if (res.data) {
        setUserList(res.data);
      } else {
        message.error('获取用户列表失败，' + res.message);
      }
    } catch (e: any) {
      message.error('获取用户列表失败，' + e.message);
    }
  }

  // 获取队伍数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res : any = await listAllTeamByPageUsingPOST(searchParams);
      if (res.data) {
        setTeamList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
      }
    } catch (e: any) {
      message.error('获取队伍列表失败' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  useEffect(() => {
    loadAllUsers();
  }, []);

  // 打开修改队伍弹窗
  const handleEdit = (team: API.Team) => {
    setSelectedTeam(team);
    setIsModalVisible(true);
    form.setFieldsValue(team);
  };

  // 删除队伍
  const handleDelete = (teamId: number | undefined) => {
    if (!teamId) return;
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除该队伍吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await deleteTeamUsingPOST({id: teamId});
          if (res.data) {
            message.success('删除成功');
            loadData();
          } else {
            message.error('删除失败' + res.message);
          }
        } catch (e: any) {
          message.error('删除失败' + e.message);
        }
      },
    });
  };

  // 提交新增或修改队伍
  const handleModalSubmit = async (values: API.Team) => {
    try {
      const res = await updateTeamUsingPOST(values);
      if (res.data) {
        message.success('操作成功');
        loadData();
      } else {
        message.error('操作失败' + res.message);
      }
    } catch (e: any) {
      message.error('操作失败' + e.message);
    }
    setIsModalVisible(false);
  };

  // 表格列定义
  const columns = [
    {title: 'ID', dataIndex: 'id', key: 'id',},
    {title: '队伍名称', dataIndex: 'name', key: 'name'},
    {title: '描述', dataIndex: 'description', key: 'description'},
    {
      title: '图片',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      render: (url: string) => <Image src={url} width={150} height={150} alt="队伍图片"/>
    },
    {title: '最大人数', dataIndex: 'maxNum', key: 'maxNum'},
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: API.Team) => (
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
            placeholder="请输入队伍名称或描述"
            allowClear
            enterButton="搜索"
            onSearch={(value) => {
              setSearchParams({...initSearchParams, searchParams: value});
            }}
            style={{width: 300}}
          />
        </Space>
      </div>
      <Table
        dataSource={teamList}
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

      {/* 新增/修改队伍弹窗 */}
      <Modal
        title="修改队伍信息"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleModalSubmit} labelCol={{span: 6}} wrapperCol={{span: 16}}>
          <Form.Item label="ID" name="id" hidden>
            <Input/>
          </Form.Item>
          <Form.Item label="队伍名称" name="name" rules={[{required: true, message: '请输入队伍名称'}]}>
            <Input/>
          </Form.Item>
          <Form.Item label="描述" name="description" rules={[{required: true, message: '请输入队伍描述'}]}>
            <Input/>
          </Form.Item>
          <Form.Item label="创建人ID" name="userId">
            <Select placeholder="请选择创建人ID">
              {
                userList.map((user) => (
                  <Select.Option key={user.id} value={user.id}>{user.userName}</Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item label="最大人数" name="maxNum" rules={[{required: true, message: '请输入最大人数'}]}>
            <Input type="number"/>
          </Form.Item>
          <Form.Item label="队伍图片" name="imgUrl">
            <Input/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManage;
