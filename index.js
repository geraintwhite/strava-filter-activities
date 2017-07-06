const express = require('express')
const moment = require('moment')
const API = require('./strava')
const config = require('./config')

app = express()

app.set('view engine', 'ejs');
app.set('port', 3000)

app.locals.moment = moment

app.use(express.static('public'))

app.get('/', (req, res) => {
  const strava = new API(config.strava)
  strava.getActivitiesWithGear((activities) => {
    res.render('index', {activities})
  })
})

app.listen(app.get('port'), () => {
  console.log(`Listening on port ${app.get('port')}`)
})
