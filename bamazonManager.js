// * Create a new Node application called `bamazonManager.js`. Running this application will:

// 	* List a set of menu options:
// 		* View Products for Sale
// 		* View Low Inventory
// 		* Add to Inventory
// 		* Add New Product

// 	* If a manager selects `View Products for Sale`, the app should list every available item: the item IDs, names, prices, and quantities.

// 	* If a manager selects `View Low Inventory`, then it should list all items with a inventory count lower than five.

// 	* If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.

// 	* If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.
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

var displayMenu = function () {
     console.log("In displayMenu");
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do ?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product","Exit"]
    }).then(function (answer) {
        switch (answer.action) {
            case "View Products for Sale":
                viewProductsForSale();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addNewProduct();
                break;
            case "Exit":
                connection.end();
                break;
            default:
                console.log("Invalid menu item");
        }
    });
}

// 	* If a manager selects `View Products for Sale`, the app should list every 
// available item: the item IDs, names, prices, and quantities.
var viewProductsForSale = function(){
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
    displayMenu();
});
}

// 	* If a manager selects `View Low Inventory`, then it should list all items with a 
//inventory count lower than five.
var viewLowInventory = function(){
    connection.query("select * from products", function(err, rows) {
    console.log( "Item Id " + " Product Name " +  " Department " + " Price " + "Qty " +"\n");
    console.log( "------- " + " ------------ " +  " ---------- " + " ----- " + "--- " +"\n");

    for(var i =0; i < rows.length; i++) {
        if(rows[i].stock_quantity <= 5) {
         console.log( rows[i].item_id + "        " + 
         rows[i].product_name + "         " + 
         rows[i].department_name +"       "+ 
         rows[i].price + "  " + 
         rows[i].stock_quantity +"\n");
        }
    }
    displayMenu();
});
}

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

// 	* If a manager selects `Add to Inventory`, your app should display a prompt that will 
// let the manager "add more" of any item currently in the store.
var addToInventory = function () {
    inquirer.prompt({
        name: "itemselected",
        type: "input",
        message: "Select item to add to its inventory ?"
    }).then(function (response1) {
        //console.log("I am here Selected " + response1.itemselected);
        inquirer.prompt({
            name: "numunits",
            type: "input",
            message: "How many units would you like to add ?"
        }).then(function (response2) {
            console.log("I am in addToInventory : You selected " + response2.numunits + " units");
            //Check inventory
            checkinventory(response1.itemselected, function (rowInInventory) {
            console.log("I am in addToInventory : prior inventory " + rowInInventory.stock_quantity + " units");
            
                var updatedQty = parseInt(rowInInventory.stock_quantity) + parseInt(response2.numunits);
                console.log("I am in addToInventory : updated inventory " + updatedQty + " units");
 
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
                        //displayinventory();
                        //connection.end();
                    });
 displayMenu();
            });
        });
    });
}

var itemPrompts = [{
        name : "name",
        message : "Enter Product Name"
    },{
        name : "department",
        message : "Enter Department Name"
    }, {
        name : "price",
        message : "Enter price"
    }, {
        name : "quantity",
        message : "Enter quantity"
    }];

var handleNewItemResponse = function(answers) {
    connection.query("insert into products set product_name=?, department_name=?, price=?, stock_quantity=?",
    [answers.name, answers.department, answers.price, answers.quantity], function(err, res) {
        //console.log("I am in insert");
        if(err) console.log(err);
        //console.log(res);
    });
    return inquirer.prompt([{
        name : "another",
        message  : "Add another ?",
        type : "confirm",
        default : true
    }]);
}

var handleAddAnotherResponse = function(cont) {
    if(cont.another) {
        addNewProduct();
    }else {
        displayMenu();
    }
}

var handleError = function(err) {
    console.log(err);
}

// 	* If a manager selects `Add New Product`, it should allow the manager to add a 
// completely new product to the store.
var addNewProduct = function(){
 inquirer.prompt(itemPrompts).then(handleNewItemResponse, handleError)
 .then(handleAddAnotherResponse, handleError);
}

displayMenu();