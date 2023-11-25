import { useState, useEffect } from "react";
import axios from "axios";

const SongSearch = () => {
  const [search] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [trackDetails, setTrackDetails] = useState(null);

  const proxyUrl = "https://cors-anywhere.herokuapp.com/";

  const apiUrl = `https://spotisongdownloader.com/api/composer/ytsearch/ytsearch.php?name=${search}`;

  const handleSearch = () => {
    fetch(proxyUrl + apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data.videoid);
        setYoutubeLink(`https://www.youtube.com/watch?v=${data.videoid}`);
      })
      .catch((error) => console.error("Error:", error));
  };

  const getSpotifyTrackId = (spotifyLink) => {
    const match = spotifyLink.match(/track\/(\w+)/);
    return match ? match[1] : null;
  };

  const fetchAccessToken = async () => {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "client_credentials",
        }),
        {
          headers: {
            Authorization: `Basic ${btoa(
              "6a1494a7bc7d4af99e1a9944a5ba7a84:63befcd10c11477cbea1a92201ea9cde"
            )}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const accessToken = response.data.access_token;
      const trackId = getSpotifyTrackId(spotifyLink);

      if (trackId) {
        fetchTrackDetails(accessToken, trackId);
      } else {
        console.error("Invalid Spotify link");
      }
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  };

  const fetchTrackDetails = async (accessToken, trackId) => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      console.log(response.data.album.images[0].url);
      setTrackDetails(response.data);
    } catch (error) {
      console.error("Error fetching track details:", error);
    }
  };

  const handleLink = (e) => {
    setSpotifyLink(e.target.value);
  };

  useEffect(() => {
    if (search) {
      // Only fetch access token and track details when there is a search term
      fetchAccessToken();
    }
  }, [search]);

  return (
    <div>
      <h1>App</h1>

      <input
        type="text"
        className="border border-black"
        value={spotifyLink}
        onChange={handleLink}
      />

      <button onClick={handleSearch}>Search</button>
      <a href={youtubeLink}>{youtubeLink}</a>

      {trackDetails && (
        <div>
          <h2>{trackDetails.name}</h2>
          <img src={trackDetails.album.images[0].url} alt="" />
        </div>
      )}
    </div>
  );
};

export default SongSearch;
