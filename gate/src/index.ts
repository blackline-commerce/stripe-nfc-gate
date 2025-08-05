import Stripe from 'stripe'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { Gpio } from './gpio.js'

// setup a connection to the relay on GPIO8
const relay = new Gpio(+process.env.RELAY_PIN!)

// create the Stripe API client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

// utility function to find the NFC reader
async function find_nfc_reader(): Promise<string | undefined> {
  const ports = await SerialPort.list()

  // find based on vendor id
  const port = ports.find(port => port.vendorId == '303a')

  return port?.path
}

// function to flash LEDs green, and play a beep
function success(port: SerialPort) {
  // trigger the relay for 5 seconds
  relay.high()
  setTimeout(() => relay.low(), 5_000)

  port.write('?LEDR 00FF00,100,100,4\n')
  port.write('?BEEPR 100,100,2\n')
}

// function to flash LEDs red, and play a beep
function error(port: SerialPort) {
  port.write('?LEDR FF0000,1000,100,1\n')
  port.write('?BEEPR 600,100,1,300\n')
}

// figure out the default path, on Linux it's usually /dev/ttyACM0
const path = process.argv.length > 2 ? process.argv[2] : await find_nfc_reader()

// raise error when no NFC reader is found
if (!path) throw new Error('No NFC reader found! Please make sure NFC reader is connected.')

// create serial port client
const port = new SerialPort({ path, baudRate: 9600 })
// use Readline so that we get full lines
const reader = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

// handle new data from serial port
reader.on('data', async (subscription_id) => {
  // ignore useless messages
  if (subscription_id == 'OK') return

  // get the subscription and customer records
  const subscription = await stripe.subscriptions.retrieve(subscription_id)

  // check if subscription is active
  if (subscription?.status === 'active') {
    // flash LEDs green and play sound
    success(port)
    console.log(`Access allowed. id=${ subscription_id }!`)
  } else {
    // flash LEDs red and play sound
    error(port)
    console.error(`Access denied. status=${subscription?.status}`)
  }
})
