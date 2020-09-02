// declaring array to export
const supplierController = {};

// method to list all quality data
supplierController.list = (request, response) => {

	let currentUserId = request.body.current_user_id
	let groupUserIds = request.body.group_user_ids

	let viewOwn = request.body.view_own;
	let viewAll = request.body.view_all;
	let viewGroup = request.body.view_group;

	let sqlQuery;

	if (viewAll) {
		sqlQuery = 'SELECT * FROM supplier where is_active = 1';
	} else if (viewGroup) {
		sqlQuery = 'SELECT * FROM supplier where created_by IN ' + groupUserIds + ' and is_active = 1';
	} else if (viewOwn) {
		sqlQuery = 'SELECT * FROM supplier where created_by = ' + currentUserId + ' and is_active = 1';
	}
	console.log('query', sqlQuery);
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All supplier data', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

supplierController.supplierItemList = (request, response) => {
	console.log('request', request.body);
	let sqlQuery = 'SELECT supplier_rate.*, supplier.supplier_name as supplier_name from supplier join supplier_rate on supplier.entry_id = supplier_rate.supplier_control_id where supplier.is_active = 1';

	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All supplier data', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

supplierController.save = (request, response) => {
	const supplierName = request.body.supplier_name
	const discountPercentage = request.body.discount_percentage
	const gstPercentage = request.body.gst_percentage
	const paymentTerms = request.body.payment_terms
	const remark = request.body.remark
	const created_by = request.body.created_by
	const user_head_id = request.body.user_head_id
	const created_date = new Date()
	const queryString = "insert into supplier (supplier_name,discount_percentage,gst_percentage,payment_terms,remark,created_date,created_by,user_head_id) values(?,?,?,?,?,?,?,?)"
	connection.query(queryString, [supplierName, discountPercentage, gstPercentage, paymentTerms, remark, created_date, created_by, user_head_id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Supplier Added Successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}
//to update quality
supplierController.update = (request, response) => {
	const supplierName = request.body.supplier_name
	const discountPercentage = request.body.discount_percentage
	const gstPercentage = request.body.gst_percentage
	const paymentTerms = request.body.payment_terms
	const remark = request.body.remark
	const entryId = request.body.entry_id
	const updated_by = request.body.updated_by
	// const created_date = new Date()
	const updatedDate = new Date()
	//console.log("entry ID" + entryId)
	const queryString = "update supplier set supplier_name = ? ,discount_percentage =?, gst_percentage=?,payment_terms=?,remark=? ,updated_date=?,updated_by = ? where entry_id = ?"
	connection.query(queryString, [supplierName, discountPercentage, gstPercentage, paymentTerms, remark, updatedDate, updated_by, entryId], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Supplier Updated Successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

//to get by ID
supplierController.deleteById = (request, response) => {
	//	let sqlQuery = 'delete FROM quality where entry_id = ?';
	let sqlQuery = 'update supplier set is_active = 0 where entry_id = ?'
	connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Delete Supplier Entry successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

//get quality by entry id
supplierController.getById = (request, response) => {
	const entryId = request.params.id
	const queryString = 'select * from supplier where entry_id =?'
	connection.query(queryString, [entryId], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get Supplier Id success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

module.exports = supplierController;