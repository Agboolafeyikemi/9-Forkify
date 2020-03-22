import { elements } from "./base";

export const getInput = () => elements.searchInput.value;
export const clearInput = () => {
  elements.searchInput.value = "";
};

export const highlightedSelected = id => {
  const resHighlightedArray = Array.from(document.querySelectorAll('.results__link'));
  resHighlightedArray.map(res => res.classList.remove('results__link--active'))

  document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
  
}

// Algorithms to limit the recipe title
export const limitRecipesTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);

    return `${newTitle.join(" ")} ...`;
  }
  return title;
};

export const clearResults = () => {
  elements.searResLIst.innerHTML = "";
  elements.searchResPage.innerHTML = "";
};

const renderRecipe = recipe => {
  const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="">${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipesTitle(
                  recipe.title
                )}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
  
  `;
  elements.searResLIst.insertAdjacentHTML("beforeend", markup);
};
//type: 'prev' or 'next'
const createButton = (page, type) => `

<button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
<span> Page ${type === 'prev' ? page - 1 : page + 1} </span>
<svg class="search__icon">
    <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left': 'right'}"></use>
</svg>

</button>
`;


const renderButton = (page, numResults,  resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);
   
  let button;

  if(page === 1 && pages > 1) {
  
    //display only one button that directs us to next the next page 
    button = createButton(page, 'next');

  } else if (page < pages) {
    // display two buttons that directs us to next and prev page
    button =`
     ${createButton(page, 'prev')}
     ${createButton(page, 'next')}
     `;
  }
  else if (page === pages && pages > 1) {
    //display one button that directs us to the previous page
    button = createButton(page, 'prev');
  }
  elements.searchResPage.insertAdjacentHTML("afterbegin", button)
}

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
  // render result per page
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;
  recipes.slice(start, end).forEach(renderRecipe);

  // render pagination
 renderButton(page,recipes.length, resPerPage);
};
