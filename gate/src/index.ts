import Stripe from 'stripe'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

async function find_nfc_reader(): Promise<string | undefined> {
  const ports = await SerialPort.list()

  // find based on vendor id
  const port = ports.find(port => port.vendorId == '303a')

  return port?.path
}

// flash LEDs green, and play a beep
function success(port: SerialPort) {
  port.write('?LEDR 00FF00,100,100,4\n')
  port.write('?BEEPR 100,100,2\n')
}

// flash LEDs red, and play a beep
function error(port: SerialPort) {
  port.write('?LEDR FF0000,1000,100,1\n')
  port.write('?BEEPR 600,100,1,300\n')
}

const path = process.argv.length > 2 ? process.argv[2] : await find_nfc_reader()

if (!path) throw new Error('No NFC reader found! Please make sure NFC reader is connected.')

const port = new SerialPort({ path, baudRate: 9600 })
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

parser.on('data', async (subscription_id) => {
  if (subscription_id == 'OK') return
  console.log(subscription_id)

  const subscription = await stripe.subscriptions.retrieve(subscription_id)
  const customer = await stripe.customers.retrieve(subscription.customer as string)

  if (subscription.status === 'active' && !customer.deleted) {
    success(port)
    console.log(`Welcome ${ customer.name }!`)
  } else {
    error(port)
    console.log(`Access denied. status=${subscription?.status}`)
  }
})
