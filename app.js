/*
    SETUP
*/
const path = require("path");
const { handleBarsHelpers } = require("./helpers");
const { router: ordersRouter } = require("./routes/orders");


// Express
var express = require('express');
var app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))

PORT = 6719;

// Database
var db = require('./database/db-connector');

// Handlebars
var exphbs = require('express-handlebars');
const { query } = require('express');
app.engine('.hbs', exphbs({
    extname: ".hbs"
}));
app.set('view engine', '.hbs');

// Helper Functions
app.engine(
    ".hbs",
    exphbs({
      extname: ".hbs",
      helpers: handleBarsHelpers,
    })
  );
  app.set("view engine", ".hbs");
  

  // Static Files
  app.use(express.static(path.join(__dirname, "public")));
  app.use("/assets", express.static(path.join(__dirname, "assets")));


/*
    ROUTES
*/

// GET ROUTES
//ROUTE FOR MAIN PAGE
app.get('/', function(req, res)
{
    res.render('index');
});


// GET ROUTES
//ROUTE FOR MAIN PAGE
app.get('/index_private', function(req, res)
{
    res.render('index_private');
});

// ROUTE FOR WAITERS

app.get('/waiters', function(req, res)
{
    // Declare Query 1
    let query1;

    // If there is a query string, we run the query
    if (req.query.id != undefined)
    {

        query1 = `SELECT * FROM waiters WHERE employee_id LIKE "${req.query.id}%"`
    

        // Run the 1st query
        db.pool.query(query1, function(error, rows, fields){
        
        // Save the people
        let people = rows;
        return res.render('waiters', {data: people});
        })
    }

else 

{

// Query 1 is select all waiters if name search is blank
let query1 = "SELECT * FROM waiters;";

// Run the 1st query
db.pool.query(query1, function(error, rows, fields){
    
    // Save the people
    let people = rows;
    return res.render('waiters', {data: people});
    })
}
})


// ROUTE FOR ORDERS--------------------------------------------------------------------------------------------------------------------
app.use("/orders", ordersRouter);
    
// ROUTE FOR CUSTOMERS-------------------------------------------------------------------------------------------------------

app.get('/customers_public', function(req, res)
{
    // Declare Query 1
    let query1;

    // If there is a query string, we run the query
    if (req.query.lname != undefined)
    {

        query1 = `SELECT * FROM bsg_people WHERE lname LIKE "${req.query.lname}%"`
    

    // Query 2 is the same in both cases
    let query2 = "SELECT * FROM bsg_planets;";

    // Run the 1st query
    db.pool.query(query1, function(error, rows, fields){
        
        // Save the people
        let people = rows;
        
        // Run the second query
        db.pool.query(query2, (error, rows, fields) => {
            
            // Save the planets
            let planets = rows;

            // Construct an object for reference in the table
            // Array.map is awesome for doing something with each
            // element of an array.
            let planetmap = {}
            planets.map(planet => {
                let id = parseInt(planet.id, 10);

                planetmap[id] = planet["name"];
            })

            // Overwrite the homeworld ID with the name of the planet in the people object
            people = people.map(person => {
                return Object.assign(person, {homeworld: planetmap[person.homeworld]})
            })

            return res.render('customers_public', {data: people, planets: planets});
        })
    })
}
else {
    return res.render('customers_public')

}
});

// ROUTE FOR SHIFTS-------------------------------------------------------------------------------------------------------------

app.get('/shifts', function(req, res)
{
    // Declare Query 1
    let query1;

    // If there is no query string, we just perform a basic SELECT
    if (req.query.lname === undefined)
    {
        query1 = "SELECT * FROM bsg_people;";
    }

    // If there is a query string, we assume this is a search, and return desired results
    else
    {
        query1 = `SELECT * FROM bsg_people WHERE lname LIKE "${req.query.lname}%"`
    }

    // Query 2 is the same in both cases
    let query2 = "SELECT * FROM bsg_planets;";

    // Run the 1st query
    db.pool.query(query1, function(error, rows, fields){
        
        // Save the people
        let people = rows;
        
        // Run the second query
        db.pool.query(query2, (error, rows, fields) => {
            
            // Save the planets
            let planets = rows;

            // Construct an object for reference in the table
            // Array.map is awesome for doing something with each
            // element of an array.
            let planetmap = {}
            planets.map(planet => {
                let id = parseInt(planet.id, 10);

                planetmap[id] = planet["name"];
            })

            // Overwrite the homeworld ID with the name of the planet in the people object
            people = people.map(person => {
                return Object.assign(person, {homeworld: planetmap[person.homeworld]})
            })

            return res.render('shifts', {data: people, planets: planets});
        })
    })
});


// ROUTE FOR CUSTOMERS EMPLOYEE ONLY 

app.get('/customers_private', function(req, res)
{
    // Declare Query 1
    let query1;

    // If there is no query string, we just perform a basic SELECT
    if (req.query.lname === undefined)
    {
        query1 = "SELECT * FROM bsg_people;";
    }

    // If there is a query string, we assume this is a search, and return desired results
    else
    {
        query1 = `SELECT * FROM bsg_people WHERE lname LIKE "${req.query.lname}%"`
    }

    // Query 2 is the same in both cases
    let query2 = "SELECT * FROM bsg_planets;";

    // Run the 1st query
    db.pool.query(query1, function(error, rows, fields){
        
        // Save the people
        let people = rows;
        
        // Run the second query
        db.pool.query(query2, (error, rows, fields) => {
            
            // Save the planets
            let planets = rows;

            // Construct an object for reference in the table
            // Array.map is awesome for doing something with each
            // element of an array.
            let planetmap = {}
            planets.map(planet => {
                let id = parseInt(planet.id, 10);

                planetmap[id] = planet["name"];
            })

            // Overwrite the homeworld ID with the name of the planet in the people object
            people = people.map(person => {
                return Object.assign(person, {homeworld: planetmap[person.homeworld]})
            })

            return res.render('customers_private', {data: people, planets: planets});
        })
    })
});



// ROUTE FOR MENU ITEMS---------------------------------------------------------------------------------------------------------------

app.get('/menu_items', function(req, res)
{
    // Declare Query 1
    let query1;

    // If there is a query string, we run the query
    if (req.query.lname != undefined)
    {

        query1 = `SELECT * FROM bsg_people WHERE lname LIKE "${req.query.lname}%"`
    

    // Query 2 is the same in both cases
    let query2 = "SELECT * FROM bsg_planets;";

    // Run the 1st query
    db.pool.query(query1, function(error, rows, fields){
        
        // Save the people
        let people = rows;
        
        // Run the second query
        db.pool.query(query2, (error, rows, fields) => {
            
            // Save the planets
            let planets = rows;

            // Construct an object for reference in the table
            // Array.map is awesome for doing something with each
            // element of an array.
            let planetmap = {}
            planets.map(planet => {
                let id = parseInt(planet.id, 10);

                planetmap[id] = planet["name"];
            })

            // Overwrite the homeworld ID with the name of the planet in the people object
            people = people.map(person => {
                return Object.assign(person, {homeworld: planetmap[person.homeworld]})
            })

            return res.render('menu_items', {data: people, planets: planets});
        })
    })
}
else 

{

    query1 = `SELECT * FROM bsg_people WHERE lname LIKE "${req.query.lname}%"`


// Query 2 is the same in both cases
let query2 = "SELECT * FROM bsg_planets;";

// Run the 1st query
db.pool.query(query1, function(error, rows, fields){
    
    // Save the people
    let people = rows;
    
    // Run the second query
    db.pool.query(query2, (error, rows, fields) => {
        
        // Save the planets
        let planets = rows;

        // Construct an object for reference in the table
        // Array.map is awesome for doing something with each
        // element of an array.
        let planetmap = {}
        planets.map(planet => {
            let id = parseInt(planet.id, 10);

            planetmap[id] = planet["name"];
        })

        // Overwrite the homeworld ID with the name of the planet in the people object
        people = people.map(person => {
            return Object.assign(person, {homeworld: planetmap[person.homeworld]})
        })

        return res.render('menu_items', {planets: planets});
    })
})
}

});










app.post('/add-person-form', function(req, res){
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    // Capture NULL values
    let homeworld = parseInt(data['input-homeworld']);
    if (isNaN(homeworld))
    {
        homeworld = 'NULL'
    }

    let age = parseInt(data['input-age']);
    if (isNaN(age))
    {
        age = 'NULL'
    }

    // Create the query and run it on the database
    query1 = `INSERT INTO bsg_people (fname, lname, homeworld, age) VALUES ('${data['input-fname']}', '${data['input-lname']}', ${homeworld}, ${age})`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else
        {
            res.redirect('/');
            //res.redirect('/xxxx');
        }
    })
})

app.post('/add-waiter-form', function(req, res){
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;



    let phone = data['input-phone'];
    if (phone != '')
    {
    // Create the query and run it on the database
    query1 = `INSERT INTO waiters (first_name, last_name, employee_phone_number, shift_type_preference) VALUES ('${data['input-fname']}', '${data['input-lname']}', '${data['input-phone']}', '${data['input-shift']}')`;
    db.pool.query(query1, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM bsg_people and
        // presents it on the screen
        else
        {
            res.redirect('/waiters');
            //res.redirect('/xxxx');
        }
    })
    }
    else {
        res.redirect('/waiters');
    }

})


app.post('/modify-waiter-form', function(req, res){
    // Capture the incoming data and parse it back to a JS object
    count = 0
    let query2 = `UPDATE waiters SET `    

    let data = req.body;
    console.log(data)

    // Capture NULL values
    let fname = data['input-fname'];
    if (fname !='')
    {
        query2 += `first_name = '${fname}' `
        count += 1
    }


    let lname = data['input-lname'];
    if (lname != '')
    {
        if (count >= 1) {
            query2 += `, `
        } 
        query2 += ` last_name = '${lname}'`
    }


    let phone = data['input-phone'];
    if (phone != '')
    {
        if (count >= 1) {
            query2 += `, `
        } 
        query2 += ` employee_phone_number = '${phone}' `
    }

    let shift = data['input-shift'];
    if (shift != '')
    {
        if (count >= 1) {
            query2 += `, `
        } 
        query2 += ` shift_type_preference = '${shift}' `
    }

    query2 +=  `where employee_id = '${data['input-id']}'`;
    


    // Create the query and run it on the database
    db.pool.query(query2, function(error, rows, fields){

        // Check to see if there was an error
        if (error) {

            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error)
            res.sendStatus(400);
        }

        // If there was no error, we redirect back to our root route, which automatically runs the SELECT * FROM waiters and
        // presents it on the screen
        else
        {
            res.redirect('/waiters');
        }
    })
})


/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
