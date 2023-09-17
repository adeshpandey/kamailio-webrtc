import { useOktaAuth, withOktaAuth } from '@okta/okta-react';
import { Layout, Menu, Typography } from 'antd';
import React, { useState } from 'react'
import {
    SettingOutlined,
    AccountBookOutlined,
    PhoneOutlined,
    LogoutOutlined,
    LoginOutlined
  } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

const { Sider } = Layout;
const { Title, Text } = Typography;

function Sidebar({oktaAuth}) {
    const history = useHistory();

    const [collapsed, setCollapsed] = useState(false);
    const { authState } = useOktaAuth();

    const menuItems = [
        {
            key: '1',
            icon: <AccountBookOutlined />,
            label: 'Contacts',
            onClick: () => history.push('/contacts')
        },
        {
            key: '2',
            icon: <PhoneOutlined />,
            label: 'Calls',
            onClick: () => history.push('/calls')
        },
        {
            key: '3',
            icon: <SettingOutlined />,
            label: 'Settings',
            onClick: () => history.push('/settings')
        },
        {
            key: 4,
            type: 'divider'
        }
    ]
    

    return (
        <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)} theme="light">
            <Title style={{ padding: "7px 10px", marginLeft: 10 }} level={3}>pico<Text style={{ color: "red" }}>Tel</Text></Title>
            <Menu
                theme="light"
                mode="inline"
                defaultSelectedKeys={['1']}
                items={menuItems}
            />
        </Sider>
    )
}

export default withOktaAuth(Sidebar);