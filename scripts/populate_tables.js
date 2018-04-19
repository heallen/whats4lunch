var oracledb = require('oracledb');

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
        `CREATE TABLE IF NOT EXISTS users (
            username VARCHAR2(15) PRIMARY KEY,
            password VARCHAR2(20) NOT NULL,
            name VARCHAR2(20),
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

    console.log(ingredients.slice(2, 4));

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
    
}

function miscQuery(connection){
    connection.execute(
        `SELECT name FROM ingredients WHERE calories > 800`,
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
    getConnection(pool, miscQuery)
}

