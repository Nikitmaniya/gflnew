const dynamicProcessController = {};
var Database = require('./database');
var database = new Database();
var chemicalGlobal = [];

//method to list all users

dynamicProcessController.list = (request, response) => {

    let currentUserId = request.body.current_user_id
    let groupUserIds = request.body.group_user_ids

    let viewOwn = request.body.view_own;
    let viewAll = request.body.view_all;
    let viewGroup = request.body.view_group;

    let sqlQuery;

    if (viewAll)
        sqlQuery = 'SELECT  * from dynamicProcessMast  where is_active = 1 ';
    else if (viewGroup)
        sqlQuery = 'SELECT  * from  dynamicProcessMast  where is_active = 1 and created_by IN ' + groupUserIds;
    else if (viewOwn)
        sqlQuery = 'SELECT  * from dynamicProcessMast  where is_active = 1 and created_by = ' + currentUserId;

    console.log('query', sqlQuery);
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get All Dynamic Process Data Success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

dynamicProcessController.save = (request, response) => {

    const process_name = request.body.process_name
    const time = request.body.time
    const created_by = request.body.created_by
    const user_head_id = request.body.user_head_id
    const created_date = new Date();
    const process_record = request.body.process_req_record
    var mastId;
    const queryString = "insert into dynamicProcessMast (process_name,time,created_by,user_head_id,created_date) values(?,?,?,?,?)"
    connection.query(queryString, [process_name, time, created_by, user_head_id, created_date], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            mastId = rows.insertId;
            console.log('rows.insertId', rows.insertId);
            var values = GetValues(process_record, rows.insertId);
            const permissionString = "insert into dynamicProcessData (control_id,step_name,step_position,func_name,func_value,func_position,water_type,drain_type,fabric_ratio,jet_level,set_value,rate_of_rise,hold_time,pressure,pump_speed,fill_type,dosing_percentage,have_dose,dose_at_temp,dose_type,dose_while_heating,operator_code,operator_message,start_at_temp) values ?"
            console.log('permisser', permissionString)
            connection.query(permissionString, [values], function (error, datarow, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    console.log('rowssss', datarow);
                    var rowId = [];
                    var chemicalData = [];
                    // chemicalData.push(process_record[0].dosing_chemical)
                    // rowId.push(datarow.insertId);
                    for (let i = 0; i < datarow.affectedRows; i++) {
                        rowId.push(datarow.insertId + i);
                        console.log('preocess chemical record', process_record[i])
                        chemicalData.push(process_record[i].dosing_chemical)
                    }
                    console.log('rowid', rowId);
                    console.log('chemicalData', chemicalData);
                    var values = GetChemicalDetail(chemicalData, mastId, rowId);
                    if (values.length) {
                        const queryString = "insert into dynamicProcessChemical (dynamic_mast_control_id,control_id,item_id,item_name,supplier_name,concentration,lr_or_f_wt) values ?"
                        connection.query(queryString, [values], function (error, rowschemical, fields) {
                            if (!!error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                                console.log(errorResponse);
                                response.send((errorResponse))
                            } else {
                                successResponse = [responseGenerator.generate(false, 'Dynamic Process Added Successfully', 200, (rowschemical))];
                                console.log(successResponse)
                                response.send((successResponse))
                            }
                        })
                    } else {
                        successResponse = [responseGenerator.generate(false, 'Dynamic Process Added Successfully', 200, (datarow))];
                        console.log(successResponse)
                        response.send((successResponse))
                    }

                }
            })
        }
    });
}

//to update quality
dynamicProcessController.update = (request, response) => {

    const process_name = request.body.process_name
    const time = request.body.time
    const entry_id = request.body.entry_id
    const updated_by = request.body.updated_by
    const updated_date = new Date()
    const process_record = request.body.process_req_record
    var dynamicMastDataRow;
    var setdynamicProcessDataOld;
    var dynamicProcessDataId;

    const queryString = "update dynamicProcessMast set process_name = ?  ,time = ? ,updated_by = ? , updated_date = ? where entry_id = ?"
    database.query(queryString, [process_name, time, updated_by, updated_date, entry_id])
        .then(rows => {
            dynamicMastDataRow = rows;
            let str = ' UPDATE dynamicProcessData SET state = "old" WHERE control_id =' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            setdynamicProcessDataOld = rows;
            if (process_record.length) {
                const value = GetString(process_record, entry_id);
                const updatestring = ' INSERT INTO dynamicProcessData (entry_id, control_id,step_name,step_position,func_name,func_value,func_position,water_type,drain_type,fabric_ratio,jet_level,set_value,rate_of_rise,hold_time,pressure,pump_speed,fill_type,dosing_percentage,have_dose,dose_at_temp,dose_type,dose_while_heating,operator_code,operator_message,start_at_temp,state) VALUES ' + value +
                    ' ON DUPLICATE KEY UPDATE control_id = VALUES(control_id),step_name = VALUES(step_name),step_position = VALUES(step_position) ,func_name = VALUES(func_name),func_value=VALUES(func_value),func_position = VALUES(func_position) ,water_type = VALUES(water_type), drain_type=VALUES(drain_type),fabric_ratio=VALUES(fabric_ratio),jet_level=VALUES(jet_level),set_value=VALUES(set_value),rate_of_rise=VALUES(rate_of_rise),hold_time=VALUES(hold_time),pressure=VALUES(pressure),pump_speed=VALUES(pump_speed),fill_type=VALUES(fill_type),dosing_percentage=VALUES(dosing_percentage),have_dose=VALUES(have_dose),dose_at_temp=VALUES(dose_at_temp),dose_type=VALUES(dose_type),dose_type=VALUES(dose_type),operator_code=VALUES(operator_code),operator_message=VALUES(operator_message),start_at_temp=VALUES(start_at_temp),state=VALUES(state)';
                console.log('string', updatestring);
                return database.query(updatestring, value);
            }
        })
        .then(rows => {
            console.log('process dynamic data updated', rows);
            const update = 'update dynamicProcessData set is_active = 0 where state = "old" and control_id = ? '
            return database.query(update, entry_id);
        })
        .then(rows => {
            var str = 'update dynamicProcessChemical set state ="old" where dynamic_mast_control_id =' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            var str = 'select entry_id from dynamicProcessData where is_active = 1  and control_id = ' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            dynamicProcessDataId = rows;
            console.log('rows', dynamicProcessDataId)
            var rowId = getDynamicProcessDataRowId(dynamicProcessDataId);
            if (chemicalGlobal.length) {
                const value = GetChemicalString(chemicalGlobal, entry_id, rowId);
                console.log('valuesss', value);

                const updatestring = ' INSERT INTO dynamicProcessChemical (entry_id,dynamic_mast_control_id,control_id, item_id,item_name,supplier_name,concentration,lr_or_f_wt ,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE dynamic_mast_control_id = VALUES(dynamic_mast_control_id), control_id = VALUES(control_id), item_id = VALUES(item_id) ,item_name = VALUES(item_name) ,supplier_name = VALUES(supplier_name) ,concentration = VALUES(concentration) ,lr_or_f_wt = VALUES(lr_or_f_wt) ,state=VALUES(state)';
                console.log('string', updatestring);
                return database.query(updatestring, value);
            }
        })
        .then(rows => {
            const update = 'update dynamicProcessChemical set is_active = 0 where state = "old" and dynamic_mast_control_id = ? '
            return database.query(update, entry_id);
        })
        .then(rows => {
            successResponse = [responseGenerator.generate(false, 'Dynamic Process Updated Successfully', 200, (rows))];
            console.log('sec', successResponse)
            response.send((successResponse))
        }, err => {
            return database.close().then(() => {
                throw err;
            })
        })
        .catch(err => {
            errorResponse = [responseGenerator.generate(true, 'Error in Dynamic Process Query', 403, err)];
            console.log(errorResponse);
            response.send((errorResponse))
            return database.close().then(() => {
                throw err;
            })
        });
}

//to delete by ID
dynamicProcessController.deleteById = (request, response) => {
    let sqlQuery = 'update dynamicProcessMast set is_active = 0 where entry_id =' + request.params.id
    console.log('swl', sqlQuery)
    connection.query(sqlQuery, function (error, rows, fields) {
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
dynamicProcessController.getById = (request, response) => {
    const processId = request.params.id
    const queryString = 'select * from dynamicProcessMast where entry_id =?'
    connection.query(queryString, [processId], function (error, dynamicProcessMastRow, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            var getDataString = 'select *from dynamicProcessData where control_id = ? and is_active=1'
            connection.query(getDataString, [processId], function (error, dynamicProcessDataRow, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in Process detail Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    let i;
                    var rowId = '(';
                    for (i = 0; i < dynamicProcessDataRow.length - 1; i++) {
                        rowId += dynamicProcessDataRow[i].entry_id + ',';
                    }
                    if (i == dynamicProcessDataRow.length - 1) {
                        rowId += dynamicProcessDataRow[i].entry_id + ')';

                    }
                    console.log('dynamicProcessMastRow', dynamicProcessMastRow)
                    console.log('processDataRow', dynamicProcessDataRow)
                    var getChemicalData = 'select *from dynamicProcessChemical where is_active = 1 and control_id in ' + rowId;
                    console.log('quer', getChemicalData);
                    connection.query(getChemicalData, function (error, chemicalData, fields) {
                        if (!!error) {
                            errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                            console.log(errorResponse);
                            response.send((errorResponse))
                        } else {
                            var dynamcDataRow = dynamicProcessDataRow;
                            dynamcDataRow.forEach(dataele => {
                                let chemicalDetail = [];
                                chemicalData.forEach(ele => {
                                    if (ele.control_id === dataele.entry_id) {
                                        chemicalDetail.push(ele);
                                    }
                                });
                                dataele['dosing_chemical'] = chemicalDetail;
                            });

                            const obj = {
                                process: dynamicProcessMastRow,
                                // process_record: dynamicProcessDataRow
                                process_record: dynamcDataRow
                            }
                            successResponse = [responseGenerator.generate(false, 'GEt process having entry Id ' + processId + ' ,success', 200, (obj))];
                            console.log(successResponse)
                            response.send((successResponse))
                        }
                    })

                }
            })
        }
    });
}

// for update
function GetString(dynamicProcessData, control_id) {
    var str = ''
    var i = 0;
    var chemicalArray = []
    for (i = 0; i < dynamicProcessData.length - 1; i++) {
        chemicalArray.push(dynamicProcessData[i].dosing_chemical)
        var entry_id = null
        if (dynamicProcessData[i].entry_id) {
            entry_id = dynamicProcessData[i].entry_id
        }
        dynamicProcessData[i] = checkNullCondition(dynamicProcessData[i])
        str += '(' + entry_id + ',' + control_id + ',"' + dynamicProcessData[i].step_name + '","' + dynamicProcessData[i].step_position + '","' + dynamicProcessData[i].func_name + '","' + dynamicProcessData[i].func_value + '","' + dynamicProcessData[i].func_position + '","' + dynamicProcessData[i].water_type + '","' + dynamicProcessData[i].drain_type + '","' + dynamicProcessData[i].fabric_ratio + '","' + dynamicProcessData[i].jet_level + '","' + dynamicProcessData[i].set_value + '","' + dynamicProcessData[i].rate_of_rise + '","' + dynamicProcessData[i].hold_time + '","' + dynamicProcessData[i].pressure + '","' + dynamicProcessData[i].pump_speed + '","' + dynamicProcessData[i].fill_type + '","' + dynamicProcessData[i].dosing_percentage + '","' + dynamicProcessData[i].have_dose + '","' + dynamicProcessData[i].dose_at_temp + '","' + dynamicProcessData[i].dose_type + '","' + dynamicProcessData[i].dose_while_heating + '","' + dynamicProcessData[i].operator_code + '","' + dynamicProcessData[i].operator_message + '","' + dynamicProcessData[i].start_at_temp + '","new"),'
        console.log(str)
    }
    if (i == dynamicProcessData.length - 1) {
        chemicalArray.push(dynamicProcessData[i].dosing_chemical)
        var entry_id = null
        if (dynamicProcessData[i].entry_id) {
            entry_id = dynamicProcessData[i].entry_id
        }
        dynamicProcessData[i] = checkNullCondition(dynamicProcessData[i])
        str += '(' + entry_id + ',' + control_id + ',"' + dynamicProcessData[i].step_name + '","' + dynamicProcessData[i].step_position + '","' + dynamicProcessData[i].func_name + '","' + dynamicProcessData[i].func_value + '","' + dynamicProcessData[i].func_position + '","' + dynamicProcessData[i].water_type + '","' + dynamicProcessData[i].drain_type + '","' + dynamicProcessData[i].fabric_ratio + '","' + dynamicProcessData[i].jet_level + '","' + dynamicProcessData[i].set_value + '","' + dynamicProcessData[i].rate_of_rise + '","' + dynamicProcessData[i].hold_time + '","' + dynamicProcessData[i].pressure + '","' + dynamicProcessData[i].pump_speed + '","' + dynamicProcessData[i].fill_type + '","' + dynamicProcessData[i].dosing_percentage + '","' + dynamicProcessData[i].have_dose + '","' + dynamicProcessData[i].dose_at_temp + '","' + dynamicProcessData[i].dose_type + '","' + dynamicProcessData[i].dose_while_heating + '","' + dynamicProcessData[i].operator_code + '","' + dynamicProcessData[i].operator_message + '","' + dynamicProcessData[i].start_at_temp + '","new")'
    }
    chemicalGlobal = chemicalArray;
    console.log('gloval', chemicalGlobal);
    return str;
}

function GetChemicalString(chemicalData, mast_control_id, dynamic_process_row_id) {
    var str = ''
    var i = 0;
    console.log('chemicalData', chemicalData.length);

    for (i = 0; i < chemicalData.length - 1; i++) {
        if (chemicalData[i].length) {
            chemicalData[i].forEach(ele => {
                var entry_id = null
                if (ele.entry_id) {
                    entry_id = ele.entry_id
                }
                ele = checkNullConditionForChemical(ele)
                str += '(' + entry_id + ',' + mast_control_id + ',' + dynamic_process_row_id[i] + ',"' + ele.item_id + '","' + ele.item_name + '","' + ele.supplier_name + '","' + ele.concentration + '","' + ele.lr_or_f_wt + '","new"),'
                console.log('strt', str)
            });
        }
    }
    if (i == chemicalData.length - 1) {
        if (chemicalData[i].length) {
            chemicalData[i].forEach((ele, index) => {
                var entry_id = null
                var length = chemicalData[i].length
                if (ele.entry_id) {
                    entry_id = ele.entry_id
                }
                ele = checkNullConditionForChemical(ele)
                if (index != length - 1) {
                    str += '(' + entry_id + ',' + mast_control_id + ',' + dynamic_process_row_id[i] + ',"' + ele.item_id + '","' + ele.item_name + '","' + ele.supplier_name + '","' + ele.concentration + '","' + ele.lr_or_f_wt + '","new"),'
                } else {
                    str += '(' + entry_id + ',' + mast_control_id + ',' + dynamic_process_row_id[i] + ',"' + ele.item_id + '","' + ele.item_name + '","' + ele.supplier_name + '","' + ele.concentration + '","' + ele.lr_or_f_wt + '","new")'
                }
            });
        } else {
            str = str.slice(0, -1);
        }
    }
    console.log('final', str)

    return str;
}

function checkNullConditionForChemical(element) {
    element.item_id = element.item_id !== undefined && element.item_id !== '' ? element.item_id : null
    element.item_name = element.item_name != undefined && element.item_name != '' ? element.item_name : null
    element.supplier_name = element.supplier_name != undefined && element.supplier_name != '' ? element.supplier_name : null
    element.concentration = element.concentration != undefined && element.concentration != '' ? element.concentration : null
    element.lr_or_f_wt = element.lr_or_f_wt != undefined && element.lr_or_f_wt != '' ? element.lr_or_f_wt : null
    console.log('ele', element);
    return element;
}

function getDynamicProcessDataRowId(rowIds) {
    let rowId = [];
    console.log('rowids', rowIds);
    rowIds.forEach(data => {
        rowId.push(data.entry_id);
    });
    console.log('rows ids', rowId);
    return rowId;
}




// during add
function GetValues(dynamicProcessData, controlid) {
    var values = []
    if (dynamicProcessData.length) {
        dynamicProcessData.forEach((element, index) => {
            var value = [];
            value.push(controlid)
            value.push(element.step_name)
            value.push(element.step_position)
            value.push(element.func_name)
            value.push(element.func_value)
            value.push(element.func_position)
            value.push(element.water_type != '' ? element.water_type : null)
            value.push(element.drain_type != '' ? element.drain_type : null)
            value.push(element.fabric_ratio != '' ? element.fabric_ratio : null)
            value.push(element.jet_level != '' ? element.jet_level : null)
            value.push(element.set_value != '' ? element.set_value : null)
            value.push(element.rate_of_rise != '' ? element.rate_of_rise : null)
            value.push(element.hold_time != '' ? element.hold_time : null)
            value.push(element.pressure != '' ? element.pressure : null)
            value.push(element.pump_speed != '' ? element.pump_speed : null)
            value.push(element.fill_type != '' ? element.fill_type : null)
            value.push(element.dosing_percentage != '' ? element.dosing_percentage : null)
            value.push(element.have_dose != '' ? element.have_dose : null)
            value.push(element.dose_at_temp != '' ? element.dose_at_temp : null)
            value.push(element.dose_type != '' ? element.dose_type : null)
            value.push(element.dose_while_heating != '' ? element.dose_while_heating : null)
            value.push(element.operator_code != '' ? element.operator_code : null)
            value.push(element.operator_message != '' ? element.operator_message : null)
            value.push(element.start_at_temp != '' ? element.start_at_temp : null)

            values.push(value)
        });
    }
    console.log('values', values);
    return values;
}

function GetChemicalDetail(chemicalData, mastId, rowId) {
    var values = []
    console.log('chemical data', chemicalData);
    if (chemicalData.length) {
        chemicalData.forEach((ele, index) => {
            console.log('chemical ele', ele);
            if (ele.length) {
                ele.forEach((element) => {
                    var value = [];
                    value.push(mastId)
                    value.push(rowId[index])
                    value.push(element.item_id != '' && element.item_id != undefined ? element.item_id : null)
                    value.push(element.item_name != '' && element.item_name != undefined ? element.item_name : null)
                    value.push(element.supplier_name != '' && element.supplier_name != undefined ? element.supplier_name : null)
                    value.push(element.concentration != '' && element.concentration != undefined ? element.concentration : null)
                    value.push(element.lr_or_f_wt != '' && element.lr_or_f_wt != undefined ? element.lr_or_f_wt : null)
                    values.push(value)
                })
            }

        });
    }
    console.log('values', values);
    return values;
}

function checkNullCondition(element) {
    element.water_type = element.water_type != undefined && element.water_type != '' ? element.water_type : null
    element.drain_type = element.drain_type != undefined && element.drain_type != '' ? element.drain_type : null
    element.fabric_ratio = element.fabric_ratio != undefined && element.fabric_ratio != '' ? element.fabric_ratio : null
    element.jet_level = element.jet_level != undefined && element.jet_level != '' ? element.jet_level : null
    element.set_value = element.set_value != undefined && element.set_value != '' ? element.set_value : null
    element.rate_of_rise = element.rate_of_rise != undefined && element.rate_of_rise != '' ? element.rate_of_rise : null
    element.hold_time = element.hold_time != undefined && element.hold_time != '' ? element.hold_time : null
    element.pressure = element.pressure != undefined && element.pressure != '' ? element.pressure : null
    element.pump_speed = element.pump_speed != undefined && element.pump_speed != '' ? element.pump_speed : null
    element.fill_type = element.fill_type != undefined && element.fill_type != '' ? element.fill_type : null
    element.dosing_percentage = element.dosing_percentage != undefined && element.dosing_percentage != '' ? element.dosing_percentage : null
    element.have_dose = element.have_dose != undefined && element.have_dose != '' ? element.have_dose : null
    element.dose_at_temp = element.dose_at_temp != undefined && element.dose_at_temp != '' ? element.dose_at_temp : null
    element.dose_type = element.dose_type != undefined && element.dose_type != '' ? element.dose_type : null
    element.dose_while_heating = element.dose_while_heating != undefined && element.dose_while_heating != '' ? element.dose_while_heating : null
    element.operator_code = element.operator_code != undefined && element.operator_code != '' ? element.operator_code : null
    element.operator_message = element.operator_message != undefined && element.operator_message != '' ? element.operator_message : null
    element.start_at_temp = element.start_at_temp != undefined && element.start_at_temp != '' ? element.start_at_temp : null


    return element;
}



module.exports = dynamicProcessController;