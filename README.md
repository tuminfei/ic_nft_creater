# IC NFT Creator

![Image text](https://raw.githubusercontent.com/tuminfei/ic_nft_creater/master/public/logo.png)

Easily design NFTs on IC network and sell them on Shopify just like regular products. It's so much fun to send NFTs to your customers' emails!

## Introduction
IC_NFT_Creator is a cutting-edge Shopify app designed to streamline the process of creating and launching NFT collections, product certificates, and more on the Dfinity IC network. Elevate your Shopify store's offerings and tap into the world of blockchain-based assets with our user-friendly and efficient platform.

<img width="1440" alt="dashboard" src="https://raw.githubusercontent.com/tuminfei/ic_nft_creater/master/public/show.png">

## Key Features

### Effortless NFT Creation

Easily generate and deploy NFT collections on the Dfinity IC network directly from your Shopify store. Our intuitive interface ensures a seamless experience, allowing even non-technical users to harness the power of blockchain technology.

### Product Certification

Provide authenticity and provenance to your products by creating digital certificates on the Dfinity IC network. Enhance customer trust and satisfaction by offering verifiable proof of ownership and origin.

### Multi-Channel Sales

IC_NFT_Creator enables you to leverage Shopify's extensive sales channels to market and sell your NFT collections. Expand your reach and connect with a broader audience through Shopify's established e-commerce ecosystem.

### Customizable Token Attributes
Tailor your NFTs to match your brand identity with customizable token attributes. Define metadata, rarity, and other unique characteristics to make your NFTs stand out in the decentralized marketplace.

### Seamless Integration with Shopify

Our app seamlessly integrates with your Shopify store, allowing for a hassle-free experience. Manage your NFTs and product certificates directly from your Shopify dashboard, providing a centralized hub for all your e-commerce activities.

### Blockchain Security

Leverage the security and transparency of blockchain technology to safeguard your NFTs and product certificates. Dfinity IC ensures a decentralized and tamper-resistant environment, protecting the integrity of your digital assets.

### Automated Minting and Listing

Save time and effort with automated minting and listing processes. IC_NFT_Creator streamlines the creation and listing of your NFTs, allowing you to focus on what matters most – growing your business.

### Real-Time Analytics

Gain insights into the performance of your NFT collections with real-time analytics. Track sales, engagement, and other key metrics to optimize your strategies and drive success in the decentralized marketplace.

Unlock the full potential of your Shopify store by integrating IC_NFT_Creator. Join the blockchain revolution and provide your customers with unique, verifiable, and collectible digital assets. Elevate your e-commerce experience with the power of NFTs on the Dfinity IC network.

# Milestone

## Milestone #1

- Develop an NFT canister based on ICRC7, integrating file storage management and relevant monitoring interfaces to enhance ICRC7 capabilities.
- Integrate NFT metadata storage securely on the IC blockchain.
- Develop a factory canister for easy integration with Shopify, enabling users to create and manage NFT assets online.
- Develop monitoring for the factory canister and generated NFT canisters, allowing users to query their NFT asset information on Shopify.

## Milestone #2

- Integrate Shopify Payment Gateway (Enable users to sell NFTs and receive payments through Shopify)
- Develop NFT Search and Filtering System (Enable users to search and filter NFTs based on attributes)
- Create Gift Delivery System (Allow users to send NFTs as email attachments to buyers)

## Milestone #3

- Enhance User Interface for NFT Management and Marketplace
- Integrate NFT Metadata Storage (Store NFT metadata securely on the IC blockchain)
- Implement Social Media Sharing (Enable users to share their NFT listings on social media platforms)
- Conduct thorough Testing and Bug FixesDesign NFTs with ease

# Example Canister Info

URLs:

Backend canister via Candid interface:

nft_factory_backend: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=myniu-wqaaa-aaaah-advna-cai

icrc7_with_assets: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=vght4-jyaaa-aaaag-aceyq-cai

icrc7_with_assets: https://vght4-jyaaa-aaaag-aceyq-cai.raw.icp0.io/

## Local test canister

http://127.0.0.1:4943/?canisterId=avqkn-guaaa-aaaaa-qaaea-cai

## Docker

1. update to latest image

`docker pull tuminfei1981/ic_nft_creater:latest`

2. Run image:

`docker run -p 8081:8081 --rm --env-file dev.env tuminfei1981/ic_nft_creater:latest`

## Deploy to Fly.io

```
flyctl launch --no-deploy
flyctl secrets set SHOPIFY_API_SECRET="xxxxxx"  
flyctl secrets set SHOPIFY_API_KEY="xxxxxx"
flyctl secrets set SYSTEM_ACCOUNT_SEED="xxxxxx"
flyctl deploy
```


# Shopify App Template - Remix

This is a template for building a [Shopify app](https://shopify.dev/docs/apps/getting-started) using the [Remix](https://remix.run) framework.

Rather than cloning this repo, you can use your preferred package manager and the Shopify CLI with [these steps](https://shopify.dev/docs/apps/getting-started/create).

Visit the [`shopify.dev` documentation](https://shopify.dev/docs/api/shopify-app-remix) for more details on the Remix app package.

## Quick start

### Prerequisites

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
2. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
3. You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).

### Setup

If you used the CLI to create the template, you can skip this section.

Using yarn:

```shell
yarn install
```

Using npm:

```shell
npm install
```

Using pnpm:

```shell
pnpm install
```

### Local Development

Using yarn:

```shell
yarn dev
```

Using npm:

```shell
npm run dev
```

Using pnpm:

```shell
pnpm run dev
```

Press P to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

### Authenticating and querying data

To authenticate and query data you can use the `shopify` const that is exported from `/app/shopify.server.js`:

```js
export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);

  const response = await admin.graphql(`
    {
      products(first: 25) {
        nodes {
          title
          description
        }
      }
    }`);

  const {
    data: {
      products: { nodes },
    },
  } = await response.json();

  return json(nodes);
}
```

This template come preconfigured with examples of:

1. Setting up your Shopify app in [/app/shopify.server.js](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/shopify.server.js)
2. Querying data using Graphql. Please see: [/app/routes/app.\_index.jsx](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/routes/app._index.jsx).
3. Responding to mandatory webhooks in [/app/routes/webhooks.jsx](https://github.com/Shopify/shopify-app-template-remix/blob/main/app/routes/webhooks.jsx)

Please read the [documentation for @shopify/shopify-app-remix](https://www.npmjs.com/package/@shopify/shopify-app-remix#authenticating-admin-requests) to understand what other API's are available.

## Deployment

### Application Storage

This template uses [Prisma](https://www.prisma.io/) to store session data, by default using an [SQLite](https://www.sqlite.org/index.html) database.
The database is defined as a Prisma schema in `prisma/schema.prisma`.

This use of SQLite works in production if your app runs as a single instance.
The database that works best for you depends on the data your app needs and how it is queried.
You can run your database of choice on a server yourself or host it with a SaaS company.
Here’s a short list of databases providers that provide a free tier to get started:

| Database   | Type             | Hosters                                                                                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql) |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)                                   |
| Redis      | Key-value        | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-redis), [Amazon MemoryDB](https://aws.amazon.com/memorydb/)                                                                                                        |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/try/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                  |

To use one of these, you can use a different [datasource provider](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource) in your `schema.prisma` file, or a different [SessionStorage adapter package](https://github.com/Shopify/shopify-api-js/tree/main/docs/guides/session-storage.md).

### Build

Remix handles building the app for you, by running the command below with the package manager of your choice:

Using yarn:

```shell
yarn build
```

Using npm:

```shell
npm run build
```

Using pnpm:

```shell
pnpm run build
```

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/deployment/web) to host your app on a cloud provider like [Heroku](https://www.heroku.com/) or [Fly.io](https://fly.io/).

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.

## Gotchas / Troubleshooting

### Database tables don't exist

If you get this error:

```
The table `main.Session` does not exist in the current database.
```

You need to create the database for Prisma. Run the `setup` script in `package.json` using your preferred package manager.

### Navigating/redirecting breaks an embedded app

Embedded Shopify apps must maintain the user session, which can be tricky inside an iFrame. To avoid issues:

1. Use `Link` from `@remix-run/react` or `@shopify/polaris`. Do not use `<a>`.
2. Use the `redirect` helper returned from `authenticate.admin`. Do not use `redirect` from `@remix-run/node`
3. Use `useSubmit` or `<Form/>` from `@remix-run/react`. Do not use a lowercase `<form/>`.

This only applies if you app is embedded, which it will be by default.

### Non Embedded

Shopify apps are best when they are embedded into the Shopify Admin. This template is configured that way. If you have a reason to not embed your please make 2 changes:

1. Change the `isEmbeddedApp` prop to false for the `AppProvider` in `/app/routes/app.jsx`
2. Remove any use of App Bridge APIs (`window.shopify`) from your code
3. Update the config for shopifyApp in `app/shopify.server.js`. Pass `isEmbeddedApp: false`

### OAuth goes into a loop when I change my app's scopes

If you change your app's scopes and authentication goes into a loop and fails with a message from Shopify that it tried too many times, you might have forgotten to update your scopes with Shopify.
To do that, you can run the `config push` CLI command.

Using yarn:

```shell
yarn shopify app config push
```

Using npm:

```shell
npm run shopify app config push
```

Using pnpm:

```shell
pnpm run shopify app config push
```

### Incorrect GraphQL Hints

By default the [graphql.vscode-graphql](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension for VS Code will assume that GraphQL queries or mutations are for the [Shopify Admin API](https://shopify.dev/docs/api/admin). This is a sensible default, but it may not be true if:

1. You use another Shopify API such as the storefront API.
2. You use a third party GraphQL API.

in this situation, please update the [.graphqlrc.js](https://github.com/Shopify/shopify-app-template-remix/blob/main/.graphqlrc.js) config.

## Benefits

Shopify apps are built on a variety of Shopify tools to create a great merchant experience.

<!-- TODO: Uncomment this after we've updated the docs -->
<!-- The [create an app](https://shopify.dev/docs/apps/getting-started/create) tutorial in our developer documentation will guide you through creating a Shopify app using this template. -->

The Remix app template comes with the following out-of-the-box functionality:

- [OAuth](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-admin-requests): Installing the app and granting permissions
- [GraphQL Admin API](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#using-the-shopify-admin-graphql-api): Querying or mutating Shopify admin data
- [REST Admin API](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#using-the-shopify-admin-rest-api): Resource classes to interact with the API
- [Webhooks](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-webhook-requests): Callbacks sent by Shopify when certain events occur
- [AppBridge](https://shopify.dev/docs/api/app-bridge): This template uses the next generation of the Shopify App Bridge library which works in unison with previous versions.
- [Polaris](https://polaris.shopify.com/): Design system that enables apps to create Shopify-like experiences

## Tech Stack

This template uses [Remix](https://remix.run). The following Shopify tools are also included to ease app development:

- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix) provides authentication and methods for interacting with Shopify APIs.
- [Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge) allows your app to seamlessly integrate your app within Shopify's Admin.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Webhooks](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-webhook-requests): Callbacks sent by Shopify when certain events occur
- [Polaris](https://polaris.shopify.com/): Design system that enables apps to create Shopify-like experiences

## Resources

- [Remix Docs](https://remix.run/docs/en/v1)
- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix)
- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
