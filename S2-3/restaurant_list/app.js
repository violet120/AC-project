const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const port = 3000
// 引入餐廳資料
const restaurantList = require('./restaurant.json')

// setting template engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.use(express.static('public'))

// routes setting
app.get('/', (req, res) => {
  res.render('index', { restaurants: restaurantList.results })
})

app.get('/search', (req, res) => {
  const keyword = req.query.keyword
  const restaurants = restaurantList.results.filter(restaurant => {
    const allKeyword = restaurant.name.toLowerCase() + restaurant.category.toLowerCase() + restaurant.name_en.toLowerCase()
    return allKeyword.includes(keyword.toLowerCase())
  })
  
  res.render('index', { restaurants: restaurants, keyword: keyword })
})

app.get('/restaurants/:restaurant_id', (req, res) => {
  const restaurant = restaurantList.results.find(restaurant => restaurant.id.toString() === req.params.restaurant_id)
  console.log(restaurant);
  res.render('show', { restaurant: restaurant })
})


// start and listen on the Express server
// localhost:3000
app.listen(port, () => {
  console.log(`Express is listening on localhost:${port}`)
})