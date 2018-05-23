/* eslint-env jest */
const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const concat = require('concat-stream')
const delay = require('timeout-as-promise')

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('fax', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    const form = new FormData()
    form.append('json', JSON.stringify({ to: [{ phoneNumber: process.env.RINGCENTRAL_RECEIVER }] }), 'test.json')
    form.append('attachment', fs.createReadStream(path.join(__dirname, 'test.png')), 'test.png')
    form.pipe(concat({ encoding: 'buffer' }, async data => {
      const r = await rc.post('/restapi/v1.0/account/~/extension/~/fax', data, {
        headers: form.getHeaders()
      })
      console.log(r.data)
    }))

    await delay(10000)
    await rc.revoke()
  })
})
