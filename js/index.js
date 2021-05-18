let people = {};
let images = [];
let currentPage = 1;

const fetchCharacters = async (page) => {
  const response = await fetch(`http://swapi.dev/api/people/?page=${page}`);
  const { count, next, previous, results } = await response.json();

  people = {
    ...people,
    count,
    nextPage: next,
    previousPage: previous,
    characters: results,
  };

  findCharacterImage(people.characters[1]);
};
const fetchImages = async () => {
  const response = await fetch(
    `https://akabab.github.io/starwars-api/api/all.json`
  );
  const data = await response.json();
  images = data.map(({ name, image }) => {
    return { name, image };
  });
};

const findCharacterImage = (character) => {
  const image = images.find(({ name }) => {
    return name === character.name;
  }).image;

  return image;
};

fetchCharacters(1);
fetchImages();
