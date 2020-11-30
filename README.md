<p align="center">
  <img width="400" height="140" src="https://svgshare.com/i/Qo0.svg">
</p>

# Livestorm Fullstack GraphQL Hiring Test

This test is part of our hiring process for Fullstack/GraphQL developers. [Apply now](https://jobs.livestorm.co/)

Be sure to read all of the instructions carefully and follow the guidelines below. This test should take you between 4 and 8 hours depending on your experience.

## What you need to do

Build a GraphQL API on a Node.js server and a small Vue.js app that uses this API. The application displays a web page with the following features:

- List or table of events sorted by creation date descending with a pagination every 10 items.
- Every event displays:
  - a title,
  - the event status (see below),
  - the date of the next future session or the last session if there are no next sessions,
  - the total sessions count for the event,
  - avatars and names of the event hosts,
  - registered people count (excluding hosts) for all the event sessions,
  - total messages count of all the event sessions.
- A `Load more` allows loading the next 10 events.
- A simple form to create a new event (the title is enough, the rest can be hardcoded).
- A select (or buttons...) can switch between displaying all events or filter them for a specific status (see below).

An event status can be:
- `draft` if the event is not published,
- `upcoming` is there is at least a future session,
- `past` is all event sessions are in the past.

The main item that needs to be polished the most is the GraphQL server. For the frontend, usage of the GraphQL API is essential, the rest is not important (style, etc.).

## Tech requirements

A few technologies/libraries **must be used** to build the app:

**Frontend:**

- Language: JavaScript
- Vue.js
- Apollo Client
- [vue-apollo](https://vue-apollo.netlify.com/)
- graphql-tag (`gql`)
- Coverage doesn't need to be 100% but your code **should be tested**

**Backend:**

- Language: Typescript
- Node.js
- Apollo Server
- PostgresSQL

### Other constraints

- You should use the included Postgres import script (`./generate-sql.js`).
- You can't modify the Database (such as new indexes/views/etc.).
- You can't use any ORM or Query builder: use raw SQL in the Apollo server.
- The SQL requests should be as fast as possible (~1 or 2 seconds max).
- Use only GraphQL to communicate between the client and the server.

## What we expect

We expect to receive 2 folders from you:

- a `client` folder with the whole Vue.js application,
- a `server` folder with the Apollo server.

See attached screenshots for a preview of an example expected result.

When you are finished, please send us a link to a GitHub repository!

## How to send your app code

When you feel you are done, send us by email a link to a **private GitHub repository** with an invite access for [@VincentGarreau](https://github.com/VincentGarreau)

## Tips

- **Design/style of the app is not important, focus on building and using the GraphQL API and the SQL queries.**
- Feel free to use any library you want
- Got questions? Contact us! (No penalties for asking questions 😉)
