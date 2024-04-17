import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
const Footer: React.FC = () => {
  const defaultMessage = 'C1own';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/dnwwdwd/Lingxi-BI',
          blankTarget: true,
        },
          {
              key: '灵犀BI',
              title: '灵犀BI',
              href: 'https://github.com/dnwwdwd/Lingxi-BI',
              blankTarget: true,
          },
      ]}
    />
  );
};
export default Footer;
