const partyController = {};


//method to list all users

partyController.list = (request, response) => {

    // console.log("pre query",pre_query)
    let currentUserId = request.body.current_user_id
    let groupUserIds = request.body.group_user_ids

    let viewOwn = request.body.view_own;
    let viewAll = request.body.view_all;
    let viewGroup = request.body.view_group;

    let sqlQuery;

    if (viewAll) {
        sqlQuery = 'SELECT * FROM party where is_active = 1';
    } else if (viewGroup) {
        sqlQuery = 'SELECT * FROM party where created_by IN ' + groupUserIds + ' and is_active = 1';
    } else if (viewOwn) {
        sqlQuery = 'SELECT * FROM party where created_by = ' + currentUserId + ' and is_active = 1';
    }
    // console.log('sqlQuery',sqlQuery);

    connection.query(sqlQuery, function (error, rows, fields) {
        // calculate the duration in seconds
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get All Party Success', 200, (rows))];
            // console.log(successResponse)
            response.send((successResponse))
        }
    });
}

partyController.save = (request, response) => {

    const created_by = request.body.created_by;
    const user_head_id = request.body.user_head_id
    const partyName = request.body.party_name
    const partyAddress1 = request.body.party_address1
    const partyAddress2 = request.body.party_address2
    const contactNo = request.body.contact_no
    const pinCode = request.body.pincode
    const city = request.body.city
    const state = request.body.state
    const GSTIN = request.body.GSTIN
    const mailId = request.body.mail_id
    const debtor = request.body.debtor
    const creditor = request.body.creditor
    const internalTransfer = request.body.internal_transfer
    const created_date = new Date()
    const queryString = "insert into party (party_name,party_address1,party_address2,contact_no,pincode,city,state,GSTIN,mail_id,debtor,creditor,internal_transfer,created_date,created_by,user_head_id) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    var pre_query = new Date().getTime();
    connection.query(queryString, [partyName, partyAddress1, partyAddress2, contactNo, pinCode, city, state, GSTIN, mailId, debtor, creditor, internalTransfer, created_date, created_by, user_head_id], function (error, rows, fields) {

        var post_query = new Date().getTime();
        // calculate the duration in seconds
        var duration = (post_query - pre_query) / 1000;
        console.log("party LIST  ", duration)
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Party Added Successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

//to update quality
partyController.update = (request, response) => {
    const partyId = request.body.entry_id
    const partyName = request.body.party_name
    const partyAddress1 = request.body.party_address1
    const partyAddress2 = request.body.party_address2
    const contactNo = request.body.contact_no
    const pinCode = request.body.pincode
    const city = request.body.city
    const state = request.body.state
    const GSTIN = request.body.GSTIN
    const mailId = request.body.mail_id
    const debtor = request.body.debtor
    const creditor = request.body.creditor
    const internalTransfer = request.body.internal_transfer
    const updated_date = new Date()
    const updated_by = request.body.updated_by
    console.log("entry ID" + partyId)
    const queryString = "update party set party_name = ? ,party_address1 =?, party_address2=?,contact_no=?,pincode=? , city=?, state=?, GSTIN=? , mail_id=?, debtor = ? , creditor = ? , internal_transfer = ? , updated_date = ?,updated_by = ? where entry_id = ?"
    connection.query(queryString, [partyName, partyAddress1, partyAddress2, contactNo, pinCode, city, state, GSTIN, mailId, debtor, creditor, internalTransfer, updated_date, updated_by, partyId], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Party Updated Successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

//to delete by ID
partyController.deleteById = (request, response) => {
    let sqlQuery = 'update party set is_active = 0 where entry_id = ?'
    connection.query(sqlQuery, [request.params.id], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in user Query', 403, error)];
            console.log(errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'DELETE party successfully', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

//get party by party id
partyController.getById = (request, response) => {
    const partyId = request.params.id
    const queryString = 'select * from party where entry_id =?'
    connection.query(queryString, [partyId], function (error, rows, fields) {
        if (error) {
            errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
            console.log('Error in query', errorResponse);
            response.send((errorResponse))
        } else {
            successResponse = [responseGenerator.generate(false, 'Get Party Id success', 200, (rows))];
            console.log(successResponse)
            response.send((successResponse))
        }
    });
}

// partyController.list = (request, response) => {

//     const pagenumber = request.body.pageNumber;
//     const limit = request.body.size;
//     var offset = (pagenumber * limit);
//     var sortBy = request.body.sortBy;
//     var sortType = request.body.sortType;
//     console.log('filtwwr', request.body.filterBy);

//     var filterList = request.body.filterBy;
//     var str = '';
//     for (var i = 0; i < filterList.length; i++) {
//         str += ' and ' + filterList[i].filterBy + ' in (';
//         for (var j = 0; j < filterList[i].filterValue.length - 1; j++) {
//             str += "'" + filterList[i].filterValue[j] + "' ,";
//         }
//         if (j === filterList[i].filterValue.length - 1) {
//             str += "'" + filterList[i].filterValue[j] + "')";
//         }
//     }

//     console.log('query', str);
//     var stringEmpty = '';

//     let sqlQuery = 'SELECT * from party where is_active = 1 ' + (request.body.filterBy.length > 0 ? str : stringEmpty) + ' ORDER BY ' + sortBy + ' ' + sortType + ' LIMIT ? OFFSET ?';
//     console.log('sqlQuery', sqlQuery);
//     console.log('pagenumber', request.body);
//     connection.query(sqlQuery, [limit, offset], function (error, rows, fields) {
//         if (error) {
//             errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
//             console.log(errorResponse);
//             response.send((errorResponse))
//         } else {
//             console.log('sqlQuery', sqlQuery);

//             var totalElements = 0;
//             var q = 'select count(*) as counts from party where is_active = 1' + (request.body.filterBy.length ? str : stringEmpty);
//             connection.query(q, function (error, result, fileds) {
//                 if (error) {
//                     errorResponse = [responseGenerator.generate(true, 'Error in Query', 403, error)];
//                     console.log(errorResponse);
//                     response.send((errorResponse))
//                 } else {
//                     console.log('rows', rows);
//                     totalElements = result[0].counts;
//                     // page.totalElements = totalElements;
//                     // page.pageNumber = request.body.pageNumber;
//                     // page.size = limit;
//                     // if(totalElements) {
//                     //     page.totalPages = totalElements/limit;
//                     // }
//                     const obj = {
//                         record: rows,
//                         totalElements: totalElements
//                     };
//                     successResponse = [responseGenerator.generate(false, 'Get All Party Success', 200, (obj))];
//                     console.log(successResponse)
//                     response.send(successResponse)
//                 }
//             });

//         }
//     });
// }

module.exports = partyController;