function beginVideo(roomName, callback) {
    'use strict';

    var clientInfo = getClientInfo();
    if (clientInfo.Browser.indexOf("Chrome") === -1) {
        alert('You are not using Chrome!  For best results, please download a Chrome based browser');
    }

    var isChannelReady;
    var isInitiator = false;
    var isStarted = false;
    var localStream;
    var pc;
    var remoteStreams = new Array();
    var turnReady;
    var lastStreamId = 0;
    var currentWidth = 540;
    var currentHeight = 320;

    var pc_config = {'iceServers': [{"url": "stun:stun.l.google.com:19302"},
            {"url": "turn:sam@54.84.120.24", "sam": "sam"}]};

    var pc_constraints = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

// Set up audio and video regardless of what devices are present.
    var sdpConstraints = {'mandatory': {
            'OfferToReceiveAudio': true,
            'OfferToReceiveVideo': true}};

/////////////////////////////////////////////

    //var socket = io.connect('http://dev.t1innovations.com:2013');
    var socket = io.connect('http://192.168.1.5:2013');

    if (roomName !== '') {
        console.log('Create or join room', roomName);
        socket.emit('create or join', roomName);
    }

    socket.on('created', function(room) {
        console.log('Created room ' + room);
        isInitiator = true;
        callback('Room: ' + room + ' was created..', true);
    });

    socket.on('join', function(data) {

        callback('Joining room..', true);
        isChannelReady = true;
        console.log('This peer has joined room ' + data.ClientId);
        lastStreamId = data.ClientId;
    });

    socket.on('joined', function(data) {
        //callback('Room: ' + data.RoomName);
        isChannelReady = true;
    });

    socket.on('ClientDisconnect', function(clientId) {
        console.log('Client disconnecting: ' + clientId);
        $('#' + clientId).remove();
    });


    socket.on('message', function(message) {
        if (message === 'GotMedia') {
            maybeStart();
        } else if (message.type === 'offer') {
            if (!isInitiator && !isStarted) {
                maybeStart();
            }
            pc.setRemoteDescription(new RTCSessionDescription(message));
            doAnswer();
        } else if (message.type === 'answer' && isStarted) {
            pc.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && isStarted) {
            var candidate = new RTCIceCandidate({
                sdpMLineIndex: message.label,
                candidate: message.candidate
            });
            pc.addIceCandidate(candidate);
        } else if (message === 'bye' && isStarted) {
            handleRemoteHangup();
        }
    });

////////////////////////////////////////////////////

    var localVideo = document.querySelector('#localVideo');
    //var remoteVideo = document.querySelector('#remoteVideo');

    function getClientInfo()
    {
        var info = new Object();
        var nAgt = navigator.userAgent;
        var verOffset, nameOffset;
        info.OS = "Unknown";

        if (navigator.appVersion.indexOf("Win") !== -1)
            info.OS = "Windows";
        if (navigator.appVersion.indexOf("Mac") !== -1)
            info.OS = "MacOS";
        if (navigator.appVersion.indexOf("X11") !== -1)
            info.OS = "UNIX";
        if (navigator.appVersion.indexOf("Linux") !== -1)
            info.OS = "Linux";

        if ((verOffset = nAgt.indexOf("Opera")) !== -1) {
            info.Browser = "Opera";
        }
        else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
            info.Browser = "Microsoft Internet Explorer";
        }
        else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
            info.Browser = "Chrome";
        }
        else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
            info.Browser = "Safari";
        }
        else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
            info.Browser = "Firefox";
        }
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            info.Browser = nAgt.substring(nameOffset, verOffset);
        }

        return info;
    }

    function sendMessage(message) {
        socket.emit('message', message);
    }

    function handleUserMedia(stream) {
        console.log('Adding local stream.');
        localVideo.src = window.URL.createObjectURL(stream);
        localVideo.style.width = "200px";
        localVideo.style.height = "200px";

        sendMessage("GotMedia");

        localStream = stream;
        $('#browserInfoLabel').text(clientInfo.Browser);
        $('#osLabel').text(clientInfo.OS);

        if (isInitiator) {
            maybeStart();
        }

        console.log('triggering callback');
        callback('Obtained local stream', false);
    }

    function handleUserMediaError(error) {
        console.log('getUserMedia error: ', error);
    }

    var constraints = {video: true, audio: false};
    //var constraints = {video: true, audio: true};
    getUserMedia(constraints, handleUserMedia, handleUserMediaError);

    console.log('Getting user media with constraints', constraints);

//If we are not accessing this from localhost
    console.log('Hostname: ' + location.hostname);
    console.log(location.hostname.indexOf("127"));
    if (true) {
//if (location.hostname.indexOf("127") === -1 ) {
        console.log('Requesting Tier 1 turn server');
        requestTurn('http://54.84.120.24');
        //requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    }

    function maybeStart() {
        if (typeof localStream !== 'undefined' && isChannelReady) {
            createPeerConnection();
            pc.addStream(localStream);
            isStarted = true;
            console.log('isInitiator', isInitiator);
            if (isInitiator) {
                doCall();
            }
        }
    }

    window.onbeforeunload = function(e) {
        sendMessage('bye');
    }

/////////////////////////////////////////////////////////

    function createPeerConnection() {
        try {

            window.turnserversDotComAPI.iceServers(function(data) {

                console.log('turn server ready');
                pc = new RTCPeerConnection(pc_config);
                pc.onicecandidate = handleIceCandidate;
                pc.onaddstream = handleRemoteStreamAdded;
                pc.onremovestream = handleRemoteStreamRemoved;
                console.log('Created RTCPeerConnnection');

            });
        } catch (e) {
            console.log('Failed to create PeerConnection, exception: ' + e.message);
            alert('Cannot create RTCPeerConnection object. ' + e.message);
            return;
        }
    }

    function handleIceCandidate(event) {
        if (event.candidate) {
            sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate});
        }
    }

    function handleCreateOfferError(event) {
        console.log('createOffer() error: ', e);
    }

    function doCall() {
        console.log('Sending offer to peer');
        pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
    }

    function doAnswer() {
        console.log('Sending answer to peer.');
        pc.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
    }

    function setLocalAndSendMessage(sessionDescription) {
        // Set Opus as the preferred codec in SDP if Opus is present.
        sessionDescription.sdp = preferOpus(sessionDescription.sdp);
        pc.setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        sendMessage(sessionDescription);
    }

    function requestTurn(turn_url) {
        var turnExists = false;
        for (var i in pc_config.iceServers) {
            if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {

                console.log('Turn server exists');
                turnExists = true;
                turnReady = true;
                break;
            }
        }
    }
    function handleRemoteStreamAdded(event) {
        console.log('Remote stream added.');
        console.log('Dynamically creating video');
        var remoteVideo = document.createElement("video");
        remoteVideo.autoplay = true;
        remoteVideo.src = window.URL.createObjectURL(event.stream);
        remoteVideo.id = lastStreamId;

        remoteVideo.style.width = currentWidth;
        remoteVideo.style.height = currentHeight;

        remoteStreams.push(event.stream);        
        $('#videos').show();
        $('#videos').append(remoteVideo);
        console.log('Creation complete!');
    }

    function handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
    }

    function hangup() {
        console.log('Hanging up.');
        stop();
        sendMessage('bye');
    }

    function handleRemoteHangup() {
//  console.log('Session terminated.');
        // stop();
        // isInitiator = false;
    }

    function stop() {
        isStarted = false;
        // isAudioMuted = false;
        // isVideoMuted = false;
        pc.close();
        pc = null;
    }

///////////////////////////////////////////

// Set Opus as the default audio codec if it's present.
    function preferOpus(sdp) {
        var sdpLines = sdp.split('\r\n');
        var mLineIndex;
        // Search for m line.
        for (var i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('m=audio') !== -1) {
                mLineIndex = i;
                break;
            }
        }
        if (mLineIndex === null) {
            return sdp;
        }

        // If Opus is available, set it as the default in m line.
        for (i = 0; i < sdpLines.length; i++) {
            if (sdpLines[i].search('opus/48000') !== -1) {
                var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                if (opusPayload) {
                    sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                }
                break;
            }
        }

        // Remove CN in m line and sdp.
        sdpLines = removeCN(sdpLines, mLineIndex);

        sdp = sdpLines.join('\r\n');
        return sdp;
    }

    function extractSdp(sdpLine, pattern) {
        var result = sdpLine.match(pattern);
        return result && result.length === 2 ? result[1] : null;
    }

// Set the selected codec to the first in m line.
    function setDefaultCodec(mLine, payload) {
        var elements = mLine.split(' ');
        var newLine = [];
        var index = 0;
        for (var i = 0; i < elements.length; i++) {
            if (index === 3) { // Format of media starts from the fourth.
                newLine[index++] = payload; // Put target payload to the first.
            }
            if (elements[i] !== payload) {
                newLine[index++] = elements[i];
            }
        }
        return newLine.join(' ');
    }

// Strip CN from sdp before CN constraints is ready.
    function removeCN(sdpLines, mLineIndex) {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length - 1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
        return sdpLines;
    }
}