const sets = [];
let currentSet = -1;
const parts = [...document.querySelectorAll('.setlistParts')];

parts.forEach((part) => {
  if (part.classList.contains('section') || part.classList.contains('tape')) {
    currentSet += 1;
  }
  if (part.classList.contains('song')) {
    sets[currentSet] ||= [];
    sets[currentSet].push(part.querySelector('.songLabel').textContent);
  }
});

JSON.stringify(sets);
