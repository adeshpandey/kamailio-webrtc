import { Button, Input, Popover, notification } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import JsSIP from 'jssip'

import { green } from '@ant-design/colors'
import {
    PhoneOutlined
} from '@ant-design/icons';
import AppContext from '../contexts/AppContext';

function CallButton({ isAuth, email }) {
    const [phone, setPhone] = useState('');
    const [ua, setUa] = useState(null);

    const { appContext, dispatchAppContextEvents } = useContext(AppContext);
    console.log("HOST: ", process.env)

    useEffect(() => {

        const user_id = (email == 'archie@yopmail.com' ? 123 : 456)

        let socket = new JsSIP.WebSocketInterface(`wss://${process.env.REACT_APP_PUBLIC_IP}:8082`);
        socket['via_transport'] = 'WSS';
        let configuration = {
            sockets: [socket],
            uri: `sip:${user_id}@${process.env.REACT_APP_PUBLIC_IP}:8060`,
            password: '123456',

        };

        let newUa = new JsSIP.UA(configuration);

        newUa.start();
        newUa.on('connecting', e => {
            console.log("Connecting: ", e)
        })
        newUa.on('connected', e => {
            console.log("Connected: ", e)
        })
        newUa.on('disconnected', e => {
            console.log("Disconnected: ", e)
        })
        newUa.on('registrationFailed', e => {
            notification.error({
                message: 'Failed to register',
                description: e.cause
            })
        })
        newUa.on('registered', function (e) {
            notification.success({
                message: "Registered",
                description: "User registered"
            })
        });
        newUa.on('unregistered', function (e) {
            notification.success({
                message: "Un Registered",
                description: "User unregistered"
            })
        });

        newUa.on('newRTCSession', (data) => {

            if (data.originator === 'local')
                return;


            const session = data.session;

            // Avoid if busy or other incoming
            // if (appContext.session || appContext.incomingSession) {
            //     // logger.debug('incoming call replied with 486 "Busy Here"');

            //     session.terminate(
            //         {
            //             'status_code': 486,
            //             'reason_phrase': 'Busy Here'
            //         });
            //     //  can show waiting 
            //     return;
            // }

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

            dispatchAppContextEvents("SET_INCOMING_SESSION", session)

            session.on('failed', (data) => {
                notification.error({
                    message: data.cause,
                    description:'hoho'
                })
                dispatchAppContextEvents("SET_SESSIONS", { incoming_session: null, session: null })

            });

            session.on('ended', (data) => {
                notification.error({
                    message: data.cause,
                    description:'noho'

                })
                dispatchAppContextEvents("SET_SESSIONS", { incoming_session: null, session: null })
            });

            session.on('accepted', () => {
                dispatchAppContextEvents("SET_SESSIONS", { incoming_session: null, session: session })
            });
        });

        setUa(newUa)
        dispatchAppContextEvents("SET_UA", newUa)
        return () => {
            newUa.unregister();
        }
    }, [setUa])


    function callNow() {

        let options = {
            pcConfig: { iceServers: [] },
            mediaConstraints: { audio: true, video: true },
            rtcOfferConstraints:
            {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            }
        };

        let outSession = appContext.ua.call(phone, options);

        outSession.on('connecting', () => {
            dispatchAppContextEvents('SET_SESSION', outSession);
        });

        outSession.on('progress', () => {

        });

        outSession.on('failed', (data) => {

            dispatchAppContextEvents('SET_SESSION', null);
        });

        outSession.on('ended', (data) => {
            dispatchAppContextEvents('SET_SESSION', null);
        });

        outSession.on('accepted', () => {

        });
    }

    function changePhone(e) {
        setPhone(e.target.value)
    }
    return (
        <Popover
            content={<>
                <Input value={phone} placeholder='contact number' onChange={changePhone} />
                <Button onClick={callNow}>Call now</Button>
            </>}
            title="Call who? "
            trigger="click"
        >
            <Button icon={<PhoneOutlined />} style={{ backgroundColor: green[3], borderColor: green[3], color: "#FFF" }}>Call</Button>
        </Popover>
    )
}

export default React.memo(CallButton);