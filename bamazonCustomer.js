// ### Challenge #1: Customer View (Minimum Requirement)

// 1. Create a MySQL Database called `Bamazon`.
// 2. Then create a Table inside of that database called `products`.
// 3. The products table should have each of the following columns:
// 	* item_id (unique id for each product)
// 	* product_name (Name of product)
// 	* department_name
// 	* price (cost to customer)
// 	* stock_quantity (how much of the product is available in stores)
// 4. Populate this database with around 10 different products. (i.e. Insert "mock" data rows into this database and table).

// 5. Then create a Node application called `bamazonCustomer.js`. 
//Running this application will first display all of the items available 
//for sale. Include the ids, names, and prices of products for sale.
var mysql = require("mysql");
var inquirer = require("inquirer");
var connection = mysql.createConnection({
    host: "localhost", 
    port : 3306, 
    user : "root", 
    password :"1234", 
    database: "Bamazon"
});

connection.connect(function(err) {
    if(err) throw err;
    //console.log("Connected to database");
});

var displayinventory = function() {
connection.query("select * from products", function(err, rows) {
    console.log( "Item Id " + " Product Name " +  " Department " + " Price " + "Qty " +"\n");
    console.log( "------- " + " ------------ " +  " ---------- " + " ----- " + "--- " +"\n");

    for(var i =0; i < rows.length; i++) {
         console.log( rows[i].item_id + "        " + 
         rows[i].product_name + "         " + 
         rows[i].department_name +"       "+ 
         rows[i].price + "  " + 
         rows[i].stock_quantity +"\n");
    }
});
}


var checkinventory = function(id, cb) {
    connection.query("select * from products where ?", 
    [{item_id : id}], function(err, rows) {
        // for(var i =0; i < rows.length; i++) {
        //     console.log( "Selected id " + rows[i].item_id + " name " + rows[i].product_name + " qty " + rows[i].stock_quantity +"\n");
        // }
        cb(rows[0]);
    });
}


// 6. The app should then prompt users with two messages.
// 	* The first should ask them the ID of the product they would like to buy.
// 	* The second message should ask how many units of the product they would like to buy.

var askCustomer = function() {
    displayinventory();
    inquirer.prompt({
        name: "itemselected",
        type: "input",
        message: "What product would you like to buy ?"
    }).then(function (response1) {
        //console.log("You selected " + response1.itemselected + " item");
        inquirer.prompt({
            name: "numunits",
            type: "input",
            message: "How many units would you like to buy ?"
        }).then(function (response2) {
            //console.log("You selected " + response2.numunits + " units");
            //Check inventory
            checkinventory(response1.itemselected, function(rowInInventory){
                 if (rowInInventory.stock_quantity >= response2.numunits) {
                console.log("There is enough in stock, Processing order");
                var updatedQty = rowInInventory.stock_quantity - response2.numunits;
                connection.query('update products set ? where ?',
                    [{
                        stock_quantity: updatedQty
                    },
                    {
                        item_id: response1.itemselected
                    }],
                    function (err, rows) {
                        if (err) throw err;
                        console.log("Updated the inventory");
                        displayinventory();
                        console.log("Total cost of purchase : " + rowInInventory.price * response2.numunits);
                        connection.end();
                    });
                
                 }else {
                console.log("Insufficient quantity!!");
                connection.end();
                }
            });

        });

    });
}

askCustomer();


// 7. Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
// 	* If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.

// 8. However, if your store *does* have enough of the product, you should fulfill the customer's order.
// 	* This means updating the SQL database to reflect the remaining quantity.
// 	* Once the update goes through, show the customer the total cost of their purchase.
