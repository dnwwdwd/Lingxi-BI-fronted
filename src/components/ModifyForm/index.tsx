import { Modal, Form, Input, Button } from 'antd';
import React from 'react';

const ModifyForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
}> = ({ visible, onCancel, onFinish }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      onFinish(values);
      form.resetFields();
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };

  return (
    <Modal title="重新生成图表" visible={visible} onCancel={onCancel} footer={null}>
      <Form form={form} onFinish={handleFinish}>
          <Form.Item name="chartTitle" label="图标标题" rules={[{ required: true, message: 'Please enter result!' }]}>
              <Input />
          </Form.Item>
          <Form.Item name="chartGoal" label="分析目标" rules={[{ required: true, message: 'Please enter result!' }]}>
              <Input />
          </Form.Item>
          <Form.Item name="chartType" label="图表类型" rules={[{ required: true, message: 'Please enter result!' }]}>
              <Input />
          </Form.Item>
          <Form.Item name="chartData" label="原始数据" rules={[{ required: true, message: 'Please enter result!' }]}>
              <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit">
                  重新生成
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={onCancel}>
                  取消
              </Button>
          </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModifyForm;
