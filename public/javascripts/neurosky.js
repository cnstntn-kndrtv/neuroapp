var net = require('net'),
    events = require('events'),
    util = require('util'),
    crypto = require('crypto');

function NodeNeuroSkyError(message) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    this.message = message;
    this.name = 'NodeThinkGearError';
}

NodeNeuroSkyError.prototype.__proto__ = Error.prototype;

var NeuroSkyClient = function(opts) {
    opts || (opts = {});

    this.port = opts.port || 13854;
    this.host = opts.host || 'localhost';

    if (typeof(opts.appName) !== 'string') throw new NodeNeuroSkyError('Must specify appName');

    this.auth = {
        appName: opts.appName
    };

    this.config = {
        enableRawOutput: false,
        format: 'Json'
    };

    events.EventEmitter.call(this);
};

util.inherits(NeuroSkyClient, events.EventEmitter);

NeuroSkyClient.prototype.connect = function(onSuccess, onError) {
    var self = this;
    var netSocket = new net.Socket()
    self.auth.appKey = makeKey();
    self.auth.appName = makeName(self.auth.appName);
    //console.log(self.auth);
    var client = this.client = netSocket.connect(this.port, this.host, function() {
        client.write(JSON.stringify(self.auth));
        if (onSuccess && typeof(onSuccess) === "function") {
            onSuccess();
        }
    });

    function makeName(appName) {
        var max = 99,
            min = 1,
            suffix = "_" + Math.floor(Math.random() * (max - min + 1)) + min;

        return appName + suffix;
    }

    function makeKey() {
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        return crypto.createHash('sha1').update(current_date + random).digest('hex');
    }

    client.on('data', function(data) {

        if (!self.configSent) {
            self.configSent = true;
            client.write(JSON.stringify(self.config));
        } else {
            try {
                self.emit('data', JSON.parse(data.toString()));
            } catch (e) {
                self.emit('parse_error', data.toString());
            }
        }
    });

    client.on('error', function(err) {
        console.log('Error connecting to ThinkGear client. Try starting the ThinkGear Connector app.\n', err);
        if (onError && typeof(onError) === "function") {
            onError();
        }
    });
};

exports.NeuroSkyClient = NeuroSkyClient;

exports.createClient = function(opts) {
    return new NeuroSkyClient(opts || {});
};