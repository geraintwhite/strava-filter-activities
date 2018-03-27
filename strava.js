const request = require('request')

const url = 'https://www.strava.com/api/v3'

const groupBy = (arr, func) => {
  return arr.reduce((acc, val) => {
    (acc[func(val)] = acc[func(val)] || []).push(val)
    return acc
  }, {})
}


class API {
  constructor(config) {
    this.auth = config.access_token
  }

  getGear(cb) {
    request(`${url}/athlete`, {auth: {bearer: this.auth}}, (err, res, body) => {
      const athlete = JSON.parse(body)
      cb(athlete.bikes.concat(athlete.shoes))
    })
  }

  getAllActivities(cb, page=1) {
    console.log(`Getting page ${page}`)
    request(`${url}/athlete/activities?per_page=100&page=${page}`, {auth: {bearer: this.auth}}, (err, res, body) => {
      const activities = JSON.parse(body)
      console.log(`Got ${activities.length} activities on page ${page}`)
      if (activities.length === 0) {
        cb(activities)
      } else {
        this.getAllActivities((next) => cb(activities.concat(next)), page + 1)
      }
    })
  }

  getDuplicates(cb) {
    this.getAllActivities((activities) => {
      cb(activities.filter((x) => activities.filter((y) => x.start_date === y.start_date).length > 1))
    })
  }

  getActivitiesWithGear(cb) {
    this.getGear((gear) => {
      this.getAllActivities((activities) => {
        cb(activities.map((a) => {
          return Object.assign(a, {gear: (gear.find((g) => g.id === a.gear_id) || {}).name})
        }))
      })
    })
  }

  getActivitiesByGear(cb) {
    this.getAllActivities((activities) => {
      this.getGear((gear) => {
        cb(groupBy(activities, (a) => (gear.find((g) => g.id === a.gear_id) || {}).name))
      })
    })
  }
}

module.exports = API
