Stripe NFC Gate
---------------

A solution for accessing physical doors based on Stripe Subscriptions and NFC Passes.

This example is suitable for Gyms, Co-working spaces, Parking garages, and Hotels.

## Background

To access a paid services, we are often issued door keys, and NFC card or a keyfob. These can be annoying to carry, and they're painful to replace when they get lost.

Luckily, there's a better way - using Apple & Google Wallet passes.

With Apple and Google Passes we can use our phone or watch to open the door.

The NFC reader can check the status of payment, for example, in a gym the payment is a Stripe Subscription. The door can then be opened dependending on the status of their subscription.

## How it works

For example, for a gym membership:

1. Customer pays for a membership using **Stripe Checkout**.
2. Customer receives a digital pass via **Apple Wallet** or **Google Wallet**.
3. Customer **can access the gym** by placing their phone or watch near the gym door's NFC reader.

## Benefits

- No keyfobs or cards needed.
- Purchase can be completed online without in-person visit to get a card/keyfob.
- Works with phones and watches (hands-free).

## Hardware

- [VTAP100 NFC Reader](https://shop.vtapnfc.com/product/vtap100-embedded-nfc-reader-board)
- [Raspberry PI Zero 2W](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/)

## License

MIT
