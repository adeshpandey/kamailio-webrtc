import { Badge, Button, Card, Input, notification, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import JsSip from "jssip";
import { CloseCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import OnlineStatus from './OnlineStatus';

JsSip.debug.enable('JsSIP:*');

export default function SipView({username, password, onLogout}) {

    const [ua, setUa] = useState();
    const [status, setStatus] = useState('');
    const [session, setSession] = useState(null);
    const [to, setTo] = useState('');

    useEffect(() => {
        try {
            const settings = {
                uri: `${username}@30.1.1.148`,
                password: password,
                displayName: username,
                socket: 'wss://30.1.1.148:8082',
            }
            const socket = new JsSip.WebSocketInterface(settings.socket);        
            const userAgent = new JsSip.UA(
                {
                    uri: settings.uri,
                    password: settings.password,
                    display_name: settings.displayName,
                    sockets: [socket]
                });

            userAgent.on('connecting', () => {
                setStatus("connecting")
            })

            userAgent.on('connected', () => {
                setStatus("connected")
            })

            userAgent.on('disconnected', () => {
                setStatus("disconnected")
            })

            userAgent.on('registered', () => {
                setStatus("registered")
            })

            userAgent.on('unregistered', () => {
                setStatus("unregistered")
            })

            userAgent.on('registrationFailed', (e) => {
                console.log(e)
                setStatus("registrationFailed")
            })

            userAgent.on('newRTCSession', (data) => {
                const session = data.session;

                if (data.originator === 'local')
                    return;

                // notification.success({
                //     message: "Incoming call",
                //     closeIcon: <PhoneOutlined style={{ fontSize: '24px', color: 'tomato' }} />,
                //     btn: <PhoneOutlined rotate={90} style={{ fontSize: '24px', color: '#73d13d' }} />,
                //     description: data.session.remote_identity.display_name,
                //     onClick: () => {
                //         session.answer({
                //             pcConfig: { iceServers: [], rtcpMuxPolicy: 'negotiate' }
                //         })
                //     },
                //     onClose: () => {
                //         session.terminate();
                //     }
                // })
                session.answer({
                    pcConfig: { iceServers: [], rtcpMuxPolicy: 'negotiate' }
                })
                session.on('failed', () => {
                    setSession(null)

                });

                session.on('ended', () => {
                    setSession(null)
                });

                session.on('accepted', () => {
                    setSession(session)
                });

            })
            userAgent.start();

            setUa(userAgent)
        }
        catch (err) {
            notification.open({
                type: "error",
                message: "Error",
                description: err.message
            })
        }

    }, [setUa])

    const startCall = () => {
        
        const callOptions = {
            pcConfig: { iceServers: [], rtcpMuxPolicy: 'negotiate' },
            mediaConstraints:
            {
                audio: true,
                video: false
            },
            rtcOfferConstraints:
            {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 0,
            }
        }
        try {
            const session = ua.call(to, callOptions);
            session.on('connecting', () => {
                setStatus('connecting')
                setSession(session)
            });

            session.on('progress', (data) => {
                setStatus('progress')
                console.log(data)
                if (data.originator === 'remote') data.response.body = null;
            });

            session.on('failed', (data) => {
                setStatus('failed')

                setSession(null)
                console.log(data)
                notification.open(
                    {
                        type: 'error',
                        message: 'Call failed',
                        description: data.cause
                    });
            });

            session.on('ended', () => {
                notification.open(
                    {
                        type: 'info',
                        message: 'Call ended',
                        description: "call finished"
                    });
                setSession(null)

            });

            session.on('accepted', () => {
                setStatus("accept...");
                notification.open("answered...")
            });
        }
        catch (err) {
            console.log(err)
        }
    }

    const hangup = () => {
        session.terminate();
    }

    const logout = () => {
        ua.unregister();
        onLogout(null)
    }

    return (<>
        <Card
        title={<OnlineStatus title={username} status={status} />}
        extra={<Button type="link" onClick={logout}>Logout</Button> }
        style={{width: "500px", margin: "auto"}}
        >
        <Space>
            <Input placeholder='enter to' value={to} onChange={e => setTo(e.target.value)} />
            <Button type='primary' onClick={startCall}>Call</Button>
            {session && <Button onProgress={hangup}>Hangup</Button>}
        </Space>
        </Card>
    </>
    )
}