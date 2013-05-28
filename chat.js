#!/usr/bin/env node
var sys = require("sys"),
	fs = require("fs"),
	chat = require('./node-chat/lib/server'),
	router = require("./node-chat/lib/router");

// create chat server
var chatServer = chat.createServer();
chatServer.listen(8001);

// create a channel and log all activity to stdout
chatServer.addChannel({
	basePath: "/chat"
}).addListener("msg", function (msg) {
	sys.puts("<" + msg.nick + "> " + msg.text);
}).addListener("join", function (msg) {
	sys.puts(msg.nick + " join");
}).addListener("part", function (msg) {
	sys.puts(msg.nick + " part");
});

// server static web files
function serveFiles(localDir, webDir) {
	fs.readdirSync(localDir).forEach(function (file) {
		var local = localDir + "/" + file,
			web = webDir + "/" + file;

		if (fs.statSync(local).isDirectory()) {
			serveFiles(local, web);
		} else {
			chatServer.passThru(web, router.staticHandler(local));
		}
	});
}
serveFiles(__dirname + "/frontend", "");
chatServer.passThru("/js/nodechat.js", router.staticHandler(__dirname + "/node-chat/web/nodechat.js"));
chatServer.passThru("/", router.staticHandler(__dirname + "/frontend/welcome_page.html"));
chatServer.passThru("/main", router.staticHandler(__dirname + "/frontend/main_page.html"));
