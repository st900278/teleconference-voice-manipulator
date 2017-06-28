var onMessageCallbacks = {};
var socket = io.connect('http://localhost:8888/');

socket.on('message', function(data) {
    if(data.sender == connection.userid) return;

    if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
    };
});

connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    onMessageCallbacks[channel] = config.onmessage;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function (message) {
            socket.emit('message', {
                sender: connection.userid,
                channel: channel,
                message: message
            });
        },
        channel: channel
    };
};
