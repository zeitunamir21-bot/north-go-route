# NorthGo

NorthGo — Intercity Ride Booking MVP

Route: Isiolo ⇄ Nairobi

MVP CONCEPT

A simple intercity booking platform like Uber/Bolt but for long-distance travel.

Passengers:

Search trips

Reserve seats

Contact driver

Pay later physically or via M-Pesa after boarding

No upfront payment required.

CORE MVP FEATURES

Passenger Side

1. Home Screen

Shows:

Available trips

Departure time

Available seats

Vehicle type

Pickup point

“Reserve Seat” button

Example:

Isiolo → Nairobi
Departure: 6:00 AM
Seats Left: 4
Vehicle: Toyota Noah
Pickup: Total Petrol Station

[ RESERVE SEAT ]


2. Booking Flow

Passenger enters:

Full name

Phone number

Pickup location

Destination

Number of seats

Then:

Seat reserved instantly

Passenger receives confirmation message

NO payment first.

3. Booking Confirmation

After booking:

Booking Confirmed

Trip:
Isiolo → Nairobi

Departure:
6:00 AM

Pickup:
Total Petrol Station

Driver will contact you shortly.


4. Driver Contact

Passenger can:

Call driver

WhatsApp driver

View pickup instructions

DRIVER / OWNER DASHBOARD

Features

You can:

Add trips

Change seat count

View passenger list

Call passengers

Mark passengers as boarded

Mark trip completed

SIMPLE MVP PAGES

1. Landing Page

Sections:

Hero banner

Routes

Why choose us

Available trips

Contact section

2. Trips Page

Shows:

Today’s rides

Tomorrow’s rides

Seat availability

3. Booking Page

Simple booking form.

4. Dashboard

Only for owner/admin.

HOW THE SYSTEM WORKS

Example

Passenger visits website

Selects:

Isiolo → Nairobi

Chooses departure

Reserves 2 seats

Gets WhatsApp/SMS confirmation

Pays physically when boarding

VEHICLE SYSTEM

Since you have one car:

Maximum seats shown

Auto reduce after booking

“FULL” appears when seats end

DATABASE STRUCTURE

Trips

id
route
departure_time
pickup_point
available_seats
vehicle_name
status


Bookings

id
customer_name
phone
trip_id
seats
booking_status


FUTURE UPGRADES

Phase 2

Online payment

Live vehicle tracking

Driver app

Multiple vehicles

Parcel booking

Seat selection map

DESIGN STYLE

Like:

Uber

Bolt

EasyCoach booking

Modern:

White background

Green/black theme

Large booking buttons

Mobile-first layout

BEST TECH STACK

Frontend

Next.js

React

Tailwind CSS

Backend

Node.js

Express

Database

Firebase
OR

Supabase

Notifications

WhatsApp API

Africa’s Talking SMS

SIMPLE COPY & PASTE HERO SECTION

Travel Between Isiolo and Nairobi Easily

Reserve your seat in minutes.
Safe. Reliable. Comfortable.

✔ Daily Trips
✔ Reserve Without Paying First
✔ Trusted Driver
✔ Comfortable Travel

[ BOOK YOUR SEAT ]


BEST FREE TOOLS

Supabase

Firebase

Vercel

FlutterFlow

BUSINESS MODEL

Start

1 car:

7 seats

Daily trips

Manual passenger approval

Then scale:

Add drivers

Add routes

Add app

Add online payments later

BEST STARTING STRATEGY

At first:

Use WhatsApp support

Accept booking requests manually

Build customer trust

Collect repeat customers

Then automate late

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://north-go-route.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d59891ab-8e0b-49d9-8925-0131bbfe52b5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
