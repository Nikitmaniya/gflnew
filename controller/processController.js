const processController = {};


//method to list all users

processController.list = (request, response) => {

    let currentUserId = request.body.current_user_id
    let groupUserIds = request.body.group_user_ids

    let viewOwn = request.body.view_own;
    let viewAll = request.body.view_all;
    let viewGroup = request.body.view_group;

    let sqlQuery;

    if (viewAll)
        sqlQuery = 'SELECT  * from processMast  where is_active = 1 ';
    else if (viewGroup)
        sqlQuery = 'SELECT  * from  processMast  where is_active = 1 and created_by IN ' + groupUserIds;
    else if (viewOwn)
        sqlQuery = 'SELECT  * from processMast  where is_active = 1 and created_by = ' + currentUserId;

    console.log('query', sqlQuery);
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get All Process Data Success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

processController.save = (request, response) => {


    const process_name = request.body.process_name
    const no_dying_bath = request.body.no_dying_bath
    const dc_multiplying_fac = request.body.dc_multiplying_fac
    const created_by = request.body.created_by
    const user_head_id = request.body.user_head_id
    const created_date = new Date();
    const process_record = request.body.process_req_record

    const queryString = "insert into processMast (process_name,no_dying_bath,dc_multiplying_fac,created_by,user_head_id,created_date) values(?,?,?,?,?,?)"
    connection.query(queryString, [process_name, no_dying_bath, dc_multiplying_fac, created_by, user_head_id, created_date], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            console.log('rows.insertId', rows.insertId);
            var values = GetValues(process_record, rows.insertId);
            const permissionString = "insert into processData (control_id,type,temperature,plc_program_no,hold_time,rate_temperature,item_id,item_name,concentration,item_by,supplier_name) values ?"
            console.log('permisser', permissionString)
            connection.query(permissionString, [values], function (error, rows, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    successResponse = [responseGenerator.generate(false, 'Process Added Successfully', 200, (rows))];
                    console.log(successResponse)
                    response.send((successResponse))
                }
            })
        }
    });
}

//to update quality
processController.update = (request, response) => {

    const process_name = request.body.process_name
    const no_dying_bath = request.body.no_dying_bath
    const dc_multiplying_fac = request.body.dc_multiplying_fac
    const entry_id = request.body.entry_id
    const updated_by = request.body.updated_by
    const updated_date = new Date()
    const process_record = request.body.process_req_record

    const queryString = "update processMast set process_name = ? ,no_dying_bath = ? ,dc_multiplying_fac = ? ,updated_by = ? , updated_date = ? where entry_id = ?"
    connection.query(queryString, [process_name, no_dying_bath, dc_multiplying_fac, updated_by, updated_date, entry_id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            let str = ' UPDATE processData SET state = "old" WHERE control_id =' + entry_id;
            connection.query(str, function (error, rows1, fields) {
                if (error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                    console.log('err', errorResponse);
                    response.send((errorResponse))
                } else {
                    if (process_record.length) {
                        const value = GetString(process_record, entry_id);
                        const updatestring = ' INSERT INTO processData (entry_id, control_id ,type,temperature,plc_program_no,hold_time,rate_temperature,item_id,item_name,concentration,item_by,supplier_name,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE control_id = VALUES(control_id) ,type = VALUES(type),temperature = VALUES(temperature) ,plc_program_no = VALUES(plc_program_no), hold_time=VALUES(hold_time),rate_temperature=VALUES(rate_temperature),item_id=VALUES(item_id),item_name=VALUES(item_name),concentration=VALUES(concentration),item_by=VALUES(item_by),supplier_name=VALUES(supplier_name),state=VALUES(state)';
                        console.log('string', updatestring);
                        connection.query(updatestring, function (error, rows2, fields) {
                            if (error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                console.log('err', errorResponse);
                                response.send((errorResponse))
                            } else {
                                const update = 'update processData set is_active = 0 where state = "old" and control_id = ? '
                                connection.query(update, [entry_id], function (error, rows3, fields) {
                                    if (error) {
                                        errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                        console.log('err', errorResponse);
                                        response.send((errorResponse))
                                    } else {
                                        successResponse = [responseGenerator.generate(false, 'Process Updated Successfully', 200, (rows2))];
                                        console.log('sec', successResponse)
                                        response.send((successResponse))
                                    }
                                })
                            }
                        })
                    } else {
                        const update = 'update processData set is_active = 0 where state = "old" and control_id = ? '
                        connection.query(update, [entry_id], function (error, rows3, fields) {
                            if (error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                console.log('err', errorResponse);
                                response.send((errorResponse))
                            } else {
                                successResponse = [responseGenerator.generate(false, 'Process Updated Successfully', 200, (rows))];
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

//to delete by ID
processController.deleteById = (request, response) => {
    let sqlQuery = 'update processMast set is_active = 0 where entry_id = ?'
    connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'DELETE process successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

//get party by party id
processController.getById = (request, response) => {
    const processId = request.params.id
    const queryString = 'select * from processMast where entry_id =?'
    connection.query(queryString, [processId], function (error, processMastRow, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            var getDataString = 'select *from processData where control_id = ? and is_active=1'
            connection.query(getDataString, [processId], function (error, processDataRow, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in Process detail Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    console.log('processMastRow', processMastRow)
                    console.log('processDataRow', processDataRow)
                    const obj = {
                        process: processMastRow,
                        process_record: processDataRow
                    }
                    successResponse = [responseGenerator.generate(false, 'GEt process having entry Id ' + processId + ' ,success', 200, (obj))];
                    console.log(successResponse)
                    response.send((successResponse))
                }
            })
        }
    });
}

function GetString(processData, control_id) {
    var str = ''
    var i = 0;
    for (i = 0; i < processData.length - 1; i++) {
        var entry_id = null
        if (processData[i].entry_id) {
            entry_id = processData[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',"' + processData[i].type + '",' + processData[i].temperature + ',' + processData[i].plc_program_no + ',' + processData[i].hold_time + ',' + processData[i].rate_temperature + ',' + processData[i].item_id + ',"' + processData[i].item_name + '","' + processData[i].concentration + '","' + processData[i].item_by + '","' + processData[i].supplier_name + '","new"),'
        console.log(str)
    }
    if (i == processData.length - 1) {
        var entry_id = null
        if (processData[i].entry_id) {
            entry_id = processData[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',"' + processData[i].type + '",' + processData[i].temperature + ',' + processData[i].plc_program_no + ',' + processData[i].hold_time + ',' + processData[i].rate_temperature + ',' + processData[i].item_id + ',"' + processData[i].item_name + '","' + processData[i].concentration + '","' + processData[i].item_by + '","' + processData[i].supplier_name + '","new")'
    }
    return str;
}

function GetValues(processData, controlid) {
    var values = []
    if (processData.length) {
        processData.forEach((element, index) => {
            var value = [];
            value.push(controlid)
            value.push(element.type)
            value.push(element.temperature)
            value.push(element.plc_program_no)
            value.push(element.hold_time)
            value.push(element.rate_temperature)
            value.push(element.item_id != '' ? element.item_id : null)
            value.push(element.item_name != '' ? element.item_name : null)
            value.push(element.concentration)
            value.push(element.item_by)
            value.push(element.supplier_name != '' ? element.supplier_name : null)
            values.push(value)
        });
    }
    console.log('values', values);
    return values;
}

module.exports = processController;