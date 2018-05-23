/* eslint-env jest */

/*

https://stackoverflow.com/questions/50291205

> There was a problem in Bearer Token at the time of making Send Fax request.

> Because I was using primary account details for generating Token and at the time of sending FAX I was using extensionid of extension 102 and Bearer Token was generated with Main account extension 101. That is why it was throwing [OutboundFaxes] permission error.

> To send FAX with ExtensionId of extension 102 , then generate the token using subaccount 102 details instead of main account.

*/

const RingCentral = require('../src/ringcentral')
const dotenv = require('dotenv')

dotenv.config()

jest.setTimeout(64000)

const rc = new RingCentral(process.env.RINGCENTRAL_CLIENT_ID, process.env.RINGCENTRAL_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER_URL)

describe('ringcentral', () => {
  test('fax with wrong token', async () => {
    await rc.authorize({
      username: process.env.RINGCENTRAL_USERNAME,
      extension: process.env.RINGCENTRAL_EXTENSION,
      password: process.env.RINGCENTRAL_PASSWORD
    })

    let r = await rc.get('/restapi/v1.0/account/~/extension')
    const otherExtensionId = r.data.records.filter(r => r.extensionNumber === '102')[0].id
    console.log(otherExtensionId)

    // r = await rc.get('/restapi/v1.0/account/~/extension/~')
    // console.log(r.data)

    await rc.revoke()
  })
})
