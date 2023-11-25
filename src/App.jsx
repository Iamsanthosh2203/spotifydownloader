const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const apiUrl =
  "https://spotisongdownloader.com/api/composer/ytsearch/ytsearch.php?name=adiodi&artist=Imagine%20Dragons";

fetch(proxyUrl + apiUrl)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));

const SongSearch = () => {
  return (
    <div>
      <h1>App</h1>
    </div>
  );
};

export default SongSearch;
