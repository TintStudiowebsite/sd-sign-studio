import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import faviconUrl from './assets/fevicon.jpeg'

function setCircularFavicon(url, size = 64) {
  const img = new Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(img, 0, 0, size, size)
    const faviconLink = document.querySelector("link[rel='icon']")
    if (faviconLink) {
      faviconLink.href = canvas.toDataURL('image/png')
      faviconLink.type = 'image/png'
    }
  }
  img.src = url
}

setCircularFavicon(faviconUrl)
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CountryProvider } from './context/CountryContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CountryProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CountryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
