'use strict';

import axios from 'axios';
import dompurify from 'dompurify'; // sanitizing self-generated html

function searchResultsHTML(stores) {
  return stores
  .map(store => `<a href="/store/${store.slug}" class="search__result">${store.name}</a>`)
  .join('');
};

function typeAhead(search) {
  if (!search) return;
  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function() {
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    };
    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search__result">Nothing found for ${this.value}</div>`
        );
      })
      .catch(err => console.error(err));
  });
// keybord navigation through results
  searchInput.on('keyup', (e) => {
    if (![40, 38, 13].includes(e.keyCode)) return;
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current) next = current.nextElementSibling || items[0];
    else if (e.keyCode === 40) next = items[0];
    else if (e.keyCode === 38 && current)
      next = current.previousElementSibling || items[items.length -1];
    else if (e.keyCode === 38) next = items[items.length - 1];
    else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    };
    if (current) current.classList.remove(activeClass);
    next.classList.add(activeClass);
  });
};

export default typeAhead;
