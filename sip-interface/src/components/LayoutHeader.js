import {Layout, Menu } from 'antd'
import React from 'react'
import {
  QuestionOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined
} from '@ant-design/icons';
import {green} from '@ant-design/colors';

import { useOktaAuth, withOktaAuth } from '@okta/okta-react';
import CallButton from './CallButton';

const { Header } = Layout
function LayoutHeader({ oktaAuth }) {

  const { authState } = useOktaAuth();


  // useEffect(() => {
  //   let socket = new JsSIP.WebSocketInterface(`wss://${process.env.REACT_APP_PUBLIC_IP}:8082`);
  //   let configuration = {
  //     sockets: [socket],
  //     uri: `sip:456@${process.env.REACT_APP_PUBLIC_IP}`,
  //     password: '123456'
  //   };

  //   let ua = new JsSIP.UA(configuration);
  //   ua.start();
  //   setUa(ua);
  // }, [])


  async function logout() {
    await oktaAuth.signOut()
  }

  async function login() {
    await oktaAuth.signInWithRedirect();
  }

  let menuItems = [
    { key: "authitems", icon: <BellOutlined /> }
  ]

  if (authState?.isAuthenticated) {
    menuItems = [...menuItems,
    {
      key: "authmenu", label: authState.idToken.claims.name, icon: <SettingOutlined />, children: [
        { key: "profile", label: "Profile", icon: <UserOutlined /> },
        { key: "help", label: "Help", icon: <QuestionOutlined /> },
        { type: 'divider' },
        { key: "logout", label: "Logout", icon: <LogoutOutlined />, style:{color:'tomato'}, onClick: logout },
      ]
    },
      ,
    ]
  }
  else{
    menuItems = [...menuItems,
      { key: "login", label: "Login", icon: <LoginOutlined />, style:{color:green[3]}, onClick: login },
      
      ]
  }

  return (
    <Header className="site-layout-background" style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {authState?.isAuthenticated && <p>{authState.idToken.claims.email}</p>}
        {authState?.isAuthenticated && <CallButton isAuth={authState?.isAuthenticated} email={authState.idToken.claims.email} />}

        <Menu
          theme="light"
          mode="horizontal"
          items={menuItems}
          style={{minWidth:200}}>
        </Menu>
      </div>
    </Header>
  )
}


export default withOktaAuth(LayoutHeader);