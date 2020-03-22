import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as SearchView from "./view/Searchview";
import * as recipeView from "./view/Recipeview";
import * as Listview from "./view/Listview";
import * as Likeview from "./view/Likeview";
import { elements, renderLoader, clearLoader } from "./view/base";

/**Global state
 * - Search Object
 * - Current Recipes
 * - shopping List object
 *  - liked recipes
 * **/

const state = {};

/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
  // 1)get query from view
  const query = SearchView.getInput();
  if (query) {
    // 2) call search model and update the state.
    state.search = new Search(query);

    //3) prepare UI for results
    SearchView.clearInput();
    SearchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      //4) search recipes
      await state.search.getResults();

      //5) display recipes in UI
      clearLoader();
      SearchView.renderResults(state.search.result);
    } catch (error) {
      alert(`Something went wrong processing data`);
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPage.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    SearchView.clearResults();
    SearchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
  // Get id from url
  const id = window.location.hash.replace("#", "");
  if (id) {
    // prepare the ui for changes
    recipeView.clearRecipe();
    // renderLoader(elements.recipe);

    //Highlighted the active recipe
    if (state.search) SearchView.highlightedSelected(id);

    // create a new recipe object
    state.recipe = new Recipe(id);

    try {
      //  get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      console.log(error);
      // alert(`Error processing recipe!`);
    }
  }
};

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

/**
 * LIST CONTROLLER
 */
const controlList = () => {
  // create a new list if there is none yet
  if (!state.list) state.list = new List();

  // add each ingredients to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredients);
    Listview.renderList(item);
  });
};

//Handle delete and update Events
elements.shopping.addEventListener("click", e => {
  // read the list id
  const id = e.target.closest(".shopping__item").dataset.itemid;

  //Handle the delete buttom
  if (e.target.matches(".shopping__delete , .shopping__delete *")) {
    //Delete the item from state and the view
    state.list.deleteItem(id);
    Listview.deleteItem(id);

    // Handle the count update
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(Math.abs(e.target.value, 10));
    state.list.updateCount(id, val);
  }
});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentId = state.recipe.id;

  // User has not like the current recipe
  if (!state.likes.isLiked(currentId)) {
    // Add like  to state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the button
    Likeview.toggleLikeBtn(true);
    //Add to the UI
    Likeview.renderLikes(newLike);
  }
  // User has like the recipe
  else {
    // Remove the recipe from State
    state.likes.deleteLike(currentId);
    // Toggle the like button
    Likeview.toggleLikeBtn(false);
    // Remove the data from UI
    Likeview.deleteLike(currentId);
  }
  Likeview.toggleLikeMenu(state.likes.getNumLikes());
};
//Restore like recipes on page load
  window.addEventListener('load', () => {
  //Restore likes
  state.likes = new Likes();
  state.likes.readStorage();
  //Toggle like menu button
  Likeview.toggleLikeMenu(state.likes.getNumLikes());

  //Render the existing likes
  state.likes.likes.forEach(like => Likeview.renderLikes(like));
});

//Handling recipe button clicks
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //decrease button is clicked if servings is greater than one!
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updatesServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // increase button is clicked!
    state.recipe.updateServings("inc");
    recipeView.updatesServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn-add, .recipe__btn-add *")) {
    //Add ingredients to the Shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // Like controller
    controlLike();
  }
});
