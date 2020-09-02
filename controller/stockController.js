const stockController = {};

stockController.list = (request, response) => {

	let currentUserId = request.body.current_user_id
	let groupUserIds = request.body.group_user_ids

	let viewOwn = request.body.view_own;
	let viewAll = request.body.view_all;
	let viewGroup = request.body.view_group;

	let sqlQuery;

	if (viewAll) {
		sqlQuery = 'SELECT stockMast.*,count(stockData.entry_id) as record_count  FROM stockMast JOIN stockData ON stockMast.entry_id = stockData.control_id where stockMast.is_active = 1 and stockData.is_active=1 GROUP BY stockMast.entry_id';
	} else if (viewGroup) {
		sqlQuery = 'SELECT stockMast.*,count(stockData.entry_id) as record_count  FROM stockMast JOIN stockData ON stockMast.entry_id = stockData.control_id where stockMast.is_active = 1 and stockData.is_active=1 and stockMast.created_by IN ' + groupUserIds + ' GROUP BY stockMast.entry_id';
	} else if (viewOwn) {
		sqlQuery = 'SELECT stockMast.*,count(stockData.entry_id) as record_count  FROM stockMast JOIN stockData ON stockMast.entry_id = stockData.control_id where stockMast.is_active = 1 and stockData.is_active=1 and stockMast.created_by = ' + currentUserId + ' GROUP BY stockMast.entry_id';
	}
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'GEt Stock success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

stockController.stockListByParty = (request, response) => {
	let party_id = request.body.party_id;
	let groupUserIds = request.body.group_user_ids
	let sqlQuery = 'SELECT stockMast.lot_no,  SUM(stockData.wt) as total_wt FROM stockMast JOIN stockData ON stockMast.entry_id = stockData.control_id where stockMast.is_active = 1 and stockData.is_active=1 and stockMast.party_id=' + party_id + '  and stockMast.created_by IN ' + groupUserIds + ' GROUP BY stockMast.lot_no'
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'GEt Stock success', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

//method to get stock detail having user id with permissions
stockController.getStockDetailById = (request, response) => {
	//console.log(request.params)
	const stockID = request.params.id
	let sqlQuery = 'select *from stockMast where entry_id = ?'
	// let sqlQuery = 'SELECT stockData.*,stockMast.* FROM stockMast JOIN stockData ON stockMast.entry_id = stockData.control_id where stockMast.entry_id =?';
	connection.query(sqlQuery, [stockID], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			var getDataString = 'select *from stockData where control_id = ? and is_active=1'
			connection.query(getDataString, [stockID], function (error, data, fields) {
				if (!!error) {
					errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
					console.log(errorResponse);
					response.send((errorResponse))
				} else {
					console.log('rows', rows)
					console.log('data', data)
					const obj = {
						stock: rows,
						bill_record: data
					}
					successResponse = [responseGenerator.generate(false, 'GEt Stock having entry Id ' + stockID + ' ,success', 200, (obj))];
					console.log(successResponse)
					response.send((successResponse))
				}
			})
			// successResponse = [responseGenerator.generate(false, 'GEt Stock having entry Id ' + stockID + ' ,success', 200, (rows))];
			// console.log(successResponse)
			// response.send((successResponse))
		}
	});
}

//method to add user
stockController.save = (request, response) => {

	const stock_id = request.body.stock_id
	const stock_in_type = request.body.stock_in_type
	const party_id = request.body.party_id
	const bill_no = request.body.bill_no
	const bill_date = request.body.bill_date
	const created_by = request.body.created_by
	const user_head_id = request.body.user_head_id
	const chl_no = request.body.chl_no
	const chl_date = request.body.chl_date
	const lot_no = request.body.lot_no
	const remark = request.body.remark
	const created_date = new Date();
	const stockdata = request.body.fabric_record
	const batch = request.body.batch

	const queryString = "insert into stockMast (batch,stock_id,stock_in_type,party_id,bill_no,bill_date,chl_no,chl_date,lot_no,remark,created_date,created_by,user_head_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?)"

	connection.query(queryString, [batch, stock_id, stock_in_type, party_id, bill_no, bill_date, chl_no, chl_date, lot_no, remark, created_date, created_by, user_head_id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in stock Query', 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			console.log('sdf', rows.insertId);
			var values = GetValues(stockdata, rows.insertId);
			// (?,?,?,?,?,?,?,?,?,?)
			const permissionString = "insert into stockData (control_id,gr,wt,mtr,quality_entry_id,no_of_cones,no_of_boxes,created_date) values ?"
			connection.query(permissionString, [values], function (error, rows, fields) {
				if (!!error) {
					errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
					console.log(errorResponse);
					response.send((errorResponse))
				} else {
					successResponse = [responseGenerator.generate(false, 'Stock Added Successfully', 200, (rows))];
					console.log(successResponse)
					response.send((successResponse))
				}
			})
		}
	});
}

//to update user
stockController.update = (request, response) => {

	const entry_id = request.body.entry_id
	const stock_id = request.body.stock_id
	const stock_in_type = request.body.stock_in_type
	const party_id = request.body.party_id
	const bill_no = request.body.bill_no
	const bill_date = request.body.bill_date
	const chl_no = request.body.chl_no
	const chl_date = request.body.chl_date
	const lot_no = request.body.lot_no
	const remark = request.body.remark
	const updated_date = new Date();
	const updated_by = request.body.updated_by
	const batch = request.body.batch
	const stockdata = request.body.fabric_record
	const queryString = "update stockMast set batch=?, stock_id = ? ,stock_in_type = ?,party_id = ?,bill_no = ?,bill_date = ?,chl_no = ?,chl_date = ?,lot_no = ?,remark = ?,updated_date=?,updated_by = ? where entry_id = ?"
	connection.query(queryString, [batch, stock_id, stock_in_type, party_id, bill_no, bill_date, chl_no, chl_date, lot_no, remark, updated_date, updated_by, entry_id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in stock Query', 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			let str = ' UPDATE stockData SET state = "old" WHERE control_id =' + entry_id;
			connection.query(str, function (error, rows1, fields) {
				if (error) {
					errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
					console.log('err', errorResponse);
					response.send((errorResponse))
				} else {
					if (stockdata.length) {
						const value = GetString(stockdata, entry_id);
						const updatestring = ' INSERT INTO stockData (entry_id, control_id ,gr, wt,mtr,no_of_cones,no_of_boxes,quality_entry_id,state) VALUES ' + value + ') ON DUPLICATE KEY UPDATE control_id = VALUES(control_id) ,gr = VALUES(gr) ,wt=VALUES(wt),mtr = VALUES(mtr),no_of_cones = VALUES(no_of_cones), no_of_boxes=VALUES(no_of_boxes),quality_entry_id = VALUES(quality_entry_id), state=VALUES(state)';
						console.log('string', updatestring);
						connection.query(updatestring, function (error, rows2, fields) {
							if (error) {
								errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
								console.log('err', errorResponse);
								response.send((errorResponse))
							} else {
								const update = 'update stockdata set is_active = 0 where state = "old" and control_id = ? '
								connection.query(update, [entry_id], function (error, rows3, fields) {
									if (error) {
										errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
										console.log('err', errorResponse);
										response.send((errorResponse))
									} else {
										successResponse = [responseGenerator.generate(false, 'Stock Updated Successfully', 200, (rows2))];
										console.log('sec', successResponse)
										response.send((successResponse))
									}
								})
							}
						})
					} else {
						const update = 'update stockdata set is_active = 0 where state = "old" and control_id = ? '
						connection.query(update, [entry_id], function (error, rows3, fields) {
							if (error) {
								errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
								console.log('err', errorResponse);
								response.send((errorResponse))
							} else {
								successResponse = [responseGenerator.generate(false, 'Stock Updated Successfully', 200, (rows))];
								console.log('sec', successResponse)
								response.send((successResponse))
							}
						})
					}

				}
			})



		}
	});
}

stockController.deleteById = (request, response) => {
	let sqlQuery = 'update stockMast set is_active = 0 where entry_id = ?'
	connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
			console.log(errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'DELETE stock successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

function GetString(stockData, control_id) {
	var str = ''
	var i = 0;
	for (i = 0; i < stockData.length - 1; i++) {
		var entry_id = null
		if (stockData[i].entry_id) {
			entry_id = stockData[i].entry_id
		}
		str += '(' + entry_id + ',' + control_id + ',' + stockData[i].gr + ',' + stockData[i].wt + ',' + stockData[i].mtr + ',' + stockData[i].no_of_cones + ',' + stockData[i].no_of_boxes + ',"' + stockData[i].quality_entry_id + '","new"),'
		console.log(str)
	}
	if (i == stockData.length - 1) {
		var entry_id = null
		if (stockData[i].entry_id) {
			entry_id = stockData[i].entry_id
		}
		str += '(' + entry_id + ',' + control_id + ',' + stockData[i].gr + ',' + stockData[i].wt + ',' + stockData[i].mtr + ',' + stockData[i].no_of_cones + ',' + stockData[i].no_of_boxes + ',"' + stockData[i].quality_entry_id + '", "new"'
	}
	return str;
}

function GetValues(stockdata, controlid) {
	var values = []
	stockdata.forEach((element, index) => {
		var value = [];
		value.push(controlid)
		value.push(element.gr)
		value.push(element.wt)
		value.push(element.mtr)
		value.push(element.quality_entry_id)
		// value.push(element.quality_name)
		// value.push(element.quality_type)
		value.push(element.no_of_cones)
		value.push(element.no_of_boxes)
		value.push(new Date())
		values.push(value)
	});
	console.log('values', values);
	return values;
}

module.exports = stockController;

// [rows.insertId, gr, wt, mtr, quality_id, quality_name, quality_type, no_of_cones, no_of_boxes, created_date]