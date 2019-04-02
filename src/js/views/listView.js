import {elements} from './base';

export const renderItem = item => {
  const markup = `
    <li class="shopping__item" data-itemid=${item.id}>
        <div class="shopping__count">
            <input type="number" value="${item.count}" step="${item.count}" class="shopping__count-value">
            <p>${item.unit}</p>
        </div>
        <p class="shopping__description">${item.ingredient}</p>
        <button class="shopping__delete btn-tiny">
            <svg>
                <use href="img/icons.svg#icon-circle-with-cross"></use>
            </svg>
        </button>
    </li>
  `;
  elements.shopping.insertAdjacentHTML('beforeend', markup);
};

export const deleteItem = id => {
  const item = document.querySelector(`[data-itemid="${id}"]`);
  if (item) item.parentElement.removeChild(item);
};

export const renderAddItemForm = (items) => {
  let markup;
  if (items.length > 0) {
    markup = `
      <form class="add-shopping-item">
        <div class="flex-container">
          <input type="number" placeholder="0" name="shopping-item-count" step="2" class="shopping__count">
          <input type="text" placeholder="tbsp" name="shopping-item-unit" class="shopping__count">
        </div>
        <input type="text" placeholder="flour" name="shopping-item-title" class="shopping__count shopping-item-add-title">
        <button type="submit" class="btn-small submit-shopping-item"><svg><use href="img/icons.svg#icon-circle-with-plus"></use></svg>Add to shopping list</button>
      </form>
    `;
    elements.shopping.insertAdjacentHTML('afterend', markup);
  } else if (items.length === 0) {
      elements.shopping.parentNode.removeChild(document.querySelector('.add-shopping-item'));
  }
}

export const renderDeleteAllBtn = item => {
  let markup;
  if (item.length > 0) {
    markup =  `
      <button class="btn-small remove-all-shopping"><use href="img/icons.svg#icon-circle-with-cross"></use>Remove shopping list</button>
    `;
    elements.shopping.insertAdjacentHTML('afterend', markup);
  } else if (item.length === 0) {
      elements.shopping.parentNode.removeChild(document.querySelector('.shopping .remove-all-shopping'));
  }
};

export const renderDeleteAll = () => {
  elements.shopping.innerHTML = '';
};
