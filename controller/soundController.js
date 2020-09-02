// declaring array to export
const soundController = {};

// method to list all quality data
soundController.list = (request, response) => {
    
    let sqlQuery;
    sqlQuery = 'SELECT sound_received.*, sound_send.entry_id as send_entry_id , sound_send.payload as send_payload , sound_send.timestamp as send_timestamp FROM sound_send join sound_received on sound_send.payload = sound_received.payload ';
	
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All Sound data', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}
// method to list all quality data
soundController.list1 = (request, response) => {
    
    let sqlQuery;
    sqlQuery = 'SELECT * from nodeRed';
	
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All Sound data', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

// method to list all quality data
soundController.listReceivedSoundData = (request, response) => {
    
    let sqlQuery;
    sqlQuery = 'SELECT sound_received.* FROM  sound_received';
	
	connection.query(sqlQuery, function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Get All Sound data', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}


soundController.saveNodeRed = (request, response) => {
    console.log(request.body)
	const a = request.body.a


	const created_date = new Date()
	const queryString = "insert into nodeRed (c1) values(?)"
	connection.query(queryString, [a], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Sound Send Added Successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

soundController.saveSendSound = (request, response) => {
    console.log(request.body)
	const payload = request.body.payload
	//convert plaintext to encoded unit8array
	// let pp = new TextEncoder().encode(payload)

	// let encodedObject = request.body.encoded
	// let arrr = new Array();
	
	//get values from encoded object
	// const value = Object.values(encodedObject)

	//loop through the values to convert into normal array
	// for(var item of value)
		// arrr.push(item)
	
	//convert normal array to unit8Array 
	// EncodedArray = Uint8Array.from(arrr)
	// console.log("encoded unit8 Array",EncodedArray)

	// decode unit8array to plaintext
	// let plainText = new TextDecoder().decode(EncodedArray)
	// console.log("plainText",plainText)


	const created_date = new Date()
	const queryString = "insert into sound_send (payload , timestamp) values(?,?)"
	connection.query(queryString, [payload,created_date], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Sound Send Added Successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}

soundController.saveReceivedSound = (request, response) => {
    // console.log("jhvbhj",request.body)
    const payload = request.body.payload
    const device_id = request.body.device_id
    const device_model = request.body.device_model
    const android_version = request.body.android_version
    const network = request.body.network
	// const entryId = request.body.quality_sub_type
	const created_date = new Date()
	const queryString = "insert into sound_received (payload ,device_id , device_model,android_version,network, timestamp) values(?,?,?,?,?,?)"
	connection.query(queryString, [payload,device_id,device_model,android_version,network,created_date], function (error, rows, fields) {
		if (error) {
			errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
			console.log('Error in query', errorResponse);
			response.send((errorResponse))
		} else {
			successResponse = [responseGenerator.generate(false, 'Sound Received Added Successfully', 200, (rows))];
			console.log(successResponse)
			response.send((successResponse))
		}
	});
}


module.exports = soundController;