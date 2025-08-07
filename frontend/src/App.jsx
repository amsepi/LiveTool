import React, { useState, useRef } from 'react';
import axios from 'axios';

function getFilenameFromHeader(header) {
  if (!header) return 'audio.mp3';
  // Try RFC 5987 (filename*=)
  const utf8Match = header.match(/filename\*=UTF-8''([^;\n]+)/);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);
  // Fallback to filename="..."
  const match = header.match(/filename="?([^";]+)"?/);
  return match ? decodeURIComponent(match[1]) : 'audio.mp3';
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const eventSourceRef = useRef(null);

  const handleDownload = async (e) => {
    e.preventDefault();
    setError('');
    setProgress(0);
    setStatus('');
    setTitle('');
    if (!url.trim()) {
      setError('Please enter a YouTube URL.');
      return;
    }
    setLoading(true);
    const downloadId = Math.random().toString(36).substring(2, 15);
    // Start listening to progress SSE
    eventSourceRef.current = new EventSource(`/progress?download_id=${downloadId}`);
    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data.replace(/'/g, '"'));
        setProgress(data.progress || 0);
        setStatus(data.status || '');
        setTitle(data.title || '');
      } catch {}
    };
    eventSourceRef.current.onerror = () => {
      eventSourceRef.current.close();
    };
    try {
      const response = await axios.get('/download', {
        params: { url, download_id: downloadId },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = getFilenameFromHeader(response.headers['content-disposition']);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to download MP3.');
    } finally {
      setLoading(false);
      setProgress(0);
      setStatus('');
      setTitle('');
      if (eventSourceRef.current) eventSourceRef.current.close();
    }
  };

  const statusText = status === 'starting' ? 'Starting...'
    : status === 'downloading' ? `Downloading${title ? `: ${title}` : ''}`
    : status === 'converting' ? 'Converting to MP3...'
    : status === 'finished' ? 'Download ready!'
    : status === 'error' ? 'Error during download.'
    : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-2">YouTube to MP3</h1>
        <p className="text-center text-gray-500 mb-4">Paste a YouTube URL below to download the audio as MP3.</p>
        <form onSubmit={handleDownload} className="flex flex-col gap-4">
          <input
            type="url"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            placeholder="Enter YouTube URL..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Downloading...' : 'Download MP3'}
          </button>
        </form>
        {loading && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-600 text-center">{statusText}</div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center mt-2">
            {error}
          </div>
        )}
      </div>
      <footer className="mt-8 text-gray-400 text-sm text-center">
        &copy; {new Date().getFullYear()} YouTube to MP3. All rights reserved.
      </footer>
      <div className="fixed bottom-2 right-2 z-50 text-xs text-gray-400 opacity-80 bg-white/70 px-2 py-1 rounded shadow">
        Made by Ahmed Hammad (<a href="https://github.com/amsepi" className="underline hover:text-purple-600">amsepi</a>)
      </div>
    </div>
  );
}