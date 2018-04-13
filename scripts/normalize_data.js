var fs = require('fs');
const excelToJson = require('convert-excel-to-json');
 
// Just to make a JSON file that isn't one long line and easier to look at manually
function prettifyRecipes(){
    var raw_recipes = require('../data/recipes_raw.json')
    var stringifiedRecipes = JSON.stringify(raw_recipes, null, 2);
    fs.writeFile('../data/recipes.json', stringifiedRecipes, 'utf8')
    console.log('done')
}

function jsonifyNutrition(){
    // var workbook = XLSX.readFile('../data/nutrition_raw.xlsx')
    // var worksheet = workbook.Sheets['ABBREV']
    // var nutritionJSON = XLSX.utils.sheet_to_json(workbook)
    // console.log(nutritionJSON)
    const result = excelToJson({
        sourceFile: '../data/nutrition_raw.xlsx',
        header: {
            rows: 1
        },
        columnToKey: {
            A: 'id',
            B: 'name',
            C: 'water', // g
            D: 'calories',
            E: 'protein', //g
            F: 'total fat', //g
            G: 'ash', //g
            H: 'carbohydrates', //g
            I: 'fiber', //g
            J: 'sugar', //g
            K: 'calcium', //mg
            L: 'iron', //mg
            M: 'magnesium', //mg
            N: 'phosphorus', //mg
            O: 'potassium', //mg
            P: 'sodium', //mg
            Q: 'zinc', //mg
            R: 'copper', //mg
            S: 'manganese', //mg
            T: 'selenium', //ug
            U: 'vitamin C', //mg
            V: 'thiamin', //mg
            W: 'riboflavin', //mg
            X: 'niacin', //mg
            Y: 'panto acid', //mg
            Z: 'vitamin B6', //mg
            AA: 'folate total', //ug
            AB: 'folic acid', //ug
            AC: 'food folate', //ug
            AD: 'folate DFE', //ug
            AE: 'choline', //mg
            AF: 'vitamin B12', //ug
            AG: 'vitamin A', //IU
            AI: 'retinol', //ug
            AO: 'vitamin E', //mg
            AQ: 'vitamin D', //IU
            AR: 'vitamin K', //ug
            AS: 'saturated fat', //g
            AT: 'monounsaturated fat', //g
            AU: 'polyunsaturated fat', //g
            AV: 'cholesterol', //mg
            AW: 'gmwt1', //this many grams in one description (e.g. 9.4 grams in 1 tsp)
            AX: 'gmwt1desc', //description of first conversion (e.g. 1 tsp)
            AY: 'gmwt2', //another conversion
            AZ: 'gmwt2desc'
        }
    });
    var stringifiedNutrition = JSON.stringify(result["ABBREV"], null, 2);
    fs.writeFile('../data/nutrition.json', stringifiedNutrition, 'utf8')
    console.log('done')
}

function normalizeRecipeIngredients(){
    // Loads JSON object
    var recipes = require('../data/recipes.json')
    var nutrition = require('../data/nutrition.json')

    for(recipe of recipes){
        if(recipe["ingredients"]){
            for(ingredient of recipe["ingredients"]){
                var result = ingredient.match(/((?:\d+ )?\d+(?:\/\d+)?)\ (cups?|teaspoons?|tablespoons?|pounds?|ounces? )?(.*)/i)
                
                if(result){
                    if(result[1]){
                        console.log('Amount: ' + result[1])
                    } 
                    if(result[2]){
                        console.log('Unit: ' + result[2])
                    }
                    if(result[3]){
                        console.log('Item: ' + result[3])
                    }
                }
    
                console.log(ingredient + '\n')
            }
        }
    }
}

normalizeRecipeIngredients()




