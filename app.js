'use strict';

var HubController = require("uos-legacy-hub-controller/src/hub-controller");

var DataController = require("uos-legacy-hub-controller/src/modules/controllers/data-controller");
var CommandAPIController = require("uos-legacy-hub-controller/src/modules/controllers/command-api-controller");
var Configuration = require("uos-legacy-hub-controller/configuration");

class WebsocketInputController extends HubController {
    constructor(config) {
        super(config);
    }

    init(callback) {
        var self = this;
        this.mediaHubConnection.tryConnect(function() {
            self.dataController = new DataController(self.mediaHubConnection.hub, self.io);
            self.commandController = new CommandAPIController(self.mediaHubConnection.hub, self.io);
            if(callback)
                callback();
        });
    }

    clientSocketSuccessfulAuth(socket) {
        var self = this;

        // APEP setup data API
        socket.on("listScenes", function(callback) {
            // APEP we must use the assigned groupId
            self.dataController.listScenes(socket.groupId, callback);
        });
        socket.on("listSceneGraphs", this.dataController.listSceneGraphs.bind(self.dataController));
        socket.on("loadScene",       this.dataController.loadScene.bind(self.dataController));
        socket.on("loadSceneGraph",  this.dataController.loadSceneGraph.bind(self.dataController));
        socket.on("loadSceneByName", this.dataController.loadSceneByName.bind(self.dataController));

        // APEP command API - we may wish to deprecate the generic command pattern to avoid the non API integration
        socket.on('sendCommand', this.commandController.sendCommand.bind(self.commandController));
        // APEP command API named
        socket.on('showScenes', this.commandController.showScenes.bind(self.commandController));
        socket.on('playSceneAndThemes', this.commandController.playSceneAndThemes.bind(self.commandController));
    }
}

var config = new Configuration();

var wsInputController = new WebsocketInputController(config);

wsInputController.init(function() {

});