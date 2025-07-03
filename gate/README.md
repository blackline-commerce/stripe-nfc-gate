Gate
-------

This project is designed to run on Raspberry PI.

It is wired to the NFC reader via USB. It reads from the serial port.

When a phone or watch is in proximity of the reader, and new line will show up on the serial port (usually `/dev/ttyACM0`).

The value is the Stripe subscription id (starts with `sub_`), which can be used to call the Stripe API and very the status of their subscription (it must be `active` to open the door).
