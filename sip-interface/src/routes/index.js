import React, { useContext } from 'react'
import { SecureRoute, LoginCallback, Security } from '@okta/okta-react';
import { Route, Switch, useHistory, withRouter } from "react-router-dom";

import Home from '../pages/Home';
import Calls from '../pages/Calls';
import { Layout } from 'antd';
import Sidebar from '../components/Sidebar';
import LayoutHeader from '../components/LayoutHeader';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import Contacts from '../pages/Contacts';
import Settings from '../pages/Settings';
import AppContext from '../contexts/AppContext';
import Session from '../components/Session';

const { Content, Footer } = Layout;

const oktaAuth = new OktaAuth({
    issuer: `https://${process.env.REACT_APP_OKTA_HOST_NAME}/oauth2/default`,
    clientId: process.env.REACT_APP_OKTA_FRONTEND_CLIENT_ID,
    redirectUri: window.location.origin + '/login/callback'
});

function Routes() {

    const history = useHistory();
    const {appContext} = useContext(AppContext);

    const restoreOriginalUri = async (_oktaAuth, originalUri) => {
        history.replace(toRelativeUrl(originalUri || '/', window.location.origin));
    };

    return (<Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri} >
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar />
            <Layout className="site-layout">
                <LayoutHeader />
                <Content style={{
                    minHeight: 280,
                    padding:10
                }}>
                    <Switch>

                        <Route path='/' exact={true} component={Home} />
                        <SecureRoute path='/contacts' component={Contacts} />
                        <SecureRoute path='/calls' component={Calls} />
                        {/* <SecureRoute path='/call/:id' component={Call} /> */}
                        <SecureRoute path='/settings' component={Settings} />
                        <Route path='/login/callback' component={LoginCallback} />
                    </Switch>
                    {appContext.session && <Session session={appContext.session} />}

                </Content>
                <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
            </Layout>
        </Layout>
    </Security>
    );
}


export default withRouter(Routes);