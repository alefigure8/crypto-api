const PORT = process.env.PORT || 8000
const {chromium} = require('playwright-chromium')
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// API
const getNews = async currency => {
  const browser = await chromium.launch({chromiumSandbox: false})
  const context = await browser.newContext()
  const page = await context.newPage()
  const waitUntil = req.query.waitUntil || "load"
  await page.goto(`https://news.google.com/search?q=${currency}%20when%3A1d/`, {
    waitUntil
  })
  // await page.waitForSelector('img.tvs3Id', {
  //   waitFor: 'visible'
  // })

  const img = await page.$$eval('img.tvs3Id ', elements =>
    elements.map(el => el.src).slice(0, 5)
  )

  const newsBody = await page.$$eval('div.NiLAwe', element => {
    return element
      .map(el => {
        const title = el.querySelector('div.xrnccd h3.ipQwMb')
        const link = el.querySelector('a').getAttribute('href')
        // const img = el.querySelector('img.tvs3Id')
        return {
          title: title.textContent,
          link: `https://news.google.com/${link}`
          // img: img
        }
      })
      .slice(0, 5)
  })

  for (let i = 0; i < newsBody.length; i++) {
    newsBody[i] = {
      ...newsBody[i],
      img: img[i]
    }
  }

  await browser.close()
  return newsBody
}

// ROUTE
app.get('/:currency', async (req, res) => {
  try {
    const currency = req.params.currency
    const articles = await getNews(currency)
    res.json(articles)
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

app.get('/', (req, res) => {
  res.json({Home: 'Crypto News', Developed: `@alegomeznieto`})
})

const server = app.listen(PORT)

server.on('error', err => {
  console.log('Error en el servidor: ', err)
})
