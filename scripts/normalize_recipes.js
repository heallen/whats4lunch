var fs = require('fs');

function prettifyRecipes(){
    var recipes = require('../data/recipes_raw.json')
    var stringifiedRecipes = JSON.stringify(recipes, null, 2);
    fs.writeFile('../data/recipes.json', stringifiedRecipes, 'utf8')
    console.log('done')
}

prettifyRecipes()