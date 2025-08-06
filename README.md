Stripe NFC Gate
---------------

A solution for gating physical doors based on Stripe Subscriptions and NFC Passes.

This example is suitable for gyms, co-working spaces, parking garages, hotels and event tickets.

## Background

It's common to access paid services, like gyms or co-working spaces, using keys, NFC cards or a keyfob. These can be annoying to carry, and they're painful to replace when they get lost.
They also require a human to issue them the first time.

Luckily, there's a better way - using Apple & Google Wallet passes.

With Apple and Google Passes, our phone or watch can be used to open the door.

The NFC reader can check the status of payment, for example, in a gym the payment is a Stripe Subscription. The door can then be opened dependending on the status of their subscription.

## How it works

For example, for a gym membership:

1. Customer pays for a membership using **Stripe Checkout**.
2. Customer receives a digital pass via **Apple Wallet** or **Google Wallet**.
3. Customer **can now access the gym** by placing their phone or watch near the gym door's NFC reader.

## Benefits

- No keyfobs or cards needed.
- Purchase can be completed online without in-person visit to get a card/keyfob.
- Works with phones and watches (hands-free).

## Hardware

- [VTAP100 NFC Reader](https://shop.vtapnfc.com/product/vtap100-embedded-nfc-reader-board)
- [Raspberry PI Zero 2W](https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/)
- [Relay for driving door bolt](https://abra-electronics.com/electromechanical/relays/relay-modules-shields/rm-1-3-3v-t-single-isolated-3-3v-relay-high-low-trigger-module-10a.html)

## Resources

- [VTAP Settings and Commands Reference](https://www.vtapnfc.com/downloads/VTAP_Commands_Reference_Guide.pdf)

## License

MIT
