import {LockOutlined, UserOutlined,} from '@ant-design/icons';
import {message, Tabs} from 'antd';
import React, {useState} from 'react';
import Footer from '@/components/Footer';
import {history} from '@umijs/max';
import {userRegisterUsingPOST} from '@/services/yubi/userController';
import {LoginForm, ProFormText} from '@ant-design/pro-form';
import {Helmet, Link} from "@@/exports";
import Settings from "../../../../config/defaultSettings";
import {useEmotionCss} from "@ant-design/use-emotion-css";

const Register: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
          "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });
  // 表单提交
  const handleSubmit = async (values: API.RegisterParams) => {
    const {userPassword, checkPassword} = values;
    // 校验
    if (userPassword !== checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      // 注册
      const res = await userRegisterUsingPOST(values);
      if (res.message === 'ok') {
        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const {query} = history.location;
        history.push({
          pathname: '/user/login',
          query,
        });
        return;
      }
      else {
          message.error('注册失败,' + `${res.message}`);
          return;
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = '注册失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
      <div className={containerClassName}>
        <Helmet>
          <title>
            {'注册'}- {Settings.title}
          </title>
        </Helmet>
        <div
            style={{
              flex: '1',
              padding: '32px 0',
            }}
        >
          <LoginForm
              submitter={{
                  searchConfig: {
                      submitText: '注册'
                  }
              }}
              contentStyle={{
                minWidth: 280,
                maxWidth: '75vw',
              }}
              logo={<img alt="logo" src="/logo.svg" />}
              title="灵犀BI"
              subTitle={
                <a href="https://blog.hejiajun.icu" target="_blank">
                  灵犀BI——智能分析 Excel 数据
                </a>
              }
              onFinish={async (values) => {
                await handleSubmit(values as API.UserLoginRequest);
              }}
          >
            <Tabs
                activeKey={type}
                onChange={setType}
                centered
                items={[
                  {
                    key: 'account',
                    label: '账户密码注册',
                  },
                ]}
            />
            {type === 'account' && (
                <>
                  <ProFormText
                      name="userAccount"
                      fieldProps={{
                        size: 'large',
                        prefix: <UserOutlined />,
                      }}
                      placeholder={'请输入用户名'}
                      rules={[
                        {
                          required: true,
                          message: '账号是必填项！',
                        },
                      ]}
                  />
                  <ProFormText.Password
                      name="userPassword"
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined />,
                      }}
                      placeholder={'请输入密码'}
                      rules={[
                        {
                          required: true,
                          message: '密码是必填项！',
                        },
                      ]}
                  />
                  <ProFormText.Password
                      name="checkPassword"
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined />,
                      }}
                      placeholder={'请重新输入密码'}
                      rules={[
                        {
                          required: true,
                          message: '检验密码是必填项！',
                        },
                      ]}
                  />
                </>
            )}
            <div
                style={{
                  marginBottom: 24,
                }}
            >
              <Link to="/user/login">已有账号？去登录</Link>
            </div>
          </LoginForm>
        </div>
        <Footer />
      </div>
  );
};

export default Register;
