
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

  const [menu, setMenu] = useState('mp3');
  // MP3 state
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const eventSourceRef = useRef(null);
  // RemoveBG state
  const [image, setImage] = useState(null);
  const [bgLoading, setBgLoading] = useState(false);
  const [bgError, setBgError] = useState('');
  const [resultImg, setResultImg] = useState(null);


  // MP3 Download handler
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


  // RemoveBG handler
  const handleRemoveBg = async (e) => {
    e.preventDefault();
    setBgError('');
    setResultImg(null);
    if (!image) {
      setBgError('Please upload an image.');
      return;
    }
    setBgLoading(true);
    const formData = new FormData();
    formData.append('file', image);
    try {
      const response = await axios.post('/removebg', formData, { responseType: 'blob' });
      setResultImg(URL.createObjectURL(response.data));
    } catch (err) {
      setBgError(err.response?.data?.detail || 'Failed to remove background.');
    } finally {
      setBgLoading(false);

    }
  };

  const statusText = status === 'starting' ? 'Starting...'
    : status === 'downloading' ? `Downloading${title ? `: ${title}` : ''}`
    : status === 'converting' ? 'Converting to MP3...'
    : status === 'finished' ? 'Download ready!'
    : status === 'error' ? 'Error during download.'
    : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col gap-8">

          {/* Menu */}
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => setMenu('mp3')} className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${menu==='mp3' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}>YouTube to MP3</button>
            <button onClick={() => setMenu('removebg')} className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${menu==='removebg' ? 'bg-gradient-to-r from-yellow-500 to-pink-500 text-white shadow-lg' : 'bg-white/10 text-yellow-200 hover:bg-white/20'}`}>Remove Image BG</button>
          </div>
          {/* MP3 Downloader */}
          {menu === 'mp3' && (
            <>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  YouTube to MP3
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Transform any YouTube video into high-quality MP3 audio with just one click
                </p>
              </div>
              <form onSubmit={handleDownload} className="flex flex-col gap-6">
                <div className="relative">
                  <input
                    type="url"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    placeholder="Paste YouTube URL here..."
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <button
                  type="submit"
                  className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download MP3
                      </>
                    )}
                  </span>
                </button>
              </form>
              {loading && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">Progress</span>
                      <span className="text-purple-300 font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-300 text-sm mt-3 text-center">{statusText}</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-2xl text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>

                </div>
              )}
            </>
          )}
          {/* RemoveBG */}
          {menu === 'removebg' && (
            <>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  Remove Image Background
                </h1>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Upload an image and remove its background instantly using AI
                </p>
              </div>
              <form onSubmit={handleRemoveBg} className="flex flex-col gap-6">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  onChange={e => setImage(e.target.files[0])}
                  required
                />
                <button
                  type="submit"
                  className="relative overflow-hidden bg-gradient-to-r from-yellow-500 to-pink-500 hover:from-yellow-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-xl"
                  disabled={bgLoading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {bgLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Removing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Remove Background
                      </>
                    )}
                  </span>
                </button>
              </form>
              {bgLoading && (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 text-center">
                    <span className="text-white font-medium">Processing...</span>
                  </div>
                </div>
              )}
              {bgError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-2xl text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {bgError}
                  </div>
                </div>
              )}
              {resultImg && (
                <div className="flex flex-col items-center gap-4 mt-4">
                  <img src={resultImg} alt="Result" className="rounded-2xl max-w-full max-h-80 border-4 border-white/20 shadow-lg" />
                  <a href={resultImg} download="no-bg.png" className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:from-yellow-600 hover:to-pink-600 transition-all duration-200">Download Result</a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <footer className="mt-12 text-gray-400 text-sm text-center relative z-10">

        <p>&copy; {new Date().getFullYear()} YouTube to MP3 & RemoveBG. All rights reserved.</p>

      </footer>
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20 shadow-lg">
          <span className="text-white text-sm">
            Made by <a href="https://github.com/amsepi" className="text-purple-300 hover:text-purple-200 underline font-medium">Ahmed Hammad</a>
          </span>
        </div>
      </div>
    </div>
  );
}