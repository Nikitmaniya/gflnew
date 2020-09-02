const userController = {};

//method to list all users
userController.list = (request, response) => {

	let currentUserId = request.body.current_user_id
	let groupUserIds = request.body.group_user_ids
	
	let viewOwn = request.body.view_own;
	let viewAll = request.body.view_all;
	let viewGroup = request.body.view_group;

	let sqlQuery ;
	if (viewAll) {
		sqlQuery = 'SELECT  *FROM user where is_active = 1 and user_id  <> ' + currentUserId;
	} else if (viewGroup) {
		sqlQuery = 'SELECT  *FROM user where is_active = 1 and user_id  <> ' + currentUserId +  ' and  created_by IN ' + groupUserIds   ;
	} else if (viewOwn) {
		sqlQuery = 'SELECT  *FROM user where is_active = 1 and user_id  <> ' + currentUserId + ' and created_by = ' + currentUserId;
	}
	console.log('sqlQuery', sqlQuery);
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			console.log(currentUserId)
			errorResponse = [responseGenerator.generate(true, 'Error in user Query having user Id : ' + currentUserId, 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All Users Success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}
userController.GetAllUsersNameId = (request, response) => {
	var currentUserId = request.params.currentUserId
	let sqlQuery = 'SELECT  user_id, user_name FROM user where is_active = 1 ';
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			console.log(currentUserId)
			errorResponse = [responseGenerator.generate(true, 'Error iadan Query ' + currentUserId, 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All Users Success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}


//method to get user detail having user id with permissions
userController.getUserDetailById = (request, response) => {
	//console.log(request.params)
	const userId = request.params.userId
	let sqlQuery = 'SELECT * FROM user where user_id =?';
	connection.query(sqlQuery, [userId], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			var getDataString = 'select *from user_permission where user_control_id = ?'
			connection.query(getDataString, [userId], function (error, data, fields) {
				if (!!error) {
					errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
					console.log(errorResponse);
					response.send((errorResponse))
				} else {
					const obj = {
						user: rows,
						user_permission: data
					}
					successResponse = [responseGenerator.generate(false, 'Get User Successfull', 200, (obj))];
					console.log(successResponse)
					response.send((successResponse))
				}
			})
		}
	});
}

//method to add user
userController.save = (request, response) => {
	
	const userPermission = request.body.userPermission
	const user_name = request.body.user_name
	const last_name = request.body.last_name
	const first_name = request.body.first_name
	const company_id = request.body.company_id
	const designation = request.body.designation
	const department = request.body.department
	const email_id = request.body.email_id
	const password = request.body.password
	const mobile_no = request.body.mobile_no
	let user_head_id = request.body.user_head_id
	const group_head_check_box = request.body.group_head_check_box
	const created_date = new Date();
	const created_by = request.body.created_by
	// const group_user_ids = request.body.current_user_group_user_ids
	//  console.log("creatdwdddddddddddddddddddddddddddddddddded by" ,request.body)
	//if user is] not under any group then assign head id 0 
	// console.log("Outside",user_head_id)
	// if (!group_head_check_box){
		// user_head_id = null
	// }
	const queryString = "insert into user (user_name,first_name,last_name,password,company_id,designation,department,mobile_no,email_id,user_head_id,created_date,group_head_check_box,created_by) values(?,?,?,?,?,?,?,?,?,?,?,?,?)"
	// console.log('queryString', queryString);

	connection.query(queryString, [user_name, first_name, last_name, password, company_id, designation, department, mobile_no, email_id, user_head_id, created_date,group_head_check_box,created_by], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
			// console.log(errorResponse);
			response.send((errorResponse))
		} else {
			var values = GetValues(userPermission, rows.insertId);
			const queryString = "insert into user_permission (user_control_id,form_name,can_view,can_add,can_edit,can_delete,can_view_group,can_view_all,can_edit_group,can_edit_all,can_delete_group,can_delete_all) values ?"
			connection.query(queryString, [values], function (error, user_permission_row, fields) {
				if (!!error) {
					errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
					// console.log(errorResponse);
					response.send((errorResponse))
				} else {
					// var id = rows.insertId
					// console.log('user_head_id', user_head_id);
					// if (user_head_id === 0) {
					// 	const queryString = "update user set user_head_id = ? where user_id = ?";
					// 	connection.query(queryString, [id, id], function (error, update_row, fields) {
					// 		if (!!error) {
					// 			errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
					// 			console.log(errorResponse);
					// 			response.send((errorResponse))
					// 		} else {
					// 			successResponse = [responseGenerator.generate(false, 'User Added Successfully', 200, (rows))];
					// 			console.log(successResponse)
					// 			response.send((successResponse))
					// 		}
					// 	})
					// }
					//  else {
						successResponse = [responseGenerator.generate(false, 'User Added Successfully', 200, (rows))];
						// console.log(successResponse)
						response.send((successResponse))
					// }

				}
			})
		}
	});
}

//to update user
userController.updateUser = (request, response) => {


	const user_permission = request.body.userPermission
	const user_id = request.body.user_id
	const user_name = request.body.user_name
	const last_name = request.body.last_name
	const first_name = request.body.first_name
	const company_id = request.body.company_id
	const designation = request.body.designation
	const department = request.body.department
	const email_id = request.body.email_id
	const password = request.body.password
	const mobile_no = request.body.mobile_no
	var user_head_id = request.body.user_head_id
	const group_head_check_box = request.body.group_head_check_box
	const updated_Date = new Date();
	const updated_by = request.body.updated_by
	console.log("updaeddd",request.body)
	//if group head check box is null then 
	// if (!group_head_check_box) 
		// user_head_id = user_id

	// update in user table
	const queryString = "update user set user_name = ?,first_name = ?,last_name = ?,password = ?,company_id = ?,designation = ?,department = ?,mobile_no = ?,email_id = ?,updated_date=? ,user_head_id = ? ,group_head_check_box = ?,updated_by = ? where user_id = ?"
	connection.query(queryString, [user_name, first_name, last_name, password, company_id, designation, department, mobile_no, email_id, updated_Date ,user_head_id,group_head_check_box,updated_by,user_id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			// console.log(rows)
			const value = GetStringForUpdate(user_permission, user_id);

			const updatestring = ' INSERT INTO user_permission (entry_id,user_control_id,form_name,can_view,can_add,can_edit,can_delete,can_view_group,can_view_all,can_edit_group,can_edit_all, can_delete_group ,can_delete_all) VALUES ' + value + ' ON DUPLICATE KEY UPDATE user_control_id = VALUES(user_control_id), form_name = VALUES(form_name), can_view = VALUES(can_view) , can_add=VALUES(can_add),can_edit = VALUES(can_edit),can_delete = VALUES(can_delete),can_view_group = VALUES(can_view_group),can_view_all = VALUES(can_view_all),can_edit_group = VALUES(can_edit_group),can_edit_all = VALUES(can_edit_all),can_delete_group = VALUES(can_delete_group),can_delete_all = VALUES(can_delete_all)';
			// update permission table
			connection.query(updatestring, value, function (error, rows, fields) {
				if (error) {
					errorResponse = [responseGenerator.generate(true, 'Error in permission Query', 403, error)];
					console.log(errorResponse);
					response.send((errorResponse))
				} else {
					successResponse = [responseGenerator.generate(false, 'User Updated Successfully', 200, (rows))];
					console.log(successResponse)
					response.send((successResponse))
				}
			})
		}
	});
}

userController.deleteById = (request, response) => {
	let sqlQuery = 'update user set is_active = 0 where user_id = ?'
	connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'DELETE user successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}


function GetStringForUpdate(user_permission_data, user_control_id) {
	var str = ''
	var i = 0;

	for (i = 0; i < user_permission_data.length - 1; i++) {
		var entry_id = null
		if (user_permission_data[i].entry_id) {
			entry_id = user_permission_data[i].entry_id
		}
		str += '(' + entry_id + ',' + user_control_id + ',"' + user_permission_data[i].form_name + '",' + user_permission_data[i].can_view + ',' + user_permission_data[i].can_add + ',' + user_permission_data[i].can_edit + ',' + user_permission_data[i].can_delete + ',' + user_permission_data[i].can_view_group + ',' + user_permission_data[i].can_view_all + ',' + user_permission_data[i].can_edit_group + ',' + user_permission_data[i].can_edit_all + ',' + user_permission_data[i].can_delete_group + ',' + user_permission_data[i].can_delete_all + '),'
		console.log(str)
	}
	if (i == user_permission_data.length - 1) {
		var entry_id = null
		if (user_permission_data[i].entry_id) {
			entry_id = user_permission_data[i].entry_id
		}
		str += '(' + entry_id + ',' + user_control_id + ',"' + user_permission_data[i].form_name + '",' + user_permission_data[i].can_view + ',' + user_permission_data[i].can_add + ',' + user_permission_data[i].can_edit + ',' + user_permission_data[i].can_delete + ',' + user_permission_data[i].can_view_group + ',' + user_permission_data[i].can_view_all + ',' + user_permission_data[i].can_edit_group + ',' + user_permission_data[i].can_edit_all + ',' + user_permission_data[i].can_delete_group + ',' + user_permission_data[i].can_delete_all + ')'
	}
	console.log('final', str)

	return str;
}

function GetValues(user_permission_data, control_id) {
	var values = []
	user_permission_data.forEach((element, index) => {
		var value = [];
		value.push(control_id)
		value.push(element.form_name)
		value.push(element.can_view)
		value.push(element.can_add)
		value.push(element.can_edit)
		value.push(element.can_delete)
		value.push(element.can_view_group)
		value.push(element.can_view_all)
		value.push(element.can_edit_group)
		value.push(element.can_edit_all)
		value.push(element.can_delete_group)
		value.push(element.can_delete_all)
		values.push(value)
	});
	console.log('values', values);
	return values;
}
module.exports = userController;