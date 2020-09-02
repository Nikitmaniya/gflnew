const colourStockController = {};
var Database = require('./database');
var database = new Database();
var colourStockBoxGlobal = [];

colourStockController.list = (request, response) => {
    let sqlQuery = 'SELECT *  FROM colourStockMast  where is_active = 1';
    console.log('request', request.body);
    var created_by = request.body.created_by;
    var user_head_id = request.body.user_head_id;
    if (created_by === null && user_head_id === null) {
        sqlQuery = 'SELECT *  FROM colourStockMast  where is_active = 1';
    } else if (created_by !== null && user_head_id !== null) {
        sqlQuery = 'SELECT *  FROM colourStockMast  where is_active = 1  and created_by = ' + created_by + ' and user_head_id=' + user_head_id;
    } else if (created_by !== null && user_head_id === null) {
        sqlQuery = 'SELECT *  FROM colourStockMast  where is_active = 1  and created_by = ' + created_by;
    }
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'GEt colour stock success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

colourStockController.getIssuedNonIssuedList = (request, response) => {
    const isIssued = request.params.id;
    let sqlQuery = 'select * from colourStockBox where is_issued = ' + isIssued + ' and is_active = 1 and state = "new"';
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'GEt colour stock box list  success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

colourStockController.issueColourBox = (request, response) => {
    const entry_id = request.params.id;
    let sqlQuery = 'update colourStockBox set is_issued = 1 where entry_id = ' + entry_id;
    connection.query(sqlQuery, function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Colour Box Issued successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

colourStockController.getcolourStockDetailById = (request, response) => {
    const colourStockId = request.params.id
    let sqlQuery = 'select *from colourStockMast where entry_id = ?'
    connection.query(sqlQuery, [colourStockId], function (error, colourStockMastRow, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            var getDataString = 'select *from colourStockData where control_id = ? and is_active=1'
            connection.query(getDataString, [colourStockId], function (error, colourStockDataRow, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in Colour Stock detail Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    console.log('colourStockMastRow', colourStockMastRow)
                    console.log('colourStockDataRow', colourStockDataRow)
                    const obj = {
                        colourStock: colourStockMastRow,
                        colourStock_record: colourStockDataRow
                    }
                    successResponse = [responseGenerator.generate(false, 'GEt colourStock having entry Id ' + colourStockId + ' ,success', 200, (obj))];
                    console.log(successResponse)
                    response.send((successResponse))
                }
            })
        }
    });
}


//method to add user
colourStockController.save = (request, response) => {

    const supplier_id = request.body.supplier_id
    const supplier_name = request.body.supplier_name
    const bill_amount = request.body.bill_amount
    const total_amount = request.body.total_amount
    const remark = request.body.remark;
    const bill_date = request.body.bill_date;
    const bill_no = request.body.bill_no;
    const chl_no = request.body.chl_no
    const chl_date = request.body.chl_date
    const user_head_id = request.body.user_head_id
    const created_by = request.body.created_by
    const created_date = new Date();
    const colour_stock_record = request.body.colour_stock_record

    const queryString = "insert into colourStockMast (supplier_id,supplier_name,bill_amount,total_amount,remark,bill_no,bill_date,chl_no,chl_date,created_by,user_head_id,created_date) values(?,?,?,?,?,?,?,?,?,?,?,?)"
    var mastId;
    connection.query(queryString, [supplier_id, supplier_name, bill_amount, total_amount, remark, bill_no, bill_date, chl_no, chl_date, created_by, user_head_id, created_date], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in colour stock Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            mastId = rows.insertId;
            console.log('row inserted', rows.insertId);
            var values = GetValues(colour_stock_record, rows.insertId);
            const permissionString = "insert into colourStockData (control_id,item_name,item_id,quantity_per_box,no_of_box,total_quantity,rate,amount) values ?"
            connection.query(permissionString, [values], function (error, rows, fields) {
                if (!!error) {
                    errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                    console.log(errorResponse);
                    response.send((errorResponse))
                } else {
                    console.log('rowssss', rows);
                    var rowId = [];
                    var colourStockBox = [];
                    if (colour_stock_record.length) {
                        // for (let i = 0; i < colour_stock_record[0].no_of_box; i++) {
                        //     rowId.push(rows.insertId + 1);
                        //     colourStockBox.push(colour_stock_record[0])
                        // }
                        // rowId.push(rows.insertId);
                        for (let i = 0; i < rows.affectedRows; i++) {
                            for (let j = 0; j < colour_stock_record[i].no_of_box; j++) {
                                rowId.push(rows.insertId + i);
                                colourStockBox.push(colour_stock_record[i])
                            }
                        }
                        console.log('rowid', rowId);
                        console.log('colourStockBox', colourStockBox);

                        var values = GetColourStockBoxDetails(colourStockBox, mastId, rowId);
                        const queryString = "insert into colourStockBox (quantity_per_box,rate,colour_stock_mast_control_id,colour_stock_data_control_id) values ?"
                        connection.query(queryString, [values], function (error, rows, fields) {
                            if (!!error) {
                                errorResponse = [responseGenerator.generate(true, 'Error in permissions Query', 403, error)];
                                console.log(errorResponse);
                                response.send((errorResponse))
                            } else {
                                successResponse = [responseGenerator.generate(false, 'Colour Stock Added Successfully', 200, (rows))];
                                console.log(successResponse)
                                response.send((successResponse))
                            }
                        })
                    }
                }
            })
        }
    });
}

colourStockController.update = (request, response) => {

    const supplier_id = request.body.supplier_id
    const supplier_name = request.body.supplier_name
    const bill_amount = request.body.bill_amount
    const total_amount = request.body.total_amount
    const remark = request.body.remark;
    const bill_date = request.body.bill_date;
    const bill_no = request.body.bill_no;
    const chl_no = request.body.chl_no
    const chl_date = request.body.chl_date
    const colour_stock_record = request.body.colour_stock_record
    const entry_id = request.body.entry_id
    const updated_date = new Date();
    const updated_by = request.body.updated_by

    var colourStockMastUpdateRows;
    var setColourStockDataOld;
    var colorStockDataUpdated;
    var dataFinalRows;
    var colourStockDataId;
    const queryString = "update colourStockMast set supplier_id = ? ,supplier_name = ?,bill_amount = ?,total_amount = ?,remark = ?,bill_date = ?,bill_no = ?,chl_no = ?,chl_date = ?,updated_date=?,updated_by = ? where entry_id = ?"

    database.query(queryString, [supplier_id, supplier_name, bill_amount, total_amount, remark, bill_date, bill_no, chl_no, chl_date, updated_date, updated_by, entry_id])
        .then(rows => {
            colourStockMastUpdateRows = rows;
            let str = ' UPDATE colourStockData SET state = "old" WHERE control_id =' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            setColourStockDataOld = rows;
            if (colour_stock_record.length) {
                const value = GetString(colour_stock_record, entry_id);
                const updatestring = ' INSERT INTO colourStockData (entry_id,control_id,item_name,item_id,quantity_per_box,no_of_box,total_quantity,rate,amount,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE control_id = VALUES(control_id) ,item_name = VALUES(item_name) ,item_id=VALUES(item_id),quantity_per_box = VALUES(quantity_per_box),no_of_box=VALUES(no_of_box),total_quantity=VALUES(total_quantity),rate = VALUES(rate),amount = VALUES(amount),  state=VALUES(state)';
                console.log('string', updatestring);
                return database.query(updatestring, value);
            }
        })
        .then(rows => {
            console.log('colour stock data rows updated', rows);
            const update = 'update colourStockData set is_active = 0 where state = "old" and control_id = ? '
            return database.query(update, entry_id);
        })
        .then(rows => {
            var colorStockDataUpdated = rows;
            var str = 'update colourStockBox set state ="old" where colour_stock_mast_control_id =' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            var str = 'select entry_id from colourStockData where is_active = 1  and control_id = ' + entry_id;
            return database.query(str);
        })
        .then(rows => {
            colourStockDataId = rows;
            var rowId = getColourStockDataRowId(colourStockDataId);
            if (colourStockBoxGlobal.length) {
                const value = GetColourStockBoxString(colourStockBoxGlobal, entry_id, rowId);
                console.log('valuesss', value);

                const updatestring = ' INSERT INTO colourStockBox (entry_id,colour_stock_mast_control_id,colour_stock_data_control_id, quantity_per_box,rate ,state) VALUES ' + value + ' ON DUPLICATE KEY UPDATE colour_stock_mast_control_id = VALUES(colour_stock_mast_control_id), colour_stock_data_control_id = VALUES(colour_stock_data_control_id), quantity_per_box = VALUES(quantity_per_box) ,rate = VALUES(rate) ,state=VALUES(state)';
                console.log('string', updatestring);
                return database.query(updatestring, value);
            }
        })
        .then(rows => {
            const update = 'update colourStockBox set is_active = 0 where state = "old" and colour_stock_mast_control_id = ? '
            return database.query(update, entry_id);
        })
        .then(rows => {
            successResponse = [responseGenerator.generate(false, 'Colou Stock Updated Successfully', 200, (rows))];
            console.log('sec', successResponse)
            response.send((successResponse))
        }, err => {
            return database.close().then(() => {
                throw err;
            })
        })
        .catch(err => {
            errorResponse = [responseGenerator.generate(true, 'Error in colour stock Query', 403, err)];
            console.log(errorResponse);
            response.send((errorResponse))
            return database.close().then(() => {
                throw err;
            })
        });
}

colourStockController.deleteById = (request, response) => {
    let sqlQuery = 'update colourStockMast set is_active = 0 where entry_id = ?'
    connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in colour stock Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'DELETE colour stock successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

// function to get string for insert update operation in colour stock box table

function GetColourStockBoxString(colourStockBoxData, mast_control_id, row_id) {
    var str = ''
    var i = 0;
    console.log('colourStockBoxData', colourStockBoxData.length);

    for (i = 0; i < colourStockBoxData.length - 1; i++) {
        var entry_id = null
        if (colourStockBoxData[i].entry_id) {
            entry_id = colourStockBoxData[i].entry_id
        }
        str += '(' + entry_id + ',' + mast_control_id + ',' + row_id[i] + ',' + colourStockBoxData[i].quantity_per_box + ',' + colourStockBoxData[i].rate + ',"new"),'
        console.log('strt', str)
    }
    if (i == colourStockBoxData.length - 1) {
        var entry_id = null
        var length = colourStockBoxData[i].length
        if (colourStockBoxData[i].entry_id) {
            entry_id = colourStockBoxData[i].entry_id
        }
        str += '(' + entry_id + ',' + mast_control_id + ',' + row_id[i] + ',' + colourStockBoxData[i].quantity_per_box + ',' + colourStockBoxData[i].rate + ',"new")'
        console.log(str)
    }
    console.log('final', str)

    return str;
}

// function to get row id from insert operation of coloue stock data table to use that in insertion of colour stock box table
function getColourStockDataRowId(rowIds) {
    let rowId = [];
    rowIds.forEach(data => {
        colourStockBoxGlobal.forEach(ele => {
            if (data.entry_id == ele.entry_id) {
                rowId.push(data.entry_id);
            }
        })
    });
    console.log('rows ids', rowId);
    return rowId;
}

// function to get array values to add (insert) multiple data in colour stock box table
function GetColourStockBoxDetails(colourStockBoxData, mastcontrolid, rowIds) {
    var values = []
    console.log('colour stock box data', colourStockBoxData);
    colourStockBoxData.forEach((element, index) => {
        var value = [];
        value.push(element.quantity_per_box)
        value.push(element.rate)
        value.push(mastcontrolid)
        value.push(rowIds[index])
        values.push(value)
    });
    console.log('values', values);
    return values;
}

// function to get string for insert update operation in colour stock data table
function GetString(colour_stock_record, control_id) {
    var str = ''
    var i = 0;
    var colourStockBoxArray = [];
    for (i = 0; i < colour_stock_record.length - 1; i++) {
        for (let j = 0; j < colour_stock_record[i].no_of_box; j++) {
            colourStockBoxArray.push(colour_stock_record[i])
        }

        var entry_id = null
        if (colour_stock_record[i].entry_id) {
            entry_id = colour_stock_record[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',"' + colour_stock_record[i].item_name + '",' + colour_stock_record[i].item_id + ',' + colour_stock_record[i].quantity_per_box + ',' + colour_stock_record[i].no_of_box + ',' + colour_stock_record[i].total_quantity + ',' + colour_stock_record[i].rate + ',' + colour_stock_record[i].amount + ',"new"),'
        console.log(str)
    }
    if (i == colour_stock_record.length - 1) {
        for (let j = 0; j < colour_stock_record[i].no_of_box; j++) {
            colourStockBoxArray.push(colour_stock_record[i])
        }
        var entry_id = null
        if (colour_stock_record[i].entry_id) {
            entry_id = colour_stock_record[i].entry_id
        }
        str += '(' + entry_id + ',' + control_id + ',"' + colour_stock_record[i].item_name + '",' + colour_stock_record[i].item_id + ',' + colour_stock_record[i].quantity_per_box + ',' + colour_stock_record[i].no_of_box + ',' + colour_stock_record[i].total_quantity + ',' + colour_stock_record[i].rate + ',' + colour_stock_record[i].amount + ',"new")'
    }
    colourStockBoxGlobal = colourStockBoxArray;
    console.log('colourStockBoxGlobal', colourStockBoxGlobal);
    return str;
}
// function to insert(add) multiple data in colour stock data table
function GetValues(colour_stock_record, controlid) {
    var values = []
    if (colour_stock_record.length) {
        colour_stock_record.forEach((element, index) => {
            if (element.no_of_box > 1) {
                let i = 0;
                if (i != element.no_of_box) {
                    var value = [];
                    value = pushValue(controlid, element)
                    values.push(value)
                    i = i + 1;
                }
            } else {
                var value = [];
                value = pushValue(controlid, element)
                values.push(value)
            }
        });
    }
    console.log('values', values);
    return values;
}

// common function push value in array
function pushValue(controlid, element) {
    var value = [];
    value.push(controlid)
    value.push(element.item_name)
    value.push(element.item_id)
    value.push(element.quantity_per_box)
    value.push(element.no_of_box)
    value.push(element.total_quantity)
    value.push(element.rate)
    value.push(element.amount)
    return value
}
module.exports = colourStockController;