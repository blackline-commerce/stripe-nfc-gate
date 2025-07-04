import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from "hono/serve-static"
import fs from 'node:fs/promises'
import path from 'node:path'
import Stripe from 'stripe'
import { PassNinjaClient } from '@passninja/passninja-js'

// extract env vars
const {
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID,
  SITE_URL,
  PASSNINJA_ACCOUNT_ID,
  PASSNINJA_API_KEY,
  PASSNINJA_PASS_TYPE,
} = process.env

// create Stripe API client
const stripe = new Stripe(STRIPE_SECRET_KEY as string)

// prepare the success_url
const success_url = new URL('/success?session_id={CHECKOUT_SESSION_ID}', SITE_URL).toString()

// create the Pass Ninja API client
const passNinja = new PassNinjaClient(PASSNINJA_ACCOUNT_ID as string, PASSNINJA_API_KEY as string)

// use Hono to handle web requests
const app = new Hono()

// when user visits /subscribe, a Stripe checkout session is created and the user is redirected
app.post('/subscribe', async (c) => {

  // create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url,
    line_items: [
      { price: STRIPE_PRICE_ID, quantity: 1 }
    ]
  })

  if (!session?.url) throw new Error('Session not found')

  // redirect user to checkout
  return c.redirect(session.url)
})

// when user visits /success (after checkout completes), provision the pass
app.get('/success', async (c) => {
  const session_id = c.req.query('session_id')
  
  if (!session_id) throw new Error('Missing session_id param')

  // get the Stripe checkout session
  const session = await stripe.checkout.sessions.retrieve(session_id)

  // get the Stripe subscription
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

  // verify the subscription is active
  if (subscription?.status !== 'active') throw new Error('Subscription was not successful')

  // issue a new pass
  const pass = await passNinja.pass.create(
    PASSNINJA_PASS_TYPE,
    {
      name: session.customer_details!.name,
      email: session.customer_details!.email,

      // save the subscription id in the pass
      "nfc-message": session.subscription,

      since: "January 2025"
    }
  )

  // redirect the user to the pass
  return c.redirect(pass.url)
})

// handle static files like /index.html
app.use('/*', serveStatic({
  root: './static',
  getContent: async path => {
    console.log({ path })
    return fs.readFile(path)
  }
}))

// run the server on port 3000
serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
