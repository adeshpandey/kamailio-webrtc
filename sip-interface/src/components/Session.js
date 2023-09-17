import React, { createRef } from 'react';
import { PlayCircleOutlined, PauseCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import JsSIP from 'jssip';
import { Card, notification } from 'antd';

// JsSIP.debug.enable('JsSIP:*');

class Session extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state =
        {
            localHasVideo: false,
            remoteHasVideo: false,
            localHold: false,
            remoteHold: false,
            canHold: false,
            ringing: false
        };

        // Mounted flag
        this._mounted = false;
        // Local cloned stream
        this._localClonedStream = null;

        this.localVideo = createRef();
        this.remoteVideo = createRef();
    }

    render() {
        const state = this.state;
        const props = this.props;
        let noRemoteVideo;

        if (props.session.isInProgress() && !state.ringing)
            noRemoteVideo = <div className='message'>connecting ...</div>;
        else if (state.ringing)
            noRemoteVideo = <div className='message'>ringing ...</div>;
        else if (state.localHold && state.remoteHold)
            noRemoteVideo = <div className='message'>both hold</div>;
        else if (state.localHold)
            noRemoteVideo = <div className='message'>local hold</div>;
        else if (state.remoteHold)
            noRemoteVideo = <div className='message'>remote hold</div>;
        else if (!state.remoteHasVideo)
            noRemoteVideo = <div className='message'>no remote video</div>;


        let videoActions = [<PhoneOutlined
            className='control'
            color={'#fff'}
            onClick={this.handleHangUp.bind(this)}
        />,]
        if (!state.localHold) {
            videoActions = [...videoActions, <PauseCircleOutlined
                className='control'
                color={'#fff'}
                onClick={this.handleHold.bind(this)}
            />]
        }
        else {
            videoActions = [...videoActions, <PlayCircleOutlined
                className='control'
                color={'#fff'}
                onClick={this.handleResume.bind(this)}
            />]
        }


        return (
            <>
                <div
                    style={{position:'relative', display:'flex', flex:1, flexDirection:'column'}}>
                    <video
                        ref={this.remoteVideo}
                        className={noRemoteVideo ? "hidden" : 'remote-video'}
                        autoPlay
                    />

                    <video
                        ref={this.localVideo}
                        className={!state.localHasVideo ? "hidden" : 'local-video'}
                        autoPlay
                        muted
                    />
                </div>

            </>
        );
    }

    componentDidMount() {
        this._mounted = true;

        const localVideo = this.localVideo.current;
        const session = this.props.session;
        const peerconnection = session.connection;
        const localStream = peerconnection.getLocalStreams()[0];
        const remoteStream = peerconnection.getRemoteStreams()[0];

        // Handle local stream
        if (localStream) {
            // Clone local stream
            this._localClonedStream = localStream.clone();

            // Display local stream
            localVideo.srcObject = this._localClonedStream;

            setTimeout(() => {
                if (!this._mounted)
                    return;

                if (localStream.getVideoTracks()[0])
                    this.setState({ localHasVideo: true });
            }, 1000);
        }

        // If incoming all we already have the remote stream
        if (remoteStream) {

            this._handleRemoteStream(remoteStream);
        }

        if (session.isEstablished()) {
            setTimeout(() => {
                if (!this._mounted)
                    return;

                this.setState({ canHold: true });
            });
        }

        session.on('progress', (data) => {
            if (!this._mounted)
                return;

            if (session.direction === 'outgoing')
                this.setState({ ringing: true });
        });

        session.on('accepted', (data) => {
            if (!this._mounted)
                return;

            if (session.direction === 'outgoing') {
                notification.success({
                    message: 'Call answered'
                })
            }

            this.setState({ canHold: true, ringing: false });
        });

        session.on('failed', (data) => {
            if (!this._mounted)
                return;

            notification.error(
                {
                    message: 'Call failed',
                    description: `Cause: ${data.cause}`
                });

            if (session.direction === 'outgoing')
                this.setState({ ringing: false });
        });

        session.on('ended', (data) => {
            if (!this._mounted)
                return;

            notification.info(
                {
                    message: 'Call ended',
                    description: `Cause: ${data.cause}`
                });

            if (session.direction === 'outgoing')
                this.setState({ ringing: false });
        });

        session.on('hold', (data) => {
            if (!this._mounted)
                return;

            const originator = data.originator;

            switch (originator) {
                case 'local':
                    this.setState({ localHold: true });
                    break;
                case 'remote':
                    this.setState({ remoteHold: true });
                    break;
            }
        });

        session.on('unhold', (data) => {
            if (!this._mounted)
                return;

            const originator = data.originator;

            switch (originator) {
                case 'local':
                    this.setState({ localHold: false });
                    break;
                case 'remote':
                    this.setState({ remoteHold: false });
                    break;
            }
        });

        peerconnection.addEventListener('addstream', (event) => {

            if (!this._mounted) {

                return;
            }

            this._handleRemoteStream(event.stream);
        });
    }

    componentWillUnmount() {

        this._mounted = false;
        JsSIP.Utils.closeMediaStream(this._localClonedStream);
    }

    handleHangUp() {

        this.props.session.terminate();
    }

    handleHold() {

        this.props.session.hold({ useUpdate: true });
    }

    handleResume() {

        this.props.session.unhold({ useUpdate: true });
    }

    _handleRemoteStream(stream) {

        const remoteVideo = this.remoteVideo.current;

        // Display remote stream
        remoteVideo.srcObject = stream;

        this._checkRemoteVideo(stream);

        stream.addEventListener('addtrack', (event) => {
            const track = event.track;

            if (remoteVideo.srcObject !== stream)
                return;


            // Refresh remote video
            remoteVideo.srcObject = stream;

            this._checkRemoteVideo(stream);

            track.addEventListener('ended', () => {
            });
        });

        stream.addEventListener('removetrack', () => {
            if (remoteVideo.srcObject !== stream)
                return;


            // Refresh remote video
            remoteVideo.srcObject = stream;

            this._checkRemoteVideo(stream);
        });
    }

    _checkRemoteVideo(stream) {
        if (!this._mounted) {

            return;
        }

        const videoTrack = stream.getVideoTracks()[0];

        this.setState({ remoteHasVideo: Boolean(videoTrack) });
    }
}

export default Session;

