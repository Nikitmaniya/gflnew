const shadeController = {};
shadeController.list = (request, response) => {


    let currentUserId = request.body.current_user_id
    let groupUserIds = request.body.group_user_ids

    let viewOwn = request.body.view_own;
    let viewAll = request.body.view_all;
    let viewGroup = request.body.view_group;

    let sqlQuery;

    if (viewAll) {
        sqlQuery = 'SELECT *  FROM shadeMast  where is_active = 1';
    } else if (viewGroup) {
        sqlQuery = 'SELECT *  FROM shadeMast  where is_active = 1  and created_by IN ' + groupUserIds;
    } else if (viewOwn) {
        sqlQuery = 'SELECT *  FROM shadeMast  where is_active = 1  and created_by = ' + currentUserId;
    }
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'GEt shade success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

shadeController.filterList = (request, response) => {
    let groupUserIds = request.body.group_user_ids
    let quality_id = request.body.quality_id;

    let sqlQuery;
    if (quality_id == '') {
        sqlQuery = 'SELECT *  FROM shadeMast  where is_active = 1  and created_by IN ' + groupUserIds;
    } else {
        sqlQuery = 'SELECT *  FROM shadeMast  where is_active = 1  and created_by IN ' + groupUserIds + ' and quality_id IN ' + quality_id;
    }
    console.log('query', sqlQuery)
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'GEt shade success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}
shadeController.shadeByQualityId = (request, response) => {

    let groupUserIds = request.body.group_user_ids
    let quality_id = request.body.quality_id;
    let sqlQuery = 'SELECT *  FROM shadeMast  where is_active = 1  and created_by IN ' + groupUserIds + ' and quality_id = ' + quality_id;

    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'GEt shade by Quality Id success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

shadeController.getshadeDetailById = (request, response) => {
    const shadeID = request.params.id
    let sqlQuery = 'select *from shadeMast where entry_id = ?'
    connection.query(sqlQuery, [shadeID], function (error, shadeMastRow, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            var getDataString = 'select *from shadeData where control_id = ? and is_active=1'
            connection.query(getDataString, [shadeID], function (error, shadeDataRow, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in Shade detail Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    console.log('shadeMastRow', shadeMastRow)
                    console.log('shadeDataRow', shadeDataRow)
                    const obj = {
                        shade: shadeMastRow,
                        shade_record: shadeDataRow
                    }
                    successResponse = [responseGenerator.generate(false, 'GEt shade having entry Id ' + shadeID + ' ,success', 200, (obj))];
                    console.log(successResponse)
                    response.send((successResponse))
                }
            })
        }
    });
}
//method to check for unique Party shade no
shadeController.checkPartyShadeNo = (request, response) => {
    const party_shade_no = request.params.id
    const queryString = 'select * from shadeMast where party_shade_no =?'
    connection.query(queryString, [party_shade_no], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get Party Shade No. success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}
//method to add user
shadeController.save = (request, response) => {

    const party_shade_no = request.body.party_shade_no
    const process_id = request.body.process_id
    // const party_name = request.body.party_name
    const quality_id = request.body.quality_id
    const cutting_id = request.body.cutting_id;
    const remark = request.body.remark;
    const category = request.body.category;
    const lab_colour_no = request.body.lab_colour_no;
    // const quality_name = request.body.quality_name
    const user_head_id = request.body.user_head_id
    // const quality_type = request.body.quality_type
    const colour_tone = request.body.colour_tone
    const created_by = request.body.created_by
    const created_date = new Date();
    const shadedata = request.body.shade_record

    const queryString = "insert into shadeMast (party_shade_no,process_id,quality_id,colour_tone,created_date,created_by,user_head_id,cutting_id,lab_colour_no,category,remark) values(?,?,?,?,?,?,?,?,?,?,?)"

    connection.query(queryString, [party_shade_no, process_id, quality_id, colour_tone, created_date, created_by, user_head_id, cutting_id, lab_colour_no, category, remark], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in shade Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            console.log('sdf', rows.insertId);
            var values = GetValues(shadedata, rows.insertId);
            const permissionString = "insert into shadeData (control_id,supplier_item_id,item_name,supplier_name,rate,amount,concentration,created_date) values ?"
            connection.query(permissionString, [values], function (error, rows, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    successResponse = [responseGenerator.generate(false, 'shade Added Successfully', 200, (rows))];
                    console.log(successResponse)
                    response.send((successResponse))
                }
            })
        }
    });
}

//to update user
shadeController.update = (request, response) => {

    const party_shade_no = request.body.party_shade_no
    const process_id = request.body.process_id
    // const party_name = request.body.party_name
    const quality_id = request.body.quality_id
    // const quality_name = request.body.quality_name
    // const quality_type = request.body.quality_type
    const cutting_id = request.body.cutting_id;
    const remark = request.body.remark;
    const category = request.body.category;
    const lab_colour_no = request.body.lab_colour_no;
    const colour_tone = request.body.colour_tone
    const shadedata = request.body.shade_record
    const entry_id = request.body.entry_id
    const updated_date = new Date();
    const updated_by = request.body.updated_by

    const queryString = "update shadeMast set party_shade_no = ? ,process_id = ?,quality_id = ?,cutting_id = ?,lab_colour_no = ?,category = ?,remark = ?,colour_tone = ?,updated_date=?,updated_by = ? where entry_id = ?"
    connection.query(queryString, [party_shade_no, process_id, quality_id, cutting_id, lab_colour_no, category, remark, colour_tone, updated_date, updated_by, entry_id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in shade Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            let str = ' UPDATE shadeData SET state = "old" WHERE control_id =' + entry_id;
            connection.query(str, function (error, rows1, fields) {
                if (error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                    console.log('err', errorResponse);
                    response.send((errorResponse))
                } else {
                    if (shadedata.length) {
                        const value = GetString(shadedata, entry_id);
                        const updatestring = ' INSERT INTO shadeData (entry_id, control_id ,supplier_item_id,item_name,supplier_name,rate,amount,concentration,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE control_id = VALUES(control_id) ,supplier_item_id = VALUES(supplier_item_id),item_name = VALUES(item_name) ,supplier_name=VALUES(supplier_name),rate = VALUES(rate),amount = VALUES(amount), concentration=VALUES(concentration), state=VALUES(state)';
                        console.log('string', updatestring);
                        connection.query(updatestring, function (error, rows2, fields) {
                            if (error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                console.log('err', errorResponse);
                                response.send((errorResponse))
                            } else {
                                const update = 'update shadedata set is_active = 0 where state = "old" and control_id = ? '
                                connection.query(update, [entry_id], function (error, rows3, fields) {
                                    if (error) {
                                        errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                        console.log('err', errorResponse);
                                        response.send((errorResponse))
                                    } else {
                                        successResponse = [responseGenerator.generate(false, 'shade Updated Successfully', 200, (rows2))];
                                        console.log('sec', successResponse)
                                        response.send((successResponse))
                                    }
                                })
                            }
                        })
                    } else {
                        const update = 'update shadedata set is_active = 0 where state = "old" and control_id = ? '
                        connection.query(update, [entry_id], function (error, rows3, fields) {
                            if (error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in update Query', 403, error)];
                                console.log('err', errorResponse);
                                response.send((errorResponse))
                            } else {
                                successResponse = [responseGenerator.generate(false, 'shade Updated Successfully', 200, (rows))];
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

shadeController.deleteById = (request, response) => {
    let sqlQuery = 'update shadeMast set is_active = 0 where entry_id = ?'
    connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'DELETE shade successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

function GetString(shadeData, control_id) {
    var str = ''
    var i = 0;
    for (i = 0; i < shadeData.length - 1; i++) {
        var entry_id = null
        if (shadeData[i].entry_id) {
            entry_id = shadeData[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',' + shadeData[i].supplier_item_id + ',"' + shadeData[i].item_name + '","' + shadeData[i].supplier_name + '",' + shadeData[i].rate + ',' + shadeData[i].amount + ',' + shadeData[i].concentration + ',"new"),'
        console.log(str)
    }
    if (i == shadeData.length - 1) {
        var entry_id = null
        if (shadeData[i].entry_id) {
            entry_id = shadeData[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',' + shadeData[i].supplier_item_id + ',"' + shadeData[i].item_name + '","' + shadeData[i].supplier_name + '",' + shadeData[i].rate + ',' + shadeData[i].amount + ',' + shadeData[i].concentration + ',"new")'
    }
    return str;
}

function GetValues(shadedata, controlid) {
    var values = []
    if (shadedata.length) {
        shadedata.forEach((element, index) => {
            var value = [];
            value.push(controlid)
            value.push(element.supplier_item_id)
            value.push(element.item_name)
            value.push(element.supplier_name)
            value.push(element.rate)
            value.push(element.amount)
            value.push(element.concentration)
            value.push(new Date())
            values.push(value)
        });
    }
    console.log('values', values);
    return values;
}

module.exports = shadeController;

// [rows.insertId, gr, wt, mtr, quality_id, quality_name, quality_type, no_of_cones, no_of_boxes, created_date]