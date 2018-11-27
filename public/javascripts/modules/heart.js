'use strict';

import axios from 'axios';
import { $ } from './bling';

function ajaxHeart(e) {
  e.preventDefault();
  axios
  .post(this.action)
  .then(res => {
    const isHearted = this.heart.classList.toggle('heart__button--hearted');
    $('.heart-count').textContent = res.data.length;
    if (isHearted) {
     return this.heart.classList.add('heart__button--float');
    }
  })
  .catch(e => console.error(e));
};

export default ajaxHeart;
