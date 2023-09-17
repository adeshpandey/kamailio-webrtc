import React, { useState, useEffect, useRef } from 'react'
import JsSIP from 'jssip';
import { notification } from 'antd';

export default function Call(props) {
    const [ua, setUa] = useState();
    const [session, setSession] = useState(null);
    const localVideo = useRef();
    const remoteVideo = useRef();
    console.log("HOST: ", process.env.REACT_APP_PUBLIC_IP)
    useEffect(() => {
        let socket = new JsSIP.WebSocketInterface(`wss://${process.env.REACT_APP_PUBLIC_IP}:8082`);
        let configuration = {
            sockets: [socket],
            uri: 'sip:' + props.match.params.id + `@${process.env.REACT_APP_PUBLIC_IP}:8060`,
            password: '123456'
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

        setUa(newUa);


        callNow(newUa)
    }, [])


    function callNow(ua) {
        let eventHandlers = {
            'progress': function (e) {
                console.log('call is in progress');
            },
            'failed': function (e) {
                notification.error({
                    message: e.cause
                })
                console.log('call failed with cause: ' + e.cause);
            },
            'ended': function (e) {
                console.log('call ended with cause: ' + e.cause);
                notification.error({
                    message: e.cause
                })
            },
            'confirmed': function (e) {
                console.log('call confirmed');
            }
        };

        let options = {
            'eventHandlers': eventHandlers,
            'mediaConstraints': { 'audio': true, 'video': true }
        };

        let outSession = ua.call(`sip:123@${process.env.REACT_APP_PUBLIC_IP}:8060`, options);

        outSession.on('connecting', () => {
            setSession(session);
        });

        outSession.on('progress', () => {

        });

        outSession.on('failed', (data) => {

            setSession(null);

            notification.error({
                message: 'Call failed',
                description: data.cause
            })
            // this.props.onNotify(
            //     {
            //         level: 'error',
            //         title: 'Call failed',
            //         message: data.cause
            //     });
        });

        outSession.on('ended', () => {
            setSession(null);
        });

        outSession.on('accepted', () => {

        });

    }

    if (session) {
        const peerconnection = session.connection;
        const localStream = peerconnection.getLocalStreams()[0];
        const remoteStream = peerconnection.getRemoteStreams()[0];
        if (localStream) {
            // Clone local stream
            let _localClonedStream = localStream.clone();

            // Display local stream
            localVideo.srcObject = _localClonedStream;

        }

        // If incoming all we already have the remote stream
        if (remoteStream) {

            _handleRemoteStream(remoteStream);
        }



        peerconnection.addEventListener('addstream', (event) => {

            this._handleRemoteStream(event.stream);
        });
    }
    function _handleRemoteStream(stream) {

        const remoteVideo = this.refs.remoteVideo;

        // Display remote stream
        remoteVideo.srcObject = stream;

        this._checkRemoteVideo(stream);

        stream.addEventListener('addtrack', (event) => {
            const track = event.track;

            if (remoteVideo.srcObject !== stream)
                return;


            // Refresh remote video
            remoteVideo.srcObject = stream;

            _checkRemoteVideo(stream);

            track.addEventListener('ended', () => {
            });
        });

        stream.addEventListener('removetrack', () => {
            if (remoteVideo.srcObject !== stream)
                return;


            // Refresh remote video
            remoteVideo.srcObject = stream;

            _checkRemoteVideo(stream);
        });
    }

    function _checkRemoteVideo(stream) {

        const videoTrack = stream.getVideoTracks()[0];
        this.setState({ remoteHasVideo: Boolean(videoTrack) });
    }

    return (
        <div>
            {session && <> <video style={{ height: '100vh', width: '100vh' }}
                autoPlay
                muted
                ref={remoteVideo} />
                <video style={{ height: '200px', width: '200px', position: 'absolute', right: 10, bottom: 10 }}
                    autoPlay
                    muted
                    ref={localVideo}
                />
            </>
            }
        </div>
    )
}
