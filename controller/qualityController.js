// declaring array to export
const qualityController = {};

// method to list all quality data
qualityController.list = (request, response) => {

	let currentUserId = request.body.current_user_id
	let groupUserIds = request.body.group_user_ids

	let viewOwn = request.body.view_own;
	let viewAll = request.body.view_all;
	let viewGroup = request.body.view_group;

	let sqlQuery;
	if (viewAll) {
		sqlQuery = 'SELECT * FROM quality where is_active = 1';
	} else if (viewGroup) {
		sqlQuery = 'SELECT  *FROM quality where is_active = 1 and created_by IN ' + groupUserIds;
		console.log(sqlQuery)
	} else if (viewOwn) {
		sqlQuery = 'SELECT * FROM quality where created_by = ' + currentUserId + ' and is_active = 1';
	}
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All quality data', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}
qualityController.filterlist = (request, response) => {

	let groupUserIds = request.body.group_user_ids
	let entry_id = request.body.entry_id;
	let party_id = request.body.party_id;
	let sqlQuery;
	if (party_id != '' && entry_id != '')
		sqlQuery = 'SELECT  *FROM quality where is_active = 1 and party_id=' + party_id + ' and entry_id =' + entry_id + ' and created_by IN ' + groupUserIds;
	else if (party_id != '' && entry_id == '')
		sqlQuery = 'SELECT  * from  quality  where is_active = 1 and party_id = ' + party_id + ' and created_by IN ' + groupUserIds;
	else if (party_id == '' && entry_id != '')
		sqlQuery = 'SELECT  * from quality  where is_active = 1 and  entry_id =' + entry_id + ' and created_by IN ' + groupUserIds;
	else {
		sqlQuery = 'SELECT  *FROM quality where is_active = 1 and created_by IN ' + groupUserIds;
	}

	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All quality data', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

qualityController.save = (request, response) => {
	const qualityType = request.body.quality_type
	const qualitySubType = request.body.quality_sub_type
	const qualityName = request.body.quality_name
	const partyId = request.body.party_id
	const qualityId = request.body.quality_id
	const qualityDate = request.body.quality_date
	const remark = request.body.remark
	const wt_per100m = request.body.wt_per100m
	const created_date = new Date()
	const created_by = request.body.created_by
	const user_head_id = request.body.user_head_id
	const queryString = "insert into quality (remark,quality_date,quality_id,quality_type,quality_sub_type,quality_name,party_id,created_date,wt_per100m,created_by,user_head_id) values(?,?,?,?,?,?,?,?,?,?,?)"
	connection.query(queryString, [remark, qualityDate, qualityId, qualityType, qualitySubType, qualityName, partyId, created_date, wt_per100m, created_by, user_head_id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Quality Added Successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}
qualityController.checkQualityId = (request, response) => {
	const quality_id = request.params.id
	const queryString = 'select * from quality where quality_id =?'
	connection.query(queryString, [quality_id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get Quality Id success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}
//to update quality
qualityController.update = (request, response) => {
	const qualityType = request.body.quality_type
	const qualitySubType = request.body.quality_sub_type
	const qualityName = request.body.quality_name
	const partyId = request.body.party_id
	const qualityId = request.body.quality_id
	const qualityDate = request.body.quality_date
	const entryId = request.body.entry_id
	const wt_per100m = request.body.wt_per100m
	const updated_date = new Date()
	const updated_by = request.body.updated_by
	//console.log("entry ID" + entryId)
	const queryString = "update quality set quality_id = ? ,quality_name =?, quality_type=?,quality_sub_type=?,party_id=? , quality_date=?, updated_date=?,wt_per100m=?,updated_by = ? where entry_id = ?"
	connection.query(queryString, [qualityId, qualityName, qualityType, qualitySubType, partyId, qualityDate, updated_date, wt_per100m, updated_by, entryId], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Quality Updated Successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

//to get by ID
qualityController.deleteById = (request, response) => {
	//	let sqlQuery = 'delete FROM quality where entry_id = ?';
	let sqlQuery = 'update quality set is_active = 0 where entry_id = ?'
	connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'DELETE quality successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

//get quality by entry id
qualityController.getById = (request, response) => {
	const entryId = request.params.id
	const queryString = 'select * from quality where entry_id =?'
	connection.query(queryString, [entryId], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get Quality Id success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

// method to list all quality data by party id
qualityController.getQualityByPartyId = (request, response) => {

	let groupUserIds = request.body.group_user_ids
	let partyId = request.body.party_id;
	let sqlQuery = 'SELECT  *FROM quality where is_active = 1 and created_by IN ' + groupUserIds + ' and party_id=' + partyId;
	console.log(sqlQuery)

	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All quality data by Party Id', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}
//get quality Type list
qualityController.getQualityTypeList = (request, response) => {
	connection.query('SELECT distinct quality_type_name FROM quality_type', function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'quality type fetech success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}


//get quality subtype list
qualityController.getQualitySubTypeList = (request, response) => {
	connection.query('SELECT * FROM quality_type where quality_type_name = ?', [request.params.type], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'qget quality sub type list success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}
module.exports = qualityController;