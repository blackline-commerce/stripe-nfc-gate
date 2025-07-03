import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { serveStatic } from "hono/serve-static"
import fs from 'node:fs/promises'
import path from 'node:path'
import Stripe from 'stripe'
import { PassNinjaClient } from '@passninja/passninja-js'

const {
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID,
  SITE_URL,
  PASSNINJA_ACCOUNT_ID,
  PASSNINJA_API_KEY,
  PASSNINJA_PASS_TYPE,
} = process.env
const stripe = new Stripe(STRIPE_SECRET_KEY as string)
const success_url = new URL('/success?session_id={CHECKOUT_SESSION_ID}', SITE_URL).toString()
const passNinja = new PassNinjaClient(PASSNINJA_ACCOUNT_ID as string, PASSNINJA_API_KEY as string)

const app = new Hono()

app.post('/subscribe', async (c) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url,
    line_items: [
      { price: STRIPE_PRICE_ID, quantity: 1 }
    ]
  })

  if (!session?.url) throw new Error('Session not found')

  return c.redirect(session.url)
})

app.get('/success', async (c) => {
  const session_id = c.req.query('session_id')
  
  if (!session_id) throw new Error('Missing session_id param')

  const session = await stripe.checkout.sessions.retrieve(session_id)

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

  if (subscription?.status !== 'active') throw new Error('Subscription was not successful')

  const pass = await passNinja.pass.create(
    PASSNINJA_PASS_TYPE,
    {
      name: session.customer_details!.name,
      email: session.customer_details!.email,
      "nfc-message": session.subscription,
      since: "January 2025"
    }
  )

  return c.redirect(pass.url)
})

app.use('/*', serveStatic({
  root: './static',
  getContent: async path => {
    console.log({ path })
    return fs.readFile(path)
  }
}))

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
