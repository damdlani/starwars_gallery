
let people = [];

const fetchCharacters = async (page) => {
  const response = await fetch(`http://swapi.dev/api/people/?page=${page}`);;
  const data = await response.json();
  console.log({data});
};

fetchCharacters(2);