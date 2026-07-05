const express = require("express");
require("dotenv").config();
const path = require("path");
var methodOverride = require("method-override");
const bodyParser = require("body-parser");
const database = require("./config/database");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const compression = require("compression");
//socket io
const http = require("http");
const { Server } = require("socket.io");

const route = require("./routes/client/index.route");
const routeAdmin = require("./routes/admin/index.route");
database.connect();

const systemConfig = require("./config/system");

const app = express();
const port = process.env.PORT;
app.use(express.json());

// Add compression middleware
app.use(compression());

// Add proper caching headers for static files
app.use(
	express.static(`${__dirname}/public`, {
		maxAge: "1y",
		setHeaders: (res, path) => {
			if (path.endsWith(".html")) {
				res.setHeader("Cache-Control", "no-cache");
			} else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
				res.setHeader("Cache-Control", "public, max-age=31536000");
			}
		},
	})
);

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

//bodyParser
app.use(bodyParser.urlencoded({ extended: false }));

//flash
app.use(cookieParser("CNTN"));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());
//end flash

//tinyMCE
app.use(
	"/tinymce",
	express.static(path.join(__dirname, "node_modules", "tinymce"))
);
app.use(methodOverride("_method"));

// App Locals Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;
//app.locals."name var" => variable prefixAdmin exists in all views files

console.log(__dirname);
routeAdmin(app);
route(app);

app.get("*", (req, res) => {
	res.render("client/pages/errors/404", {
		titlePages: "404 Not Found",
	});
});

const server = http.createServer(app);
const io = new Server(server);
global._io = io;

//server listen to use socket io, not app !
server.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
//npm i method-override, ghi de phuong thuc khi gui len
