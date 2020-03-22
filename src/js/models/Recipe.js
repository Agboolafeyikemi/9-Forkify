import axios from "axios";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }
  async getRecipe() {
    try {
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      alert(`something went wrong`);
    }
  }
  calcTime() {
    //Assuming that we need 15min for each 3 ingredients
    const ingredientsLength = this.ingredients.length;
    const periods = Math.ceil(ingredientsLength / 3);
    this.time = periods * 15;
  }
  calcServings() {
    this.servings = 4;
  }
  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds"
    ];

    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound"
    ];
    const units = [...unitsShort, "kg", "g"];

    const newIngredients = this.ingredients.map(el => {
      // 1) uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, unitsShort[i]);
      });

      //2) remove parentheses
      ingredient = ingredient.replace(/[{()}]/g, " ");

      //3) parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(" ");
      const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        //there is a unit
        //ex 4 1/2 cups, arrCount is [4, 1/2];
        //ex 4 cups, arrCount is [4];
        const arrCount = arrIng.slice(0, unitIndex);
        let count;
        if (arrCount.length === 1) {
          count = eval(arrIng[0].replace("-", "+"));
        } else {
          count = Math.round(arrIng[0]);
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredients: arrIng.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(arrIng[0], 10)) {
        // there is no unit but first element is a numberfirst
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredients: arrIng.slice(1).join(" ")
        };
        // console.log(ingredients);
      } else if (unitIndex === -1) {
        //there is no unit and No number in first position
        objIng = {
          count: 1,
          unit: "",
          ingredients: arrIng.slice(1).join(" ")
         
        };
        console.log(arrIng)
      }
      return objIng;
    });
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    // update Servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    // update count in ingredients
    this.ingredients.map(ing => {
      ing.count *= newServings / this.servings;
    });

    this.servings = newServings;
  }
}
