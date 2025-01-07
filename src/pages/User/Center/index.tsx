import React, { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import {
  CodeOutlined,
  CopyOutlined,
  EditOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { useModel } from "@@/exports";
import {
  singInUsingPost,
  updateUserOrAddUserUsingPOST,
} from "@/services/lingxibi/userController";

const { Title, Text } = Typography;

const UserCenter: React.FC = () => {
  const { initialState, setInitialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};

  const [isModalOpen, setIsModalOpen] = useState(false);

  // 打开修改信息模态框
  const showModal = () => {
    setIsModalOpen(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 提交修改信息
  const handleFormSubmit = async (values: Partial<API.User>) => {
    try {
      const res = await updateUserOrAddUserUsingPOST(values);
      if (res.data) {
        message.success("修改成功");
        window.location.reload();
      } else {
        message.success("修改失败，" + res.message);
      }
    } catch (e: any) {
      message.error("修改失败，" + e.message);
    }
    setIsModalOpen(false);
  };

  const signIn = async () => {
    const res = await singInUsingPost();
    if (res?.data && res.code === 0) {
      message.success("签到成功，+20积分");
      setInitialState((s) => {
        return {
          ...s,
          currentUser: {
            ...s.currentUser,
            signIn: true,
            score: s.currentUser?.score + 20,
          },
        };
      });
    } else {
      message.info(res.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]} justify="center">
        {/* 用户信息区域 */}
        <Col xs={24} sm={24} md={12} lg={8} xl={6}>
          <Card
            title={<Text strong>个人信息</Text>}
            bordered={false}
            extra={
              <Space>
                <EditOutlined onClick={showModal} />
              </Space>
            }
            style={{
              borderRadius: 8,
              padding: "20px 10px",
              minHeight: 260,
            }}
          >
            <div style={{ textAlign: "center" }}>
              {/* 用户头像 */}
              <Avatar
                size={100}
                src={currentUser.userAvatar}
                style={{ border: "3px solid #FFD700", marginBottom: 16 }}
              />

              {/* 用户等级 */}
              <div>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {currentUser.userName}
                </Title>
              </div>

              {/* 社交按钮 */}
              {/*<Space size="middle" style={{ marginTop: 16 }}>*/}
              {/*  <GithubOutlined style={{ fontSize: 20, color: "#000" }} />*/}
              {/*  <CodeOutlined style={{ fontSize: 20, color: "#000" }} />*/}
              {/*</Space>*/}

              {/* 用户 ID */}
              <Text style={{ display: "block", marginTop: 8 }}>
                ID: {currentUser.id}{" "}
                <CopyOutlined
                  onClick={() =>
                    navigator.clipboard.writeText(currentUser.id)
                  }
                  style={{ cursor: "pointer", color: "#1890ff" }}
                />
              </Text>

              {/* 签到按钮 */}
              <Button
                type="primary"
                style={{ marginTop: 16 }}
                onClick={signIn}
                disabled={currentUser.signIn} // 如果已经签到，按钮禁用
              >
                {currentUser.signIn ? "已签到" : "签到"}
              </Button>
            </div>
          </Card>
        </Col>

        {/* 用户属性区域 */}
        <Col xs={24} sm={24} md={24} lg={16} xl={18}>
          <Row gutter={[24, 24]} justify="start">
            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#f9faff',
                  padding: '20px',
                  height: 150, // 设置固定高度
                  textAlign: 'left',
                }}
                bordered={false}
              >
                {/* 顶部标题 */}
                <Text style={{ fontSize: 14, color: '#7d8da1', fontWeight: 500 }}>可用积分</Text>

                {/* 主内容 */}
                <Title level={2} style={{ color: '#1c66ff', margin: '8px 0' }}>
                  {currentUser.score}
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#f9faff',
                  padding: '20px',
                  height: 150, // 设置固定高度
                  textAlign: 'left',
                }}
                bordered={false}
              >
                {/* 顶部标题 */}
                <Text style={{ fontSize: 14, color: '#7d8da1', fontWeight: 500 }}>正在生成的图表</Text>

                {/* 主内容 */}
                <Title level={2} style={{ color: '#1c66ff', margin: '8px 0' }}>
                  {currentUser.generatingCount}
                </Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8} xl={8}>
              <Card
                style={{
                  borderRadius: 12,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#f9faff',
                  padding: '20px',
                  height: 150, // 设置固定高度
                  textAlign: 'left',
                }}
                bordered={false}
              >
                {/* 顶部标题 */}
                <Text style={{ fontSize: 14, color: '#7d8da1', fontWeight: 500 }}>签到状态</Text>

                {/* 主内容 */}
                <Title level={2} style={{ color: '#1c66ff', margin: '8px 0' }}>
                  {currentUser.signIn ? '已签到' : '未签到'}
                </Title>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* 修改信息模态框 */}
      <Modal
        title="修改个人信息"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          layout="vertical"
          initialValues={currentUser}
          onFinish={handleFormSubmit}
        >
          <Form.Item label="ID" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="用户名"
            name="userName"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="账号"
            name="userAccount"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item label="密码" name="userPassword">
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            label="头像链接"
            name="userAvatar"
            rules={[{ required: true, message: "请输入头像链接" }]}
          >
            <Input placeholder="请输入头像链接" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserCenter;
