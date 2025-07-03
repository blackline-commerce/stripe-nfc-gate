import Stripe from 'stripe'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

const { STRIPE_SECRET_KEY } = process.env
const stripe = new Stripe(STRIPE_SECRET_KEY)

async function find_nfc_reader() {
  const ports = await SerialPort.list()

  // find based on vendor id
  return ports.find(port => port.vendorId == '303a')
}

const path = process.argv.length > 2 ? process.argv[2] : (await find_nfc_reader())?.path

if (!path) throw new Error('No NFC reader found! Please make sure NFC reader is connected.')

const port = new SerialPort({ path, baudRate: 9600 })
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

parser.on('data', async (subscription_id) => {
  const subscription = await stripe.subscriptions.retrieve(subscription_id)

  if (subscription?.status === 'active') {
    const customer = await stripe.customers.retrieve(subscription.customer)
    console.log(`Welcome ${ customer.name }!`)
  } else {
    console.log('Access denied')
  }
})
