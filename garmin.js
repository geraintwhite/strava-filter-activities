const request = require('request')

const search_url = 'https://connect.garmin.com/proxy/activity-search-service-1.2'
const login_url = 'https://sso.garmin.com/sso/login?service=https%3A%2F%2Fconnect.garmin.com%2Fpost-auth%2Flogin&webhost=olaxpw-connect04&source=https%3A%2F%2Fconnect.garmin.com%2Fen-US%2Fsignin&redirectAfterAccountLoginUrl=https%3A%2F%2Fconnect.garmin.com%2Fpost-auth%2Flogin&redirectAfterAccountCreationUrl=https%3A%2F%2Fconnect.garmin.com%2Fpost-auth%2Flogin&gauthHost=https%3A%2F%2Fsso.garmin.com%2Fsso&locale=en_US&id=gauth-widget&cssUrl=https%3A%2F%2Fstatic.garmincdn.com%2Fcom.garmin.connect%2Fui%2Fcss%2Fgauth-custom-v1.1-min.css&clientId=GarminConnect&rememberMeShown=true&rememberMeChecked=false&createAccountShown=true&openCreateAccount=false&usernameShown=false&displayNameShown=false&consumeServiceTicket=false&initialFocus=true&embedWidget=false&generateExtraServiceTicket=false'
const auth_url = 'https://connect.garmin.com/modern/activities'
const activity_url = 'https://connect.garmin.com/modern/proxy/activity-service/activity'

const groupBy = (arr, func) => {
  return arr.reduce((acc, val) => {
    (acc[func(val)] = acc[func(val)] || []).push(val)
    return acc
  }, {})
}


class API {
  constructor(config) {
    this.auth = config
    this.request = request.defaults({ jar: true })
  }

  login() {
    const { username, password } = this.auth;
    const form = { username, password, embed: true }

    this.request(login_url, () => {
      this.request.post(login_url, { form }, (err, res, body) => {
        const ticket = body.match(/".*\?ticket=([-\w]+)\";.*/)[1]
        this.request(`${auth_url}?ticket=${ticket}`, (err, res, body) => {
          if (res.statusCode === 200) {
            console.log('Successfully logged in')
          } else {
            console.log('Failed to logged in')
          }
        })
      })
    })
  }

  getAllActivities(cb, page=1) {
    console.log(`Getting page ${page}`)
    this.request(`${search_url}/json/activities?start=${(page - 1) * 100}&limit=100`, (err, res, body) => {
      const activities = JSON.parse(body).results.activities
      console.log(`Got ${activities.length} activities on page ${page}`)
      if (activities.length > 0) {
        this.getAllActivities((next) => cb(activities.concat(next)), page + 1)
      } else {
        cb(activities)
      }
    })
  }

  deleteActivity(activityId, cb) {
    this.request.delete(`${activity_url}/${activityId}`, (err, res, body) => {
      cb(err || res.statusCode !== 204)
    })
  }

  deleteActivities(activities, cb) {
    if (activities.length > 0) {
      const activityId = activities.shift().activity.activityId
      this.deleteActivity(activityId, (err) => {
        console.log(`Deleted activity ${activityId}`)
        this.deleteActivities(activities, (res) => cb(Object.assign(res, { [activityId]: err })))
      })
    } else {
      cb({})
    }
  }
}

module.exports = API
