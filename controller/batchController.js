var Database = require('./database');
var database = new Database();
var batchGrDetailGlobal = [];
const batchController = {};

batchController.list = (request, response) => {

    let sqlQuery;

    let currentUserId = request.body.current_user_id
    let groupUserIds = request.body.group_user_ids

    let viewOwn = request.body.view_own;
    let viewAll = request.body.view_all;
    let viewGroup = request.body.view_group;

    if (viewAll) {
        sqlQuery = 'SELECT batchMast.*, quality.quality_id as quality_id,quality.quality_name as quality_name , quality.quality_type as quality_type from batchMast join quality on batchMast.quality_entry_id = quality.entry_id where batchMast.is_active = 1';
    } else if (viewGroup) {
        sqlQuery = 'SELECT batchMast.*, quality.quality_id as quality_id,quality.quality_name as quality_name , quality.quality_type as quality_type from batchMast join quality on batchMast.quality_entry_id = quality.entry_id where batchMast.is_active = 1 and batchMast.created_by IN ' + groupUserIds;
    } else if (viewOwn) {
        sqlQuery = 'SELECT batchMast.*, quality.quality_id as quality_id,quality.quality_name as quality_name , quality.quality_type as quality_type from batchMast join quality on batchMast.quality_entry_id = quality.entry_id where batchMast.is_active = 1 and batchMast.created_by = ' + currentUserId;
    }
    console.log('sql', sqlQuery)
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'GEt Batch success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

batchController.batchListByQualityId = (request, response) => {
    let quality_id = request.body.quality_id;
    let groupUserIds = request.body.group_user_ids
    let sqlQuery = 'SELECT batchMast.entry_id as batch_no,  SUM(batchData.wt) as total_wt,SUM(batchData.no_of_cones_taka) as total_taka,SUM(batchData.mtr) as total_mtr FROM batchMast JOIN batchData ON batchMast.entry_id = batchData.control_id where batchMast.is_active = 1 and batchData.is_active=1 and batchMast.quality_entry_id=' + quality_id + '  and batchMast.created_by IN ' + groupUserIds + ' GROUP BY batchMast.entry_id'
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((exrrorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'GEt batch by quality id success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}
//method to get batch detail having user id with permissions
batchController.getBatchDetailById = (request, response) => {
    //console.log(request.params)
    const batchId = request.params.id
    let sqlQuery = 'select batchMast.* , quality.quality_type as quality_type , quality.quality_name as quality_name from batchMast JOIN quality ON batchMast.quality_entry_id = quality.entry_id where batchMast.entry_id = ?'
    connection.query(sqlQuery, [batchId], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            var getDataString = 'select *from batchData where control_id = ? and is_active=1'
            connection.query(getDataString, [batchId], function (error, data, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    let i;
                    var rowId = '(';
                    for (i = 0; i < data.length - 1; i++) {
                        rowId += data[i].entry_id + ',';
                    }
                    if (i == data.length - 1) {
                        rowId += data[i].entry_id + ')';

                    }
                    var getGrDetailString = 'select *from batchGrDetail where is_active = 1 and control_id_gr_detail in ' + rowId;
                    connection.query(getGrDetailString, function (error, grDetailrows, fields) {
                        if (!!error) {
                            errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                            console.log(errorResponse);
                            response.send((errorResponse))
                        } else {
                            var batchData = data;
                            batchData.forEach(batchDataele => {
                                let grDetail = [];
                                grDetailrows.forEach(ele => {
                                    if (ele.control_id_gr_detail === batchDataele.entry_id) {
                                        grDetail.push(ele);
                                    }
                                });
                                batchDataele['batch_quality_detail'] = grDetail;
                            });

                            const obj = {
                                batch: rows,
                                batch_data: batchData
                            }
                            successResponse = [responseGenerator.generate(false, 'GEt batch having entry Id ' + batchId + ' ,success', 200, (obj))];
                            console.log(successResponse)
                            response.send((successResponse))
                        }
                    })

                }
            })
        }
    });
}
//method to add batch
batchController.save = (request, response) => {

    const batch_id = request.body.batch_id != undefined ? request.body.batch_id : null
    const created_by = request.body.created_by;
    const user_head_id = request.body.user_head_id;
    const quality_entry_id = request.body.quality_entry_id
    const created_date = new Date();
    const batchdata = request.body.batch_data

    const queryString = "insert into batchMast (batch_id,quality_entry_id,created_date,created_by,user_head_id) values(?,?,?,?,?)"
    var mastId;
    connection.query(queryString, [batch_id, quality_entry_id, created_date, created_by, user_head_id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in batch Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            console.log('sdf', rows.insertId);
            mastId = rows.insertId;
            var values = GetValues(batchdata, rows.insertId);
            // (?,?,?,?,?,?,?,?,?,?)
            const queryString = "insert into batchData (control_id,gr,lot_no,wt,mtr,no_of_cones_taka,unit) values ?"
            connection.query(queryString, [values], function (error, rows, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    console.log('rowssss', rows);
                    var rowId = [];
                    var batchGrDetailData = [];
                    batchGrDetailData.push(batchdata[0].batch_quality_detail)
                    rowId.push(rows.insertId);
                    for (let i = 1; i < rows.affectedRows; i++) {
                        rowId.push(rows.insertId + i);
                        batchGrDetailData.push(batchdata[i].batch_quality_detail)
                    }
                    console.log('rowid', rowId);
                    console.log('batchGrDetailData', batchGrDetailData);

                    var values = GetBatchGrDetailValues(batchGrDetailData, mastId, rowId);
                    if (values.length) {
                        const queryString = "insert into batchGrDetail (quantity,control_id_gr_Detail,batch_mast_control_id) values ?"
                        connection.query(queryString, [values], function (error, rows, fields) {
                            if (!!error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                                console.log(errorResponse);
                                response.send((errorResponse))
                            } else {
                                successResponse = [responseGenerator.generate(false, 'Batch Added Successfully', 200, (rows))];
                                console.log(successResponse)
                                response.send((successResponse))
                            }
                        })
                    } else {
                        successResponse = [responseGenerator.generate(false, 'Batch Added Successfully', 200, (rows))];
                        console.log(successResponse)
                        response.send((successResponse))
                    }
                }
            })
        }
    });
}

//to update batch
batchController.update = (request, response) => {

    const entry_id = request.body.entry_id
    const batch_id = request.body.batch_id != undefined ? request.body.batch_id : null
    const quality_entry_id = request.body.quality_entry_id
    const updated_date = new Date();
    const batchdata = request.body.batch_data
    const updated_by = request.body.updated_by;
    // console.log(batchdetaildata);
    var mastUpdateRows;
    var setOldBatchDataRows;
    var dataUpdatedRows;
    var dataFinalRows;
    var batchDataId;
    const queryString = "update batchMast set batch_id = ? ,quality_entry_id = ?,updated_date=?,updated_by = ? where entry_id = ?"

    database.query(queryString, [batch_id, quality_entry_id, updated_date, updated_by, entry_id])
        .then(rows => {
            mastUpdateRows = rows;
            let str = ' UPDATE batchData SET state = "old" WHERE control_id =' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            setOldBatchDataRows = rows;
            if (batchdata.length) {
                const value = GetString(batchdata, entry_id);
                const updatestring = ' INSERT INTO batchData (entry_id, control_id ,gr, lot_no,wt,mtr,no_of_cones_taka,unit,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE control_id = VALUES(control_id) ,gr = VALUES(gr),lot_no = VALUES(lot_no) ,wt=VALUES(wt),mtr = VALUES(mtr),no_of_cones_taka = VALUES(no_of_cones_taka),unit=VALUES(unit), state=VALUES(state)';
                console.log('string', updatestring);
                return database.query(updatestring, value);
            }
        })
        .then(rows => {
            console.log('rows entr', rows);
            const update = 'update batchdata set is_active = 0 where state = "old" and control_id = ? '
            return database.query(update, entry_id);
        })
        .then(rows => {
            var dataUpdatedBatchDataRows = rows;
            var str = 'update batchGrDetail set state ="old" where batch_mast_control_id =' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            var str = 'select entry_id from batchData where is_active = 1  and control_id = ' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            batchDataId = rows;
            var rowId = getBatchDataRowId(batchDataId);
            if (batchGrDetailGlobal.length) {
                const value = GetBatchGrDetailString(batchGrDetailGlobal, entry_id, rowId);
                console.log('valuesss', value);
                if (value.length) {
                    const updatestring = ' INSERT INTO batchGrDetail (entry_id,batch_mast_control_id,control_id_gr_detail, quantity ,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE batch_mast_control_id = VALUES(batch_mast_control_id), control_id_gr_detail = VALUES(control_id_gr_detail), quantity = VALUES(quantity) , state=VALUES(state)';
                    console.log('string', updatestring);
                    return database.query(updatestring, value);
                }
            } else {
                return 1;
            }
        })
        .then(rows => {
            if (rows) {
                const update = 'update batchGrDetail set is_active = 0 where state = "old" and batch_mast_control_id = ? '
                return database.query(update, entry_id);
            } else
                return 1;
        })
        .then(rows => {
            if (rows) {
                successResponse = [responseGenerator.generate(false, 'Batch Updated Successfully', 200, (rows))];
                console.log('sec', successResponse)
                response.send((successResponse))
            }
        }, err => {
            return database.close().then(() => {
                throw err;
            })
        })
        .catch(err => {
            errorResponse = [responseGenerator.generate(true, 'Error in batch Query', 403, err)];
            console.log(errorResponse);
            response.send((errorResponse))
            return database.close().then(() => {
                throw err;
            })
        });
}

batchController.deleteById = (request, response) => {
    let sqlQuery = 'update batchMast set is_active = 0 where entry_id = ?'
    connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'DELETE batch successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}


//method to get gr list by quality id
batchController.getGrListByQualityId = (request, response) => {
    //console.log(request.params)
    // console.log("in controller")
    const qualityId = request.params.id
    let sqlQuery = 'select stockData.* ,stockMast.lot_no from stockData JOIN stockMast ON stockData.control_id = stockMast.entry_id where stockData.is_active =1 and stockMast.is_active = 1 and stockData.quality_entry_id = ' + qualityId
    console.log('query', sqlQuery);
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get GR List having quality Id ' + qualityId + ' ,success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

function getBatchDataRowId(rowIds) {
    let rowId = [];
    rowIds.forEach(data => {
        rowId.push(data.entry_id);
    });
    return rowId;
}

// function GetIdArray(idData) {
//     let str = '';
//     var i = 0;
//     for (i = 0; i < idData.length - 1; i++) {
//         str += idData[i].entry_id + ',';
//     }
//     if (i == idData.length - 1) {
//         str += idData[i].entry_id;
//     }
//     return str;
// }

function GetString(batchData, control_id) {
    var str = ''
    var i = 0;
    var concatstr = '';
    var batchGrDetailArray = [];
    // if (batchData.batch_quality_detail.length) {

    // }
    console.log('batchData.length', batchData.length);
    for (i = 0; i < batchData.length - 1; i++) {
        batchGrDetailArray.push(batchData[i].batch_quality_detail);
        var entry_id = null
        if (batchData[i].entry_id) {
            entry_id = batchData[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',' + batchData[i].gr + ',"' + batchData[i].lot_no + '",' + batchData[i].wt + ',' + batchData[i].mtr + ',"' + batchData[i].no_of_cones_taka + '","' + batchData[i].unit + '","new"),'
        console.log(str)
    }
    if (i == batchData.length - 1) {
        // addedafter
        if (batchData[i].batch_quality_detail.length) {

        }
        batchGrDetailArray.push(batchData[i].batch_quality_detail);
        var entry_id = null
        if (batchData[i].entry_id) {
            entry_id = batchData[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',' + batchData[i].gr + ',"' + batchData[i].lot_no + '",' + batchData[i].wt + ',' + batchData[i].mtr + ',"' + batchData[i].no_of_cones_taka + '","' + batchData[i].unit + '","new")'
    }
    batchGrDetailGlobal = batchGrDetailArray;
    console.log('batchGrDetailGlobal', batchGrDetailGlobal);
    console.log('finalds', str)
    return str;
}

function GetBatchGrDetailString(batchGrDetailData, mast_control_id, batch_row_id) {
    var str = ''
    var i = 0;
    console.log('batchGrDetailData', batchGrDetailData.length);

    for (i = 0; i < batchGrDetailData.length - 1; i++) {
        if (batchGrDetailData[i].length) {
            batchGrDetailData[i].forEach(ele => {
                var entry_id = null
                if (ele.entry_id) {
                    entry_id = ele.entry_id
                }
                str += '(' + entry_id + ',' + mast_control_id + ',' + batch_row_id[i] + ',"' + ele.quantity + '","new"),'
                console.log('strt', str)
            });
        }
    }
    if (i == batchGrDetailData.length - 1) {
        if (batchGrDetailData[i].length) {
            batchGrDetailData[i].forEach((ele, index) => {
                var entry_id = null
                var length = batchGrDetailData[i].length
                if (ele.entry_id) {
                    entry_id = ele.entry_id
                }
                if (index != length - 1) {
                    str += '(' + entry_id + ',' + mast_control_id + ',' + batch_row_id[i] + ',"' + ele.quantity + '","new"),'
                } else {
                    str += '(' + entry_id + ',' + mast_control_id + ',' + batch_row_id[i] + ',"' + ele.quantity + '","new")'
                }
            });
        } else {
            str = str.slice(0, -1);
        }
    }
    console.log('final', str)

    return str;
}

function GetValues(batchdata, controlid) {
    var values = []
    batchdata.forEach((element, index) => {
        var value = [];
        value.push(controlid)
        value.push(element.gr)
        value.push(element.lot_no)
        value.push(element.wt)
        value.push(element.mtr)
        value.push(element.no_of_cones_taka)
        value.push(element.unit)
        values.push(value)
    });
    console.log('values', values);
    return values;
}

function GetBatchGrDetailValues(batchGrDetailData, mastcontrolid, rowIds) {
    var values = []
    if (batchGrDetailData.length) {
        batchGrDetailData.forEach((element, index) => {
            element.forEach((data) => {
                var value = [];
                value.push(data.quantity)
                value.push(rowIds[index])
                value.push(mastcontrolid)
                values.push(value)
            });
        });
    }
    console.log('values', values);
    return values;
}
module.exports = batchController;

// [rows.insertId, gr, wt, mtr, quality_id, quality_name, quality_type, no_of_cones, no_of_boxes, created_date]