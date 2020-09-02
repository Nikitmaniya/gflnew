var express = require('express');
let jwt = require('jsonwebtoken');
let config = require('./config');
let middleware = require('./middleware');
var app = express()
var sql = require('mysql')
var morgan = require('morgan')
var tunnel = require('tunnel-ssh');
var cors = require('cors')
// let config = require('./config');
const https = require('https');
const fs = require('fs');

//to import routes
const qualityRoutes = require('./routes/qualityRoutes');
const userRoutes = require('./routes/userRoutes');
const partyRoutes = require('./routes/partyRoutes');
const stockRoutes = require('./routes/stockRoutes');
const batchRoutes = require('./routes/batchRoutes');
const supplierRoutes = require('./routes/supplier/supplierRoutes');
const supplierRateRoutes = require('./routes/supplier/supplierRateRoutes');
const programRoutes = require('./routes/programRoutes')
const loginRoutes = require('./routes/loginRoutes')
const shadeRoutes = require('./routes/shadeRoutes');
const colourStockRoutes = require('./routes/colourStockRoutes');
const processRoutes = require('./routes/processRoutes');
const dynamicprocessRoutes = require('./routes/dynamicProcessRoutes');
const productionPlanningRoutes = require('./routes/productionPlanningRoutes');

const soundRoutes = require('./routes/soundRoutes');
//This tells express to log via morgan
//and morgan to log in the "combined" pre-defined format
app.use(morgan('combined'))
app.use(cors())
// This is an library file which generates response format for all API's accordingly //
var responseGenerator = require('./libs/responseGenerator');
var sql = require('mysql')
var connection = sql.createConnection({
// 	// 	//properties
// 	// 	// host: '43.249.233.206',
// 	// 	// port:12345,
// 	// 	// user: 'gpl',
// 	// 	// password: 'VG@glory23',
// 	// 	// database: 'myDB',
// 	// 	//connectionLimit : 1000,
// 	//         //waitForConnections : true,
// 	// 		//queueLimit :0,
// 	// 		//debug    :  true,
// 	//        // wait_timeout : 28800,
// 	//       //  connect_timeout :10000,

//local sql server
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '1234',
	database: 'gfl',
	waitForConnections : true,
	timeout: 60000000

		//for aws 
		// host: 'ec2-13-127-5-16.ap-south-1.compute.amazonaws.com',
		// user: 'root',
		// password: 'Rootuser',
		// database: 'gfl_backend',
		// timeout: 60000000
});


// configg = {
// 	username: 'ec2-user',
	
// 	// password:'password123',
// 	privateKey: fs.readFileSync('./aws_key/my-second-server.pem'),
// 	host: 'ec2-13-234-17-138.ap-south-1.compute.amazonaws.com', // not sure if its right
// 	port: 22, // not sure if its right
// 	// dstHost:'ec2-13-126-209-21.ap-south-1.compute.amazonaws.com',// not sure if its right
// 	dstPort: 3306, // not sure if its right
// 	localHost: '127.0.0.1', // not sure if its right
// 	localPort: 27000, // not sure if its right
// 	timeout: 60000000
// };

// let connection;
// tunnel(configg, function (error, server) {
// 	console.log("in connecton")
// 	connection = sql.createConnection({
// 		host: '127.0.0.1',
// 		port: 27000, // the local port you defined for your tunnel
// 		user: 'root',
// 		password: 'gloryTech@@',
// 		database: 'gfl_schema',
// 		//   charset  : 'utf8'
// 	});
global.connection = connection;
	connection.connect();


// })


// function handleDisconnect() {
//  connection = sql.createConnection(connection)};

// connection.connect(function (error) {
// 	//callback function
// 	if (error) {
// 		if(error.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
// 			console.log("dsad")
// 			handleDisconnect();}  
// 		else
// 			console.log('error', error);
// 		setTimeout(handleDisconnect, 2000);
// 	} else {
// 		console.log('connected');
// 	}
// });
// global declaration to use in all files

global.responseGenerator = responseGenerator;
global.middleware = middleware;

app.set('port', (process.env.PORT || 8100))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// routes
app.use('/', qualityRoutes);
app.use('/', userRoutes);
app.use('/', partyRoutes);
app.use('/', stockRoutes);
app.use('/', batchRoutes);
app.use('/', supplierRoutes);
app.use('/', supplierRateRoutes);
app.use('/', programRoutes);
app.use('/', loginRoutes);
app.use('/', shadeRoutes);
app.use('/', colourStockRoutes);
app.use('/', processRoutes);
app.use('/', dynamicprocessRoutes);
app.use('/', productionPlanningRoutes);

app.use('/', soundRoutes);

// app.listen(app.get('port'), function () {
// 	console.log("Node app is running at localhost:" + app.get('port'))
// })

const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
  };

//   https.createServer(options, function (req, res) {
// 	res.writeHead(200);
// 	res.end("hello world\n");
//   }).listen(8100);  

  const httpsServer = https.createServer(options, app);
httpsServer.listen(8100, 'localhost');