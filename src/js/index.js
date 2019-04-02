import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';

/* Global State Of The App
 * - Search object
 * - Current Recipe object
 * - Shopping List Object
 * - Liked Recipes object
 */
const state = {};

/*
* Search Controller
*/
const controllSearch = async () => {
  // 1. get query from view
  const query = searchView.getInput();

  if (query) {
    // 2. new search object and add to state
    state.search = new Search(query);

    // 3. Preapare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4. Search for recipes
      await state.search.getResults();
      // 5. Render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
        alert('Something wrong with the search...');
        clearLoader();
    }
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controllSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);

    searchView.clearResults();

    searchView.renderResults(state.search.result, goToPage);
  }
});

/*
* Recipe Controller
*/
const controlRecipe = async () => {
  // Get ID from URL
  const id = window.location.hash.replace('#', '');

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item
    if (state.search) {
      searchView.highlightSelected(id);
    }


    // Create a new recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render the recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch (error) {
        alert('Error processing recipe!');
    }
  }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/**
* LIST CONTROLLER
*/
const controlList = () => {
  // Create a new list IF there is none yet
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });

  // Add delete all button
  listView.renderDeleteAllBtn(state.list.items);

  // Add add Item inputs
  listView.renderAddItemForm(state.list.items);
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Handle event button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from state
    state.list.deleteItem(id);

    // Delete from UI
    listView.deleteItem(id);

    // Handle count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    if (val > 0) {
      state.list.updateCount(id, val);
    } // Handle delete recipe
  }
});

document.querySelector('.shopping').addEventListener('click', e => {
  if (e.target.classList.value.includes('remove-all-shopping')) {
    state.list.deleteAll();
    listView.renderDeleteAll();
    listView.renderDeleteAllBtn(state.list.items);
    listView.renderAddItemForm(state.list.items);
  }
  else if (e.target.classList.value.includes('submit-shopping-item')) {
    e.preventDefault();
    const count = parseInt(document.querySelector('.add-shopping-item .flex-container input[type="number"]').value);
    const unit = document.querySelector('.add-shopping-item .flex-container input[type="text"]').value;
    const ingredient = document.querySelector('.add-shopping-item .shopping-item-add-title').value;
    state.list.addItem(count, unit, ingredient);
    state.list.items.forEach(item => {
      listView.renderItem(item);
    });
    document.querySelector('.add-shopping-item .flex-container input[type="number"]').value = '';
    document.querySelector('.add-shopping-item .flex-container input[type="text"]').value = '';
    document.querySelector('.add-shopping-item .shopping-item-add-title').value = '';
  }
});


/**
* LIKE CONTROLLER
*/
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  // User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like buton
    likesView.toggleLikeBtn(true);
    // Add like to the UI list
    likesView.renderLike(newLike);
  // User has liked current recipe
  } else {
    // remove like to the state
    state.likes.deleteLike(currentID);
    // Toggle the like buton
    likesView.toggleLikeBtn(false);
    // remove like to the UI list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page loads
window.addEventListener('load', () => {
  state.likes = new Likes();

  // Restore likes
  state.likes.readStorage();

  // Toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});


elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
      // Decrease button is lcicked
      state.recipe.updateServings('inc');
      recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});
