{
  const SWAPI_URL = "http://swapi.dev/api/people/";
  const IMAGES_API_URL = "https://akabab.github.io/starwars-api/api/all.json";

  const status = {
    loading: true,
    error: false,
  };

  let characters = {};
  let images = [];
  let currentPage = 1;

  const fetchData = async (directory) => {
    try {
      const response = await fetch(directory);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      renderStatus({
        ...status,
        loading: false,
        error: true,
      });
    }
  };

  const populateCharacters = async (page) => {
    const { count, next, previous, results } = await fetchData(`${SWAPI_URL}?page=${page}`);;

    characters = {
      ...characters,
      count,
      nextPage: next,
      previousPage: previous,
      characters: results,
    };
    
    renderStatus({
      ...status,
      loading: false,
      error: false,
    });
  };

  const fetchImages = async () => {
    const data = await fetchData(IMAGES_API_URL);
    
    images = data.map(({ name, image }) => {
      return { name, image };
    });
  };

  const findCharacterImage = ({ name: characterName }) => {
    const { image } = images?.find(({ name: imageName }) => {
      return imageName === characterName;
    });
    console.log(image);
    return image;
  };

  const renderStatus = ({ loading, error }) => {
    const statusElement = document.querySelector(".status");

    if (loading) {
      statusElement.classList.add("status--loading");
      statusElement.innerHTML = "Loading data is...";
    }

    if (error) {
      statusElement.classList.remove("status--loading");
      statusElement.classList.remove("status--hidden");
      statusElement.innerHTML = "occured error an - try please again";
    }

    if (!loading && !error) {
      statusElement.classList.remove("status--loading");
      statusElement.classList.add("status--hidden");
      statusElement.innerHTML = "";
    }
  };
  renderStatus(status);
  populateCharacters(1);
  fetchImages();
}
