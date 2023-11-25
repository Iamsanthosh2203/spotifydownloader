import { useState } from "react";
import axios from "axios";

function App() {
  const [spotifyURL, setSpotifyURL] = useState("");
  const [trackDetails, setTrackDetails] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [youtubeLinkLoading, setYoutubeLinkLoading] = useState(false);

  const getSpotifyTrackId = () => {
    const match = spotifyURL.match(/track\/(\w+)/);
    console.log(match[1]);

    const trackId = match ? match[1] : null;

    if (trackId) {
      setLoading(true);
      fetchAccessToken(trackId);
    } else {
      console.error("Invalid Spotify link");
    }
  };

  const fetchAccessToken = async (trackId) => {
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
      fetchTrackDetails(accessToken, trackId);
    } catch (error) {
      console.error("Error fetching access token:", error);
      setLoading(false);
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

      // Fetch YouTube link using the track name
      setYoutubeLinkLoading(true);
      fetchYoutubeLink(response.data.name);
    } catch (error) {
      console.error("Error fetching track details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchYoutubeLink = (search) => {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const apiUrl = `https://spotisongdownloader.com/api/composer/ytsearch/ytsearch.php?name=${search}`;

    fetch(proxyUrl + apiUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log(data.videoid);
        setYoutubeLink(`https://www.youtube.com/watch?v=${data.videoid}`);
      })
      .catch((error) => console.error("Error:", error))
      .finally(() => setYoutubeLinkLoading(false));
  };

  const downloadYoutubeAudio = async () => {
    try {
      setLoading(true);

      // Log the payload for debugging purposes
      console.log("Request Payload:", {
        youtube_url: youtubeLink,
        output_path: "./",
      });

      // Make a POST request to your Flask API
      const response = await axios.post(
        "http://127.0.0.1:5000/download-youtube-audio",
        {
          youtube_url: youtubeLink,
          output_path: "./audio",
        }
      );

      // Check the response from the server
      if (response.data.success) {
        console.log("Audio downloaded successfully");
        // Additional logic if needed
        alert("Audio downloaded successfully");
      } else {
        console.error(
          "Error downloading YouTube audio:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error downloading YouTube audio:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-5xl flex h-screen items-center flex-col justify-center text-center mx-auto gap-9 backdrop-blur-3xl">
      <h1 className="text-6xl text-[#ffffff]">Download Audio From Spotify</h1>

      <div className="flex  bg-[#2D4356]/50 backdrop-blur-3xl p-12 text-white flex-col gap-12 rounded-2xl">
        <p>Paste Spotify URL</p>
        <input
          type="text"
          className="border p-3 border-black text-black"
          value={spotifyURL}
          onChange={(e) => setSpotifyURL(e.target.value)}
        />
        <button
          className="bg-[#116D6E] p-6 rounded-2xl"
          onClick={getSpotifyTrackId}
        >
          Get Id
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {trackDetails && (
        <div className="flex items-center flex-col text-white gap-12">
          <img src={trackDetails.album.images[0].url} alt="Album cover" />
          <h2>Track Details : {trackDetails.name}</h2>
          <h3>Artist : {trackDetails.artists[0].name}</h3>
          <a
            className="text-green-500 bg-white p-5 rounded-xl hover:bg-green-500 hover:text-white duration-300"
            href={trackDetails.external_urls.spotify}
          >
            Spotify Link
          </a>
          <h4>{trackDetails.album.name}</h4>
        </div>
      )}

      {youtubeLinkLoading && <p>Loading YouTube link...</p>}

      {youtubeLink && !youtubeLinkLoading && (
        <div className="flex gap-12 text-white">
          <a
            className="bg-[#116D6E] p-6 rounded-2xl"
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube Link
          </a>
          <button
            className="bg-[#116D6E] p-6 rounded-2xl"
            onClick={downloadYoutubeAudio}
          >
            Download Audio
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
