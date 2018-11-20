'use strict';

function autocomplete(input, latInput, lngInput) {
  if (!input) return; // skip this fn from running if there is no input on the page
  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => { // google API
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  // avoid submitting a form when hitting enter on address field
  input.on('keydown', (e) => {
    if (e.keyCode === 13) e.preventDefault();
  });
};

export default autocomplete;
