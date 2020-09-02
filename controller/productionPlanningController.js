const productionPlanningController = {};


productionPlanningController.list = (request, response) => {

    let currentUserId = request.body.current_user_id
    let groupUserIds = request.body.group_user_ids
    let viewOwn = request.body.view_own;
    let viewAll = request.body.view_all;
    let viewGroup = request.body.view_group;
    let sqlQuery;
    if (viewAll)
        sqlQuery = 'SELECT  * from production_planning  where is_active = 1 ';
    else if (viewGroup)
        sqlQuery = 'SELECT  * from  production_planning  where is_active = 1 and created_by IN ' + groupUserIds;
    else if (viewOwn)
        sqlQuery = 'SELECT  * from production_planning  where is_active = 1 and created_by = ' + currentUserId;

    console.log('query', sqlQuery);
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get All Production Planning Data Success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}
productionPlanningController.save = (request, response) => {

    const program_id = request.body.program_control_id
    const batch_id = request.body.batch_control_id
    const quality_id = request.body.quality_id
    const priority = request.body.priority
    const shade_no = request.body.shade_no
    const color_tone = request.body.color_tone
    const time = request.body.time
    const quantity = request.body.quantity

    const created_by = request.body.created_by
    const user_head_id = request.body.user_head_id
    const created_date = new Date();

    const queryString = "insert into production_planning (program_control_id,batch_control_id,created_by,user_head_id,created_date,quality_id,priority,shade_no,color_tone,time,quantity) values(?,?,?,?,?,?,?,?,?,?,?)"
    connection.query(queryString, [program_id, batch_id, created_by, user_head_id, created_date, quality_id, priority, shade_no, color_tone, time, quantity], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Production Added Successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}
//to update quality
productionPlanningController.update = (request, response) => {
    const entry_id = request.body.entry_id
    const program_control_id = request.body.program_control_id
    const batch_control_id = request.body.batch_control_id
    const quality_id = request.body.quality_id
    const priority = request.body.priority
    const shade_no = request.body.shade_no
    const color_tone = request.body.color_tone
    const time = request.body.time
    const quantity = request.body.quantity
    const updated_date = new Date()
    const updated_by = request.body.updated_by

    const queryString = "update production_planning set program_control_id = ? ,batch_control_id =?, updated_by=?, updated_date = ?,quality_id = ?,priority = ?,shade_no=?,color_tone=?,time=?,quantity=? where entry_id = ?"
    connection.query(queryString, [program_control_id, batch_control_id, updated_by, updated_date, quality_id, priority, shade_no, color_tone, time, quantity, entry_id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Program Updated Successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

//to delete by ID
productionPlanningController.deleteById = (request, response) => {
    let sqlQuery = 'update production_planning set is_active = 0 where entry_id = ?'
    connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'DELETE Production successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

//get party by party id
productionPlanningController.getById = (request, response) => {
    const partyId = request.params.id
    const queryString = 'select * from production_planning where entry_id =?'
    connection.query(queryString, [partyId], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get Production by Id success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

module.exports = productionPlanningController;