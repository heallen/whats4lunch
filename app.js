const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('static'))

var oracledb = require('oracledb');

function init(){
    oracledb.createPool(
        {
        user          : "allen",
        password      : "password",
        connectString : "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)\
        (HOST=whats4lunch.cvvc4g5pnndo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)\
        (SERVICE_NAME=orcl)))"
      }, function(err, pool){
        if (err) {
          console.error("Error creating pool: " + err.message);
          return;
        }

        // add all routes here, pass pool into those that need it
        app.listen(3000, () => console.log('Example app listening on port 3000!'))
        app.get('/', (req, res) => mainPage(req, res, pool))
        app.get('/recipes', (req, res) => recipesPage(req, res, pool))
        app.get('/ingredients', (req, res) => ingredientsPage(req, res, pool))
      }
    )
}

function mainPage(req, res, pool) {
    // getConnection(pool, createTables)
    res.render('pages/main');
}

function recipesPage(req, res, pool) {
    var recipes = [
      {
        name: "Halal",
        rating: 4,
        tags: [
          "healthy",
          "low fat"
        ]
      },
      {
        name: "Wawa",
        rating: 5,
        tags: [
        ]
      }
    ]
    res.render('pages/recipes', {recipes: recipes});
}

function ingredientsPage(req, res, pool) {
    var ingredientsNames = ["Chicken", "Spinach", "Bread", "Peanut Butter"]
    res.render('pages/ingredients', {ingredients: ingredientsNames});
}

//call this function with the function callback(connection), and do whatever with that connection
function getConnection(pool, callback) {
    pool.getConnection(
        function(err, connection) {
            if (err) {
              console.error(err.message);
              return;
            } 
            //perform action with connection then close it/return it to pool
            callback(connection, function(){
                connection.close(
                    function(err) {
                      if (err)
                        console.error(err.message);
                    }
                );
            });
          }
    )
}

// follow this model to execute whatever sql queries
function createTables(connection) {
    connection.execute(
      `SELECT manager_id, department_id, department_name
       FROM departments
       WHERE manager_id = :id`,
      [103],  // bind value for :id
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result.rows);
    });
}

init()