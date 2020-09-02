const supplierRateController = {};
var Database = require('../database');
var moment = require('moment');

// method to list all quality data
supplierRateController.supplierRateListBySupplierId = (request, response) => {
	
	let sqlQuery = 'SELECT *FROM  supplier_rate where supplier_control_id =  ' + request.params.id;
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			// console.log('data', rows);
			const obj = {
				supplier_control_id: request.params.id,
				supplier_rate_list: rows
			};
			// console.log('obj', obj);
			successResponse = [responseGenerator.generate(false, 'Get All supplier Rate data', 200, (obj))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

supplierRateController.save = (request, response) => {
	const supplierId = request.body.supplier_control_id
	const supplierRateData = request.body.supplier_rate_list

	const queryString = ' UPDATE supplier_rate SET state = "old" WHERE supplier_control_id =' + supplierId;

	connection.query(queryString, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			console.log('rowww', rows);
			const value = GetString(supplierRateData, supplierId)
			const updatestring = ' INSERT INTO supplier_rate (entry_id,supplier_control_id ,item_name , rate , discount_rate,gst_rate,created_date,updated_date,created_by,updated_by,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE supplier_control_id = VALUES(supplier_control_id) ,item_name = VALUES(item_name),rate = VALUES(rate) ,discount_rate=VALUES(discount_rate),gst_rate = VALUES(gst_rate),created_date = VALUES(created_date),updated_date = VALUES(updated_date),created_by = VALUES(created_by),updated_by = VALUES(updated_by),state=VALUES(state)';
			console.log("valueeeeeee", value)
			connection.query(updatestring, value, function (error, rows, fields) {
				if (error) {
					errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
					console.log('Error in query', errorResponse);
					response.send((errorResponse))
				} else {
					const update = 'update supplier_rate set is_active = 0 where state = "old" and supplier_control_id = ? '
					connection.query(update, [supplierId], function (error, rows3, fields) {
						if (error) {
							errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
							console.log('err', errorResponse);
							response.send((errorResponse))
						} else {
							successResponse = [responseGenerator.generate(false, 'Supplier Rate Updated Successfully', 200, (rows3))];
							console.log('sec', successResponse)
							response.send((successResponse))
						}
					})
				}
			});
		}
	});
}

// string to save in database
function GetString(supplierRateData, supplierId) {
	var str = ''
	var i = 0;
	for (i = 0; i < supplierRateData.length - 1; i++) {
		var entry_id = null
		if (supplierRateData[i].entry_id) {
			entry_id = supplierRateData[i].entry_id
			created_date = moment(new Date(supplierRateData[i].created_date)).format('YYYY-MM-DD hh:mm:ss');
			update_date = '"' + moment(new Date()).format('YYYY-MM-DD hh:mm:ss') + '"';
			created_by = supplierRateData[i].created_by;
			updated_by = supplierRateData[i].updated_by;
		} else {
			created_date = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
			update_date = 'NULL';
			created_by = supplierRateData[i].created_by;
			updated_by = 'NULL';
		}
		str += '(' + entry_id + ',' + supplierId + ',"' + supplierRateData[i].item_name + '",' + supplierRateData[i].rate + ',' + supplierRateData[i].discount_rate + ',' + supplierRateData[i].gst_rate + ',"' + created_date + '",' + update_date + ',' + created_by + ',' + updated_by + ',"new"),'
		console.log(str)
	}
	if (i == supplierRateData.length - 1) {
		var entry_id = null
		if (supplierRateData[i].entry_id) {
			entry_id = supplierRateData[i].entry_id
			created_date = moment(new Date(supplierRateData[i].created_date)).format('YYYY-MM-DD hh:mm:ss');
			update_date = '"' + moment(new Date()).format('YYYY-MM-DD hh:mm:ss') + '"';
			created_by = supplierRateData[i].created_by;
			updated_by = supplierRateData[i].updated_by;
		} else {
			created_date = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
			update_date = 'NULL';
			created_by = supplierRateData[i].created_by;
			updated_by = 'NULL';
		}
		str += '(' + entry_id + ',' + supplierId + ',"' + supplierRateData[i].item_name + '",' + supplierRateData[i].rate + ',' + supplierRateData[i].discount_rate + ',' + supplierRateData[i].gst_rate + ',"' + created_date + '",' + update_date + ',' + created_by + ',' + updated_by + ',"new")'
	}
	return str;
}


module.exports = supplierRateController;