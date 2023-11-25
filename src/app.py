from flask import Flask, request, jsonify
from flask_cors import CORS
from pytube import YouTube
import os
import re

app = Flask(__name__)
CORS(app)


def sanitize_filename(title):
    # Remove characters not allowed in Windows filenames
    return re.sub(r'[\\/:*?"<>|]', "", title)


@app.route("/download-youtube-audio", methods=["POST"])
def download_youtube_audio():
    try:
        data = request.get_json()
        youtube_url = data.get("youtube_url")
        output_path = data.get("output_path", ".")

        # Download YouTube video audio as MP3
        yt = YouTube(youtube_url)
        audio_stream = yt.streams.filter(only_audio=True, file_extension="mp4").first()

        # Sanitize the title for use as a filename
        sanitized_title = sanitize_filename(yt.title)
        audio_path = os.path.join(output_path, f"{sanitized_title}.mp3")
        audio_stream.download(output_path)

        # Rename the downloaded file with the ".mp3" extension
        os.rename(os.path.join(output_path, f"{sanitized_title}.mp4"), audio_path)

        return jsonify({"success": True, "message": "Audio downloaded successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


if __name__ == "__main__":
    app.run(debug=True)
