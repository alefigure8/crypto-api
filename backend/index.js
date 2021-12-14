const PORT = process.env.PORT || 8000
const {chromium} = require('playwright')
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// API
const getNews = async currency => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(`https://news.google.com/search?q=${currency}%20when%3A1d/`, {
    waitUntil: 'networkidle'
  })
  await page.waitForSelector('img.tvs3Id', {
    waitFor: 'visible'
  })

  const img = await page.$$eval('img.tvs3Id ', elements =>
    elements.map(el => el.src).slice(0, 5)
  )

  const newsBody = await page.$$eval('div.NiLAwe', element => {
    return element
      .map(el => {
        const title = el.querySelector('div.xrnccd h3.ipQwMb')
        const link = el.querySelector('a').getAttribute('href')
        // const img = el.querySelector('img.tvs3Id') TODO
        return {
          title: title.textContent,
          link: `https://news.google.com/${link}`
          // img: img TODO
        }
      })
      .slice(0, 5)
  })

  // TODO FIx img, into the object

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
  const currency = req.params.currency
  const articles = await getNews(currency)
  res.json(articles)
})

app.get('/', (req, res) => {
  res.json({Home: 'Página de Noticias'})
})

app.listen(PORT)
