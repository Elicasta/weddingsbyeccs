# Weddings by ECCS

Reusable private wedding proposal system for Emma Cast Creative / EC Creative Studios.

## URL model

One deployed site can serve a separate custom proposal for every wedding client:

- `/cristina`
- `/taylor`
- `/jordan-and-maya`

With the custom domain connected in Vercel, those become:

- `weddingsbyeccs.eccreativestudios.com/cristina`
- `weddingsbyeccs.eccreativestudios.com/taylor`

The shared design and pricing live once. Client-specific content is loaded from the URL slug.

## Shared template

`template-data.js`

This contains the standard ECCS photography collections and optional film add-ons. Update this file when pricing or package deliverables change. Every client proposal inherits the update.

## Client proposals

Client files live in:

`clients/<slug>.js`

Cristina is currently:

`clients/cristina.js`

A client file controls:

- name
- wedding date
- venue
- location
- guest count
- hero copy
- visual direction
- priorities
- recommended photography collection
- recommended film add-on

## Creating a new client

1. Copy `clients/cristina.js`.
2. Rename the copy to the desired URL slug, for example `clients/taylor.js`.
3. Update the client data and recommendation.
4. Push the file.

The new proposal is then available at `/taylor` without creating another website or repository.

## Current collection structure

Photography:

- Classic Collection · 8 hours · $4,500
- Full Day · 10 hours · $5,500
- Legacy Collection · 12 hours · $6,750

Optional film:

- Classic Film · 8 hours · +$3,000
- Luxe Film · 10 hours · +$4,000
- Legacy Film · 12 hours · +$5,000
- Photography Only · $0

## Deployment

Deploy this repository once to Vercel and attach:

`weddingsbyeccs.eccreativestudios.com`

Vercel rewrites client slugs to the shared proposal shell while static files continue to load normally.

The site sends `noindex, nofollow, noarchive` headers because these are private proposals, not public pricing pages.
