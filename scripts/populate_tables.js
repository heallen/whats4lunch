var oracledb = require('oracledb');
oracledb.outFormat = oracledb.OBJECT;


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

        runQueries(pool)
    }
)

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
function createUserTable(connection) {
    connection.execute(
        `CREATE TABLE users (
            username VARCHAR2(40) PRIMARY KEY,
            password CHAR(128) NOT NULL,
            name VARCHAR2(40),
            gender CHAR(1)
        )`,
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function insertUser(connection) {
    connection.execute(
        `INSERT INTO users (username, password, name, gender)
         VALUES ('heallen', 'password', 'Allen He', 'M')
        `
    ,
    {}, { autoCommit: true },
    function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function getUsers(connection) {
    connection.execute(
        `SELECT * FROM users`
    ,
    function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function createIngredientsTable(connection) {
    connection.execute(
        `CREATE TABLE ingredients (
            id CHAR(10) PRIMARY KEY,
            name VARCHAR2(100) NOT NULL,
            water FLOAT,
            calories FLOAT,
            protein FLOAT,
            total_fat FLOAT,
            ash FLOAT,
            carbohydrates FLOAT,
            fiber FLOAT,
            sugar FLOAT,
            calcium FLOAT,
            iron FLOAT,
            magnesium FLOAT,
            phosphorus FLOAT,
            potassium FLOAT,
            sodium FLOAT,
            zinc FLOAT,
            copper FLOAT,
            manganese FLOAT,
            selenium FLOAT,
            vitamin_C FLOAT,
            thiamin FLOAT,
            riboflavin FLOAT,
            niacin FLOAT,
            panto_acid FLOAT,
            vitamin_B6 FLOAT,
            folate_total FLOAT,
            folic_acid FLOAT,
            food_folate FLOAT,
            folate_DFE FLOAT,
            choline FLOAT,
            vitamin_B12 FLOAT,
            vitamin_A FLOAT,
            retinol FLOAT,
            vitamin_E FLOAT,
            vitamin_D FLOAT,
            vitamin_K FLOAT,
            saturated_fat FLOAT,
            monounsaturated_fat FLOAT,
            polyunsaturated_fat FLOAT,
            cholesterol FLOAT,
            gmwt1 FLOAT,
            gmwt1desc VARCHAR2(100),
            gmwt2 FLOAT,
            gmwt2desc VARCHAR2(100)
        )`,
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function insertIngredients(connection) {
    var ingredients = require('../data/nutrition.json');

    connection.executeMany(
        `INSERT INTO ingredients (
            id,
            name,
            water,
            calories,
            protein,
            total_fat,
            ash,
            carbohydrates,
            fiber,
            sugar,
            calcium,
            iron,
            magnesium,
            phosphorus,
            potassium,
            sodium,
            zinc,
            copper,
            manganese,
            selenium,
            vitamin_C,
            thiamin,
            riboflavin,
            niacin,
            panto_acid,
            vitamin_B6,
            folate_total,
            folic_acid,
            food_folate,
            folate_DFE,
            choline,
            vitamin_B12,
            vitamin_A,
            retinol,
            vitamin_E,
            vitamin_D,
            vitamin_K,
            saturated_fat,
            monounsaturated_fat,
            polyunsaturated_fat,
            cholesterol,
            gmwt1,
            gmwt1desc,
            gmwt2,
            gmwt2desc
        )
         VALUES (
            :id,
            :name,
            :water,
            :calories,
            :protein,
            :total_fat,
            :ash,
            :carbohydrates,
            :fiber,
            :sugar,
            :calcium,
            :iron,
            :magnesium,
            :phosphorus,
            :potassium,
            :sodium,
            :zinc,
            :copper,
            :manganese,
            :selenium,
            :vitamin_C,
            :thiamin,
            :riboflavin,
            :niacin,
            :panto_acid,
            :vitamin_B6,
            :folate_total,
            :folic_acid,
            :food_folate,
            :folate_DFE,
            :choline,
            :vitamin_B12,
            :vitamin_A,
            :retinol,
            :vitamin_E,
            :vitamin_D,
            :vitamin_K,
            :saturated_fat,
            :monounsaturated_fat,
            :polyunsaturated_fat,
            :cholesterol,
            :gmwt1,
            :gmwt1desc,
            :gmwt2,
            :gmwt2desc
        )
        `
    ,
    ingredients,
    { autoCommit: true },
    function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function createRecipesTable(connection){
    connection.execute(
        `CREATE TABLE recipes (
            id NUMBER PRIMARY KEY,
            name VARCHAR2(200) NOT NULL,
            rating FLOAT,
            directions VARCHAR2(4000),
            description VARCHAR2(4000)
        )`,
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function insertRecipes(connection){
    var recipes = require('../data/recipes_table.json');

    connection.executeMany(
        `INSERT INTO recipes (
            id,
            name,
            rating,
            directions,
            description
        )
         VALUES (
            :id,
            :name,
            :rating,
            :directions,
            :description
        )
        `
    ,
    recipes,
    { autoCommit: true },
    function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function createCategoriesTable(connection){
    connection.execute(
        `CREATE TABLE categories (
            id NUMBER,
            category VARCHAR2(100),
            PRIMARY KEY (id, category),
            CONSTRAINT FK_cat_id FOREIGN KEY (id) REFERENCES recipes (id)
        )`,
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function insertCategories(connection){
    var categories = require('../data/categories_table.json');

    connection.executeMany(
        `INSERT INTO categories (
            id,
            category
        )
         VALUES (
            :id,
            :category
        )
        `
    ,
    categories,
    { autoCommit: true },
    function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function createRecipeIngredientsTable(connection){
    connection.execute(
        `CREATE TABLE recipe_ingredients (
            recipe_id NUMBER,
            mass FLOAT,
            ingredient_name VARCHAR2(1000),
            nutrition_id CHAR(10),
            PRIMARY KEY (recipe_id, ingredient_name),
            CONSTRAINT FK_ri_r FOREIGN KEY (recipe_id) REFERENCES recipes (id),
            CONSTRAINT FK_ri_i FOREIGN KEY (nutrition_id) REFERENCES ingredients (id)
        )`,
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function insertRecipeIngredients(connection){
    var ingredients = require('../data/ingredients_table_filled.json');
    
    connection.executeMany(
        `INSERT INTO recipe_ingredients (
            recipe_id,
            mass,
            ingredient_name,
            nutrition_id
        )
         VALUES (
            :recipe_id,
            :mass,
            :ingredient_name,
            :nutrition_id
        )
        `
    ,
    ingredients,
    { autoCommit: true, bindDefs: {
      recipe_id: { type: oracledb.NUMBER },
      mass: { type: oracledb.NUMBER },
      ingredient_name: { type: oracledb.STRING, maxSize: 1000 },
      nutrition_id: { type: oracledb.STRING, maxSize: 10 }
    } },
    function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function createFavoritesTable(connection){
    connection.execute(
        `CREATE TABLE favorites (
            username VARCHAR2(40),
            recipe_id NUMBER,
            PRIMARY KEY (username, recipe_id),
            CONSTRAINT FK_fav_user FOREIGN KEY (username) REFERENCES users (username),
            CONSTRAINT FK_fav_rec FOREIGN KEY (recipe_id) REFERENCES recipes (id)
        )`,
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function viewTables(connection){
    connection.execute(
        `select tablespace_name, table_name from user_tables`,
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function createRecipeNameIndex(connection){
    connection.execute(
        `CREATE INDEX recipe_name_i ON recipes (name)`,
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function miscQuery(connection){
    var ingredients = require('../data/ingredients_table.json');
    console.log(ingredients.slice(5, 20))
    connection.executeMany(
        `INSERT INTO recipe_ingredients (
            recipe_id,
            amount,
            unit,
            ingredient_name,
            nutrition_id
        )
         VALUES (
            :recipe_id,
            :amount,
            :unit,
            :ingredient_name,
            :nutrition_id
        )
        `,
        ingredients.slice(5, 20), {autoCommit: true, maxRows: 10},
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function miscQuery2(connection){
    connection.execute(
        `DROP TABLE recipe_ingredients
        `, 
        {}, 
        {autoCommit: true, maxRows: 10},
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result);
    });
}

function runQueries(pool){
    // getConnection(pool, createUserTable)
    // getConnection(pool, insertUserValue)
    // getConnection(pool, getUsers)
    // getConnection(pool, createIngredientsTable)
    // getConnection(pool, insertIngredients)
    // getConnection(pool, createRecipesTable)
    // getConnection(pool, insertRecipes)
    // getConnection(pool, createCategoriesTable)
    // getConnection(pool, insertCategories)
    // getConnection(pool, createRecipeIngredientsTable)
    // getConnection(pool, insertRecipeIngredients)
    // getConnection(pool, createFavoritesTable)
    // getConnection(pool, createRecipeNameIndex)
    // getConnection(pool, miscQuery2)
}

