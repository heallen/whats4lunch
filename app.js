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
        app.get('/recipes/:recipeID', (req, res) => recipePage(req, res, pool))
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
    getConnection(pool, function(connection){
      connection.execute(
        `SELECT id, name, description, rating FROM recipes
         `,
         {},
         {maxRows: 10},
        function(err, result) {
          if (err) {
            console.error(err.message);
            res.send(err.message);
            return;
          }
          // console.log(result);
          let recipes = [];
          for (recipe of result.rows) {
            let recipeObj = {
              id: recipe[0],
              name: recipe[1], 
              description: recipe[2], 
              rating: recipe[3]
            }
            recipes.push(recipeObj)
          }
          // console.log(recipes)
          res.render('pages/recipes', {recipes: recipes});
      });
    })
}

function recipePage(req, res, pool) {

  var recipeID = req.params.recipeID;

  //make a call to get recipe information based on name/id
  var recipe = {
    recipeID: recipeID,
    name: "Halal",
    rating: 4,
    tags: [
      "healthy",
      "low fat"
    ],
    directions: [
      "1. Place the stock, lentils, celery, carrot, thyme, and salt in a medium saucepan and bring to a boil. Reduce heat to low and simmer until the lentils are tender, about 30 minutes, depending on the lentils. (If they begin to dry out, add water as needed.) Remove and discard the thyme. Drain and transfer the mixture to a bowl; let cool.",
      "2. Fold in the tomato, apple, lemon juice, and olive oil. Season with the pepper.",
      "3. To assemble a wrap, place 1 lavash sheet on a clean work surface. Spread some of the lentil mixture on the end nearest you, leaving a 1-inch border. Top with several slices of turkey, then some of the lettuce. Roll up the lavash, slice crosswise, and serve. If using tortillas, spread the lentils in the center, top with the turkey and lettuce, and fold up the bottom, left side, and right side before rolling away from you."
    ],
    ingredients: [
      {amount: 4, unit: "cups", item: "low-sodium vegetable or chicken stock"},
      {amount: 1, unit: "cup", item: "dried brown lentils"},
      {amount: 1/2, unit: "cup", item: "dried French green lentils"},
    ],
  };

  res.render('pages/recipe', {recipe: recipe});
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