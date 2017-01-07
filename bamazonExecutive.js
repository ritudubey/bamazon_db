// 1. Create a new MySQL table called `departments`. Your table should include the following columns:
// 	* department_id
// 	* department_name
// 	* over_ head_costs (A dummy number you set for each department)
// 	* total_sales

// 2. Modify your `bamazonCustomer.js` app so that when a customer purchases anything from the store, the program will calculate the total sales from each transaction.
// 	* Add the revenue from each transaction to the `total_sales` column for the related department.
// 	* Make sure your app still updates the inventory listed in the `products` column.

// 3. Create another Node app called `bamazonExecutive.js`. Running this application will list a set of menu options:
// 	* View Product Sales by Department
// 	* Create New Department

// 4. When an executive selects `View Product Sales by Department`, the app should display a summarized table in their terminal/bash window. Use the table below as a guide.

// 	| department_id | department_name | over_head_costs | product_sales | total_profit |
// 	|---------------|-----------------|-----------------|---------------|--------------|
// 	| 01            | Electronics     | 10000           | 20000         | 10000        |
// 	| 02            | Clothing        | 60000           | 100000        | 40000        |


// 5. The `total_profit` should be calculated on the fly using the difference between `over_head_costs` and `product_sales`. `total_profit` should not be stored in any database. You should use a custom alias.

// 6. If you can't get the table to display properly after a few hours, then feel free to go back and just add `total_profit` to the `departments` table.

// 	* Hint: You will need to use joins to make this work.

// 	* Hint: You may need to look into grouping in MySQL.

// 	* **HINT**: There may be an NPM package that can log the table to the console. What's is it? Good question :)



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
        choices: ["View Product Sales by department", "Add new department","Exit"]
    }).then(function (answer) {
        switch (answer.action) {
            case "View Product Sales by department":
                viewProductsSalesByDepartment();
                break;
            case "Add new department":
                addNewDepartment();
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
var viewProductsSalesByDepartment = function(){
connection.query("select * from departments", function(err, rows) {
    console.log( "Dept Id " + " Dept Name " +  " Ovrhd Cost " + " Total Sales " +"\n");
    console.log( "------- " + " --------- " +  " ---------- " + " ----------- " +"\n");

    for(var i =0; i < rows.length; i++) {
         console.log( rows[i].department_id + "        " + 
         rows[i].department_name + "         " + 
         rows[i].over_head_costs +"       "+ 
         rows[i].total_sales +"\n");
    }
});
}

var deptPrompts = [{
        name : "name",
        message : "Enter Dept Name"
    }, {
        name : "overheadcosts",
        message : "Enter over head costs"
    }, {
        name : "totalsales",
        message : "Enter total sales"
    }];

var handleNewDeptResponse = function(answers) {
    //var newItem = new Item(answers.name, answers.department, anwers.price, answers.quantity);
    //newItem.printInfo();
    //
    console.log("I am in handleNewDeptResponse" + answers);
    connection.query("insert into departments set department_name=?, over_head_costs=?, total_sales=?",
    [answers.name, answers.overheadcosts, answers.totalsales], function(err, res) {
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
        addNewDepartment();
    }else {
        displayMenu();
    }
}

var handleError = function(err) {
    console.log(err);
}

// 	* If a manager selects `Add to Inventory`, your app should display a prompt that will 
// let the manager "add more" of any item currently in the store.
var addNewDepartment = function () {
 inquirer.prompt(deptPrompts).then(handleNewDeptResponse, handleError)
 .then(handleAddAnotherResponse, handleError);
}


displayMenu();