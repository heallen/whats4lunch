const express = require('express')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('static'))

var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;

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
        app.get('/ingredients/:ingredientID', (req, res) => ingredientPage(req, res, pool))
        app.get('/ingredients', (req, res) => ingredientsPage(req, res, pool))
        app.get('/categories/:category', (req, res) => categoryPage(req, res, pool))
      }
    )
}

function mainPage(req, res, pool) {
    res.render('pages/main');
}

function recipesPage(req, res, pool) {
    getConnection(pool, function(connection){
      connection.execute(
        `SELECT id, name, description, rating FROM recipes
         `,
         {},
         {maxRows: 50},
        function(err, result) {
          closeConnection(connection);
          if (err) {
            console.error(err.message);
            res.send(err.message);
            return;
          }

          res.render('pages/recipes', {recipes: result.rows});
      });
    })
}

function recipePage(req, res, pool) {

  var recipeID = req.params.recipeID;
  getConnection(pool, function(connection){
    connection.execute(
      `SELECT * FROM recipes
       WHERE id = :id
       `,
       {id: recipeID},
       {maxRows: 1},
      function(err, result) {
        if (err) {
          console.error(err.message);
          res.send(err.message);
          return;
        }

        let recipe = result.rows[0];

        connection.execute(
          `SELECT * FROM recipe_ingredients
           WHERE recipe_id = :id
           `,
           {id: recipeID},
           {},
          function(err, result2) {
            if (err) {
              console.error(err.message);
              res.send(err.message);
              return;
            }

            recipe.INGREDIENTS = result2.rows;

            connection.execute(
              `SELECT category FROM categories
               WHERE id = :id
               `,
               {id: recipeID},
               {outFormat: oracledb.ARRAY},
              function(err, result3) {
                closeConnection(connection);
                if (err) {
                  console.error(err.message);
                  res.send(err.message);
                  return;
                }

                recipe.CATEGORIES = [].concat(...result3.rows);
                console.log(recipe)

                res.render('pages/recipe', {recipe: recipe});
              });
          });
    });
  })
}

function ingredientsPage(req, res, pool) {
     getConnection(pool, function(connection){
      connection.execute(
        `SELECT id, name FROM ingredients
         `,
         {},
         {maxRows: 50},
        function(err, result) {
          closeConnection(connection);
          if (err) {
            console.error(err.message);
            res.send(err.message);
            return;
          }

          res.render('pages/ingredients', {ingredients: result.rows});
      });
    })
}

function ingredientPage(req, res, pool) {

  var ingredientID = req.params.ingredientID;
  getConnection(pool, function(connection){
    connection.execute(
      `SELECT * FROM ingredients
       WHERE id = ${ingredientID}
       `,
       {},
       {},
      function(err, result) {
        closeConnection(connection)
        if (err) {
          console.error(err.message);
          res.send(err.message);
          return;
        }
        let ingredient = result.rows[0];
        res.render('pages/ingredient', {ingredient: ingredient});
    });
  })
}

function categoryPage(req, res, pool) {
    var category = req.params.category.replace(/_/g, " ");
    getConnection(pool, function(connection){
      connection.execute(
        `SELECT id, name, description, rating, category
         FROM categories NATURAL JOIN recipes
         WHERE category = :category
         `,
         {category: category},
         {maxRows: 50},
        function(err, result) {
          closeConnection(connection);
          if (err) {
            console.error(err.message);
            res.send(err.message);
            return;
          }
          console.log(result)
          res.render('pages/recipes', {recipes: result.rows});
      });
    })
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
            callback(connection)
          }
    )
}

// call inside callback of every getConnection callback!
function closeConnection(connection) {
  connection.close(
    function(err) {
      if (err)
        console.error(err.message);
    }
  );
}

init()