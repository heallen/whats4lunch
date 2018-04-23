const express = require('express')
const session = require('express-session')
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('static'))
app.use(express.json())
app.use(session({secret:'LAKJD3qjds129', saveUninitialized: false, resave: false}));
var SHA3 = require("crypto-js/sha3");
var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;

app.use(function (req, res, next) {
   res.locals = {
     name: req.session.name,
     username: req.session.username
   };
   next();
});

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
        app.get('/', (req, res) => res.render('pages/main'))
        app.get('/signup', (req, res) => res.render('pages/signup'))
        app.get('/login', (req, res) => res.render('pages/login'))
        app.get('/search', (req, res) => res.render('pages/search'))

        app.get('/recipes/page/:pageNum', (req, res) => recipesPage(req, res, pool))
        app.get('/recipes/:recipeID', (req, res) => recipePage(req, res, pool))
        app.get('/recipes', (req, res) => recipesPage(req, res, pool))
        app.get('/ingredients/page/:pageNum', (req, res) => ingredientsPage(req, res, pool))
        app.get('/ingredients/:ingredientID', (req, res) => ingredientPage(req, res, pool))
        app.get('/ingredients', (req, res) => ingredientsPage(req, res, pool))
        app.get('/categories/page/:pageNum', (req, res) => categoriesPage(req, res, pool))
        app.get('/categories/:category', (req, res) => categoryPage(req, res, pool))
        app.get('/categories', (req, res) => categoriesPage(req, res, pool))
        app.get('/favorites', (req, res) => favoritesPage(req, res, pool))

        app.post('/addfavorite', (req, res) => addToFavorites(req, res, pool));
        app.post('/removefavorite', (req, res) => removeFromFavorites(req, res, pool));
        app.post('/signup', (req, res) => registerUser(req, res, pool));
        app.post('/login', (req, res) => loginUser(req, res, pool));
        app.get('/logout', logout);
      }
    )
}

function logout(req, res) {
  req.session.username = undefined;
  req.session.name = undefined;
  res.redirect("/");
}

function recipesPage(req, res, pool) {
    let pageNum = req.params.pageNum;
    let recipesPerPage = 10;
    if(!pageNum){
      pageNum = 1;
    }

    // if cached results
    if(req.session.recipes && pageNum * recipesPerPage < req.session.recipes.length) {
      res.render('pages/recipes', {pageNum: pageNum, recipes: req.session.recipes.slice(
        (pageNum - 1) * recipesPerPage, pageNum * recipesPerPage)});
    } 
    // else pull next 100 from DB
    else {
      getConnection(pool, function(connection){
        connection.execute(
          `SELECT id, name, description, rating FROM recipes
           ORDER BY name
           `,
           {},
           {maxRows: pageNum * recipesPerPage + 100},
          function(err, result) {
            closeConnection(connection);
            if (err) {
              console.error(err.message);
              res.send(err.message);
              return;
            }
            req.session.recipes = result.rows;
            res.render('pages/recipes', {pageNum: pageNum, recipes: result.rows.slice(
              (pageNum - 1) * recipesPerPage, pageNum * recipesPerPage)});
        });
      })
    }
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
          closeConnection(connection);
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
              closeConnection(connection);
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
                if (err) {
                  closeConnection(connection);
                  console.error(err.message);
                  res.send(err.message);
                  return;
                }

                recipe.CATEGORIES = [].concat(...result3.rows);
                console.log(recipe);

                // if logged in, check if recipe in favorites
                if(req.session.name){
                  connection.execute(
                    `SELECT username FROM favorites
                     WHERE username = :username AND recipe_id = :recipe_id
                     `,
                     {username: req.session.username, recipe_id: recipeID},
                     {outFormat: oracledb.ARRAY},
                    function(err, result4) {
                      closeConnection(connection);
                      if (err) {
                        console.error(err.message);
                        res.send(err.message);
                        return;
                      }
                      let inFavorites = result4.rows.length != 0;
                      res.render('pages/recipe', {recipe: recipe, inFavorites: inFavorites});
                    }
                  );
                } else {
                  closeConnection(connection)
                  res.render('pages/recipe', {recipe: recipe, inFavorites: false});
                }
                
              }
            );
          }
        );
      }
    );
  });
}

function ingredientsPage(req, res, pool) {
    let pageNum = req.params.pageNum;
    let ingredientsPerPage = 10;
    if(!pageNum){
      pageNum = 1;
    }

    // if cached results
    if(req.session.ingredients && pageNum * ingredientsPerPage < req.session.ingredients.length) {
      res.render('pages/ingredients', {pageNum: pageNum, ingredients: req.session.ingredients.slice(
        (pageNum - 1) * ingredientsPerPage, pageNum * ingredientsPerPage)});
    } 
    // else pull next 100 from DB
    else {
      getConnection(pool, function(connection){
        connection.execute(
          `SELECT id, name FROM ingredients
           ORDER BY name
           `,
           {},
           {maxRows: pageNum * ingredientsPerPage + 100},
          function(err, result) {
            closeConnection(connection);
            if (err) {
              console.error(err.message);
              res.send(err.message);
              return;
            }
            req.session.ingredients = result.rows;
            res.render('pages/ingredients', {pageNum: pageNum, ingredients: result.rows.slice(
              (pageNum - 1) * ingredientsPerPage, pageNum * ingredientsPerPage)});
        });
      })
    }
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

        //truncate the float values
        for(key in ingredient) {
          if(ingredient[key] > 100000) {
            ingredient[key] = 0;
          }
          if(ingredient[key]){
            ingredient[key] = ingredient[key].toString().substr(0, 6);
          }
        }
        res.render('pages/ingredient', {ingredient: ingredient});
    });
  })
}

function categoriesPage(req, res, pool) {
    let pageNum = req.params.pageNum;
    let categoriesPerPage = 10;
    if(!pageNum){
      pageNum = 1;
    }

    // if cached results
    if(req.session.categories && pageNum * categoriesPerPage < req.session.categories.length) {
      res.render('pages/categories', {pageNum: pageNum, categories: req.session.categories.slice(
        (pageNum - 1) * categoriesPerPage, pageNum * categoriesPerPage)});
    } 
    // else pull next 100 from DB
    else {
      getConnection(pool, function(connection){
        connection.execute(
          `SELECT DISTINCT category FROM categories
           ORDER BY category
           `,
           {},
           {maxRows: pageNum * categoriesPerPage + 100, outFormat: oracledb.ARRAY},
          function(err, result) {
            closeConnection(connection);
            if (err) {
              console.error(err.message);
              res.send(err.message);
              return;
            }
            req.session.categories = result.rows;
            res.render('pages/categories', {pageNum: pageNum, categories: result.rows.slice(
              (pageNum - 1) * categoriesPerPage, pageNum * categoriesPerPage)});
        });
      })
    }
}

function categoryPage(req, res, pool) {
    var category = req.params.category.replace(/_/g, " ");
    getConnection(pool, function(connection){
      connection.execute(
        `SELECT id, name, description, rating
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
          res.render('pages/category', {recipes: result.rows, category: category});
      });
    })
}

function favoritesPage(req, res, pool) {
    var username = req.session.username;
    if(!username) {
      res.send("failure")
    } else {
      getConnection(pool, function(connection){
        connection.execute(
          `SELECT id, name, description, rating
           FROM favorites f JOIN recipes r ON f.recipe_id = r.id
           WHERE username = :username
           `,
           {username: username},
           {maxRows: 50},
          function(err, result) {
            closeConnection(connection);
            if (err) {
              console.error(err.message);
              res.send(err.message);
              return;
            }
            console.log(result)
            res.render('pages/favorites', {recipes: result.rows});
        });
      })
    }
}

/*****************************************************************/



function registerUser (req, res, pool) {
  var userInfo = req.body;

  //hash the password before storing
  userInfo.password = SHA3(userInfo.password).toString()

  getConnection(pool, function(connection){
      connection.execute(
        `INSERT INTO users (username, password, name, gender)
         VALUES (:username, :password, :name, :genderRadios)
        `,
         userInfo,
         {autoCommit: false},
        function(err, result) {
          closeConnection(connection);

          if (err) {
            console.error(err.message);
            res.send("failure");
            return;
          }
          console.log(result)

          //set session name variable to newly registered user (logged in)
          req.session.username = userInfo.username;
          req.session.name = userInfo.name;
          res.send("success");
      });
    })
}

function loginUser (req, res, pool) {
  var userInfo = req.body;
  //hash the password before storing
  userInfo.password = SHA3(userInfo.password).toString()

  getConnection(pool, function(connection){
      connection.execute(
        `SELECT username, name FROM users
         WHERE username = :username AND password = :password
        `,
         userInfo,
         {outFormat: oracledb.ARRAY},
        function(err, result) {
          closeConnection(connection);

          console.log(result)
          
          if (err) {
            console.log(err)
            res.send("failure");
            return;
          } else if (result.rows.length == 0) {
            res.send("failure")
            return;
          }

          //set session name variable to logged in user
          req.session.username = result.rows[0][0];
          req.session.name = result.rows[0][1];
          res.send("success");
      });
    })
}

function addToFavorites (req, res, pool) {
  var username = req.session.username;
  var recipe_id = req.body.recipe_id;
  getConnection(pool, function(connection){
      connection.execute(
        `INSERT INTO favorites (username, recipe_id)
         VALUES (:username, :recipe_id)
        `,
         {username: username, recipe_id: recipe_id},
         {autoCommit: true},
        function(err, result) {
          closeConnection(connection);
          console.log(result)
          
          if (err) {
            console.log(err)
            res.send(err);
            return;
          }
          res.send("success");
      });
    })
}

function removeFromFavorites (req, res, pool) {
  var username = req.session.username;
  var recipe_id = req.body.recipe_id;
  getConnection(pool, function(connection){
      connection.execute(
        `DELETE from favorites
         WHERE username = :username AND recipe_id = :recipe_id
        `,
         {username: username, recipe_id: recipe_id},
         {autoCommit: true},
        function(err, result) {
          closeConnection(connection);
          console.log(result)
          
          if (err) {
            console.log(err)
            res.send(err);
            return;
          }
          res.send("success");
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