let jwt = require('jsonwebtoken');
let config = require('../config');
const loginController = {};

loginController.login = (request, response) => {

	console.log(JSON.stringify(request.body))
	const user_name = request.body.UserName
	const password = request.body.Password
	let errorResponse;
	let successResponse;

	// if username and password not blank
	if (user_name && password) {
		let sqlQuery = 'SELECT user_id,first_name,last_name,user_name,designation,email_id,company_id,department,mobile_no,created_by,created_date,updated_by,updated_date,is_active,user_head_id FROM user where user_name =? and password = ? and is_active =1';
		connection.query(sqlQuery, [user_name, password], function (error, rows, fields) {
			if (error) {
				errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
				console.log('Error in query', errorResponse);
				response.send((errorResponse))
			} else {
				if (rows.length) {
					console.log('rows', rows[0]);
					var id = rows[0].user_id;
					var getDataString = 'select *from user_permission where user_control_id = ?'
					connection.query(getDataString, [id], function (error, data, fields) {
						if (!!error) {
							errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
							console.log(errorResponse);
							response.send((errorResponse))
						} else {
							let token = jwt.sign({
									user_name: user_name
								},
								config.secret, {
									expiresIn: '24h' // expires in 24 hours
								}
							);

							//To find all head ids
							var groupUserIdArray = [];
							var userHeadId = rows[0].user_head_id
							// if user head id is null then head id is equals user id
							if (!userHeadId)
								userHeadId = rows[0].user_id

							//stored procedure to traverse all slave nodes
							//search will be based on current users haed id
							//because user can see immediate up and all slaves
							let sql = `CALL getSlaveIds(?)`;
							connection.query(sql, userHeadId, function (error, rowss, fields) {
								if (error)
									console.log(error)
								else {
									//loop through every slave id to push into groupUserIdArray
									rowss[0].forEach(element => {
										groupUserIdArray.push(element.user_id);
									});

									let groupuserId;
									//to add user immediate up's user id
									groupUserIdArray.push(userHeadId)
									// row[0].group_user_ids = groupuserId
									groupuserId = ("(" + groupUserIdArray.join(",") + ")");
									let user = rows[0]
									user.group_user_ids = groupuserId
									const obj = {
										hasRows: rows.length,
										user: user,
										token: token,
										user_permission: data
									}
									// return the JWT token for the future API calls
									successResponse = [responseGenerator.generate(false, 'Token Generated', 200, (obj))];
									response.send((successResponse));

								}
							});
						}

					})
				} else {
					// return the JWT token for the future API calls
					const obj = {
						hasRows: rows.length
					}
					successResponse = [responseGenerator.generate(false, 'Invalid Username or Password', 200, (obj))];
					console.log('Invalid Username or Password', successResponse);
					response.send((successResponse));
				}
			}
		});

	} else {
		errorResponse = [responseGenerator.generate(true, 'Authentication failed! Please check the request', 400, null)];
		response.send(errorResponse)
	}
};

module.exports = loginController;