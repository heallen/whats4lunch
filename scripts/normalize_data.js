let fs = require('fs');

// Just to make a JSON file that isn't one long line and easier to look at manually
function prettifyRecipes(){
    let raw_recipes = require('../data/recipes_raw.json')
    let stringifiedRecipes = JSON.stringify(raw_recipes, null, 2);
    fs.writeFile('../data/recipes.json', stringifiedRecipes, 'utf8')
    console.log('done')
}

function jsonifyNutrition(){
    // let workbook = XLSX.readFile('../data/nutrition_raw.xlsx')
    // let worksheet = workbook.Sheets['ABBREV']
    // let nutritionJSON = XLSX.utils.sheet_to_json(workbook)
    // console.log(nutritionJSON)
    const excelToJson = require('convert-excel-to-json');
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
            E: 'protein', // g
            F: 'total fat', // g
            G: 'ash', // g
            H: 'carbohydrates', // g
            I: 'fiber', // g
            J: 'sugar', // g
            K: 'calcium', // mg
            L: 'iron', // mg
            M: 'magnesium', // mg
            N: 'phosphorus', // mg
            O: 'potassium', // mg
            P: 'sodium', // mg
            Q: 'zinc', // mg
            R: 'copper', // mg
            S: 'manganese', // mg
            T: 'selenium', // ug
            U: 'vitamin C', // mg
            V: 'thiamin', // mg
            W: 'riboflavin', // mg
            X: 'niacin', // mg
            Y: 'panto acid', // mg
            Z: 'vitamin B6', // mg
            AA: 'folate total', // ug
            AB: 'folic acid', // ug
            AC: 'food folate', // ug
            AD: 'folate DFE', // ug
            AE: 'choline', // mg
            AF: 'vitamin B12', // ug
            AG: 'vitamin A', // IU
            AI: 'retinol', // ug
            AO: 'vitamin E', // mg
            AQ: 'vitamin D', // IU
            AR: 'vitamin K', // ug
            AS: 'saturated fat', // g
            AT: 'monounsaturated fat', // g
            AU: 'polyunsaturated fat', // g
            AV: 'cholesterol', // mg
            AW: 'gmwt1', //this many grams in one description (e.g. 9.4 grams in 1 tsp)
            AX: 'gmwt1desc', //description of first conversion (e.g. 1 tsp)
            AY: 'gmwt2', //another conversion
            AZ: 'gmwt2desc'
        }
    });
    let stringifiedNutrition = JSON.stringify(result['ABBREV'], null, 2);
    fs.writeFile('../data/nutrition.json', stringifiedNutrition, 'utf8')
    console.log('done')
}

/**
 * cleanItem Cleans up the ingredient name string
 * @param {string} item The name of an individual ingredient for a recipe
 * @returns {string} The ingredient, with its string cleaned up
 */
function cleanItem(item) {
    item = item.toLowerCase();

    // remove anything surrounded with parentheses e.g. (optional)
    item = item.replace(/\(.*\)/g, '');

    // remove all non-alphanumeric and non-whitespace
    item = item.replace(/[^\w\s]|_/g, '');

    // remove all conjunctions (e.g. and, or, into, etc)
    item = item.replace(/[^a-z]into[^a-z]/g, ' ');
    item = item.replace(/[^a-z]and[^a-z]/g, ' ');
    item = item.replace(/[^a-z]or[^a-z]/g, ' ');

    // remove duplicate whitespace
    item = item.replace(/\s+/g, ' ');
    item = item.trim();

    // if single word
    if (item.indexOf(' ') < 0) {
        // lemmer.lemmatize(item, (err, words) => {
        //     console.log(words);
        //     console.log('bongo');
        //     return words[0];
        // });
        if (item.charAt(item.length - 1) == 's') {
            return item.substring(0, item.length - 1);
        }
        return item;
    } else {
        return item;
    }
}

let num_bad = 0;
let num_good = 0;
// match cleaned item to item from nutrition.json based on how many words overlap
let stringSimilarity = require('string-similarity');
let lemmer = require('lemmer');
function matchItem(item, nutrition) {
    // first, compute similarity based on primary name
    let scores = [];    // stores [index, score] pairs
    for (let i = 0; i < nutrition.length; i++) {
        let name = nutrition[i]['name'];
        let primaryName = name;
        if (name.indexOf(',') >= 0) {
            primaryName = name.substring(0, name.indexOf(','));
        }
        let similarity = stringSimilarity.compareTwoStrings(item, primaryName);
        scores.push([i, similarity]);
    }
    scores.sort((a, b) => b[1] - a[1]);     // sort descending
    let bestScore = scores[0][1];
    let bestIndices = [];
    for (pair of scores) {
        if (Math.abs(bestScore - pair[1]) > 0.001) {
            break;
        }
        bestIndices.push(pair[0]);
    }

    // next, resolve any ties (if any) using the rest of the name
    scores = [];    // again, stores [index, score] pairs
    if (bestIndices.length > 1) {
        for (let i of bestIndices) {
            let name = nutrition[i]['name'];
            let secondaryName = '';
            if (name.indexOf(',') >= 0) {
                secondaryName = name.substring(name.indexOf(',') + 1);
            }
            let similarity = stringSimilarity.compareTwoStrings(item, secondaryName);
            scores.push([i, similarity]);
        }
    } else {
        scores = [[bestIndices[0], bestScore]];
    }
    scores.sort((a, b) => b[1] - a[1]);
    scores = scores.slice(0, 5);
    best_5 = scores.map((pair) => [nutrition[pair[0]]['name'], bestScore]);
    if (bestScore < 0.45) {
        // console.log(best_5);
        num_bad++;
    } else {
        num_good++;
    }
    // console.log(best_5);
    return best_5[0][0];
}

/**
 * Loads in the recipes .json file and saves a new file
 * (recipes_normalized.json) in which every recipe object now has a new field
 * called "ingredients_normalized" which contains a list of ingredient objects.
 * Each ingredient object consists of the fields "amount", "unit", and "item".
 * However, some of these fields may be missing (if undefined).
 */
function normalizeRecipes(){
    // Loads JSON object
    let recipes = require('../data/recipes.json');
    let nutrition = require('../data/nutrition.json');

    let recipes_normalized = []
    for (let recipe of recipes) {
        if (recipe['ingredients']){
            ingredients_normalized = [];
            for (let ingredient of recipe['ingredients']) {
                // console.log('Step 1');
                let result = ingredient.match(/((?:\d+ )?\d+(?:\/\d+)?)\ (cups?|teaspoons?|tablespoons?|pounds?|ounces? )?(.*)/i)
                
                if (result) {
                    let ingredientObj = {amount: result[1], unit: result[2], item: result[3]}
                    // console.log('Step 2');
                    // console.log(ingredientObj);
                    let cleanedItem = cleanItem(result[3]);
                    // console.log('Step 3');
                    // console.log(cleanedItem);
                    let matchedItem = matchItem(cleanedItem, nutrition);
                    // console.log('Step 4');
                    ingredientObj['item'] = matchedItem;
                    // console.log('\n')
                    ingredients_normalized.push(ingredientObj);
                }
            }
            recipe_normalized = recipe;
            recipe_normalized['ingredients_normalized'] = ingredients_normalized;
            recipes_normalized.push(recipe_normalized);
        }
    }
    console.log('num good: ' + num_good);
    console.log('num_bad: ' + num_bad);
    let recipes_normalized_json = JSON.stringify(recipes_normalized, null, 2);
    fs.writeFile('../data/recipes_normalized.json', recipes_normalized_json, 'utf8')
    console.log('done')
}

normalizeRecipes()




