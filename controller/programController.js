const programController = {};


//method to list all users

programController.list = (request, response) => {

    let currentUserId = request.body.current_user_id
    let groupUserIds = request.body.group_user_ids

    let viewOwn = request.body.view_own;
    let viewAll = request.body.view_all;
    let viewGroup = request.body.view_group;

    let sqlQuery;

    if (viewAll)
        sqlQuery = 'SELECT  * from programMast  where is_active = 1 ';
    else if (viewGroup)
        sqlQuery = 'SELECT  * from  programMast  where is_active = 1 and created_by IN ' + groupUserIds;
    else if (viewOwn)
        sqlQuery = 'SELECT  * from programMast  where is_active = 1 and created_by = ' + currentUserId;

    console.log('query', sqlQuery);
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get All Program Data Success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

programController.filterList = (request, response) => {

    let groupUserIds = request.body.group_user_ids
    let party_id = request.body.party_id;
    let quality_id = request.body.quality_id;

    let sqlQuery;

    if (party_id != '' && quality_id != '')
        sqlQuery = 'SELECT  programMast.party_id ,programMast.quality_id,programMast.priority,programData.* FROM programMast JOIN programData ON programMast.entry_id = programData.program_control_id where programData.is_active = 1 and programMast.party_id = ' + party_id + ' and programMast.quality_id=' + quality_id + ' and programMast.created_by IN ' + groupUserIds;
    else if (party_id != '' && quality_id == '')
        sqlQuery = 'SELECT  programMast.party_id ,programMast.quality_id,programMast.priority,programData.* FROM programMast JOIN programData ON programMast.entry_id = programData.program_control_id where programData.is_active = 1 and programMast.party_id = ' + party_id + ' and programMast.created_by IN ' + groupUserIds;
    else if (party_id == '' && quality_id != '')
        sqlQuery = 'SELECT  programMast.party_id ,programMast.quality_id,programMast.priority,programData.* FROM programMast JOIN programData ON programMast.entry_id = programData.program_control_id where programData.is_active = 1 and  programMast.quality_id=' + quality_id + ' and programMast.created_by IN ' + groupUserIds;
    else {
        sqlQuery = 'SELECT  programMast.party_id ,programMast.quality_id,programMast.priority,programData.* FROM programMast JOIN programData ON programMast.entry_id = programData.program_control_id where programData.is_active = 1 and programMast.created_by IN ' + groupUserIds;
    }
    console.log('query', sqlQuery);
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get All Program Data Success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}
programController.programGivenByList = (request, response) => {

    let currentUserId = request.body.current_user_id
    let groupUserIds = request.body.group_user_ids

    let viewOwn = request.body.view_own;
    let viewAll = request.body.view_all;
    let viewGroup = request.body.view_group;

    let sqlQuery;

    if (viewAll)
        sqlQuery = 'SELECT DISTINCT program_given_by from programMast  where is_active = 1 ';
    else if (viewGroup)
        sqlQuery = 'SELECT DISTINCT program_given_by from  programMast  where is_active = 1 and created_by IN ' + groupUserIds;
    else if (viewOwn)
        sqlQuery = 'SELECT DISTINCT program_given_by from programMast  where is_active = 1 and created_by = ' + currentUserId;

    console.log('query', sqlQuery);
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get All Program Given By Data Success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

programController.save = (request, response) => {

    const party_id = request.body.party_id
    const quality_id = request.body.quality_id
    const program_given_by = request.body.program_given_by
    const created_by = request.body.created_by
    const user_head_id = request.body.user_head_id
    const priority = request.body.priority

    const created_date = new Date();
    const program_record = request.body.program_record

    const queryString = "insert into programMast (party_id,priority,quality_id,program_given_by,created_by,user_head_id,created_date) values(?,?,?,?,?,?,?)"
    connection.query(queryString, [party_id, priority, quality_id, program_given_by, created_by, user_head_id, created_date], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            console.log('rows.insertId', rows.insertId);
            var values = GetValues(program_record, rows.insertId);
            const permissionString = "insert into programData (program_control_id,shade_no,quantity,batch,lot_no,remark) values ?"
            console.log('permisser', permissionString)
            connection.query(permissionString, [values], function (error, rows, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    successResponse = [responseGenerator.generate(false, 'Program Added Successfully', 200, (rows))];
                    console.log(successResponse)
                    response.send((successResponse))
                }
            })
        }
    });
}

//to update quality
programController.update = (request, response) => {
    const entry_id = request.body.entry_id
    const party_id = request.body.party_id
    const quality_id = request.body.quality_id
    const program_given_by = request.body.program_given_by
    const updated_by = request.body.updated_by
    const updated_date = new Date()
    const program_record = request.body.program_record
    const priority = request.body.priority

    const queryString = "update programMast set party_id = ? , priority = ?,quality_id = ? ,program_given_by = ? ,updated_by = ? , updated_date = ? where entry_id = ?"
    connection.query(queryString, [party_id, priority, quality_id, program_given_by, updated_by, updated_date, entry_id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            let str = ' UPDATE programData SET state = "old" WHERE program_control_id =' + entry_id;
            connection.query(str, function (error, rows1, fields) {
                if (error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                    console.log('err', errorResponse);
                    response.send((errorResponse))
                } else {
                    if (program_record.length) {
                        const value = GetString(program_record, entry_id);
                        const updatestring = ' INSERT INTO programData (entry_id, program_control_id ,shade_no,quantity,batch,lot_no,remark,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE program_control_id = VALUES(program_control_id) ,shade_no = VALUES(shade_no),quantity = VALUES(quantity) ,batch=VALUES(batch),lot_no = VALUES(lot_no), remark=VALUES(remark), state=VALUES(state)';
                        console.log('string', updatestring);
                        connection.query(updatestring, function (error, rows2, fields) {
                            if (error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                console.log('err', errorResponse);
                                response.send((errorResponse))
                            } else {
                                const update = 'update programData set is_active = 0 where state = "old" and program_control_id = ? '
                                connection.query(update, [entry_id], function (error, rows3, fields) {
                                    if (error) {
                                        errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                        console.log('err', errorResponse);
                                        response.send((errorResponse))
                                    } else {
                                        successResponse = [responseGenerator.generate(false, 'Program Updated Successfully', 200, (rows2))];
                                        console.log('sec', successResponse)
                                        response.send((successResponse))
                                    }
                                })
                            }
                        })
                    } else {
                        const update = 'update programData set is_active = 0 where state = "old" and program_control_id = ? '
                        connection.query(update, [entry_id], function (error, rows3, fields) {
                            if (error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                console.log('err', errorResponse);
                                response.send((errorResponse))
                            } else {
                                successResponse = [responseGenerator.generate(false, 'Program Updated Successfully', 200, (rows))];
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
programController.deleteById = (request, response) => {
    let sqlQuery = 'update programMast set is_active = 0 where entry_id = ?'
    connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'DELETE program successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

//get party by party id
programController.getById = (request, response) => {
    const programId = request.params.id
    const queryString = 'select * from programMast where entry_id =?'
    connection.query(queryString, [programId], function (error, programMastRow, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            var getDataString = 'select *from programData where program_control_id = ? and is_active=1'
            connection.query(getDataString, [programId], function (error, programDataRow, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in Program detail Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    console.log('programMastRow', programMastRow)
                    console.log('programDataRow', programDataRow)
                    const obj = {
                        program: programMastRow,
                        program_record: programDataRow
                    }
                    successResponse = [responseGenerator.generate(false, 'GEt program having entry Id ' + programId + ' ,success', 200, (obj))];
                    console.log(successResponse)
                    response.send((successResponse))
                }
            })
        }
    });
}

function GetString(programData, control_id) {
    var str = ''
    var i = 0;
    for (i = 0; i < programData.length - 1; i++) {
        var entry_id = null
        if (programData[i].entry_id) {
            entry_id = programData[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',' + programData[i].shade_no + ',' + programData[i].quantity + ',' + programData[i].batch + ',' + programData[i].lot_no + ',"' + programData[i].remark + '","new"),'
        console.log(str)
    }
    if (i == programData.length - 1) {
        var entry_id = null
        if (programData[i].entry_id) {
            entry_id = programData[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',' + programData[i].shade_no + ',' + programData[i].quantity + ',' + programData[i].batch + ',' + programData[i].lot_no + ',"' + programData[i].remark + '","new")'
    }
    return str;
}

function GetValues(programData, controlid) {
    var values = []
    if (programData.length) {
        programData.forEach((element, index) => {
            var value = [];
            value.push(controlid)
            value.push(element.shade_no)
            value.push(element.quantity)
            value.push(element.batch != '' ? element.batch : null)
            value.push(element.lot_no != '' ? element.lot_no : null)
            value.push(element.remark)
            values.push(value)
        });
    }
    console.log('values', values);
    return values;
}

module.exports = programController;