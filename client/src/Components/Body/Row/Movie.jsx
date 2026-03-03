import axios from '../../../utils/api'
import { useEffect, useState } from 'react'
import Youtube from 'react-youtube'
import movieTrailer from 'movie-trailer'
import React from 'react';

function Movie({ title, fetchUrl }) {
  const [movies, setMovies] = useState([])
  const [videoId, setVideoId] = useState(null)
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(fetchUrl)
        setMovies(res.data.results)
      } catch (err) {
        console.log(`Error fetching ${title}: ${err.message}`)
      }
    })()
  }, [fetchUrl, title])

  useEffect(() => {
    const makeDraggable = (slider) => {
      let isDown = false
      let startX
      let scrollLeft

      slider.addEventListener('mousedown', (e) => {
        isDown = true
        startX = e.pageX - slider.offsetLeft
        scrollLeft = slider.scrollLeft
        slider.style.cursor = 'grabbing'
      })

      slider.addEventListener('mouseleave', () => {
        isDown = false
        slider.style.cursor = 'grab'
      })

      slider.addEventListener('mouseup', () => {
        isDown = false
        slider.style.cursor = 'grab'
      })

      slider.addEventListener('mousemove', (e) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - slider.offsetLeft
        const walk = (x - startX) * 2
        slider.scrollLeft = scrollLeft - walk
      })
    }

    const list = document.querySelector(`.row-${title.replace(/\s+/g, '-')}`)?.querySelector('.list')
    if (list) makeDraggable(list)
  }, [movies, title])

  const handleVideo = async (movieTitle) => {
    try {
      const url = await movieTrailer(movieTitle)
      const videoId = new URL(url).searchParams.get('v')
      setVideoId(videoId)
      setShowVideo(true)
    } catch (err) {
      console.error(`Trailer error: ${err.message}`)
    }
  }

  const closeVideo = () => {
    setVideoId(null)
    setShowVideo(false)
  }

  return (
    <div className={`row-${title.replace(/\s+/g, '-')}`}>
      <div className="name">{title}</div>
      <div className="list">
        {movies.map((movie, index) => (
          <div className="card" key={index}>
            <img
              onClick={() => handleVideo(movie.title || movie.original_title)}
              src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
              alt="poster"
              loading="lazy"
            />
            <div className="title">{movie.title || movie.original_title}</div>
          </div>
        ))}
      </div>

      {showVideo && (
        <div className="video-cont" onClick={closeVideo}>
          <div className="video" onClick={(e) => e.stopPropagation()}>
            <Youtube
              videoId={videoId}
              opts={{
                height: '450',
                width: '800',
                playerVars: { autoplay: 1 },
              }}
            />
            <button onClick={closeVideo}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Movie
