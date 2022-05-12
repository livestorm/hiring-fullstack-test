const faker = require('faker')
const path = require('path')
const fs = require('fs-extra')
const uuid = require('uuid/v4')

const userIds = []
const userCount = 2000
const eventIds = []
const eventCount = 500
const maxHostCount = 8
const maxAttendeeCount = 1000
const pastSessionIds = []
const maxSessionCount = 40
const maxMessageCount = 200

const file = path.resolve(process.cwd(), process.argv[2] || './db.sql')
const stream = fs.createWriteStream(file)

function progress(text, icon) {
  process.stdout.clearLine()
  process.stdout.cursorTo(0)
  process.stdout.write(`${icon || `⚙️`}  ${text}`)
}

function format(value) {
  if (typeof value === 'string') {
    value = value.replace(/'/g, `''`)
  }
  if (value instanceof Date) {
    value = value.toISOString()
  }
  if (typeof value === 'string') {
    return `'${value}'`
  }
  return `${value}`
}

function insert(...values) {
  stream.write(`(
  ${values.map(v => format(v)).join(`,\n  `)}
)`)
}

// random user avatar
function randomAvatar() {
  return `https://randomuser.me/api/portraits/${faker.random.boolean() ? 'women' : 'men'}/${faker.random.number({ min: 0, max: 99 })}.jpg`
}

// Clean
stream.write(`-- Clean DB
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS events_users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
`)

// Users
progress(`Generating users...`)
stream.write(`-- Users
CREATE TABLE users (
  id            uuid PRIMARY KEY,
  firstname     varchar(255) NOT NULL,
  lastname      varchar(255) NOT NULL,
  avatar        varchar(255),
  created_at    timestamp NOT NULL
);
`)
stream.write(`INSERT INTO users (
  id,
  firstname,
  lastname,
  avatar,
  created_at
) VALUES`)
for (let i = 0; i < userCount; i++) {
  const id = uuid()
  userIds.push(id)
  insert(
    id,
    faker.name.firstName(),
    faker.name.lastName(),
    randomAvatar(),
    faker.date.past(),
  )
  if (i < userCount - 1) {
    stream.write(`,`)
  }
}
stream.write(`;

`)

// Events
progress(`Generating events...`)
stream.write(`-- Events
CREATE TABLE events (
  id            uuid PRIMARY KEY,
  title         varchar(255) NOT NULL,
  created_at    timestamp NOT NULL,
  published_at  timestamp
);
CREATE INDEX events_created_at_idx ON events (created_at);
`)
stream.write(`INSERT INTO events (
  id,
  title,
  created_at,
  published_at
) VALUES`)
for (let i = 0; i < eventCount; i++) {
  const id = uuid()
  eventIds.push(id)
  insert(
    id,
    faker.lorem.sentence(),
    faker.date.past(),
    faker.random.boolean() ? null : faker.date.past(),
  )
  if (i < eventCount - 1) {
    stream.write(`,`)
  }
}
stream.write(`;

`)

// Hosts & Attendees
progress(`Generating hosts & attendees...`)
stream.write(`-- Hosts & Attendees
CREATE TABLE events_users (
  event_id           uuid REFERENCES events(id),
  user_id            uuid REFERENCES users(id),
  is_host            boolean NOT NULL,
  PRIMARY KEY (event_id, user_id)
);
`)
stream.write(`INSERT INTO events_users (
  event_id,
  user_id,
  is_host
) VALUES`)
for (let i = 0; i < eventCount; i++) {
  const eventId = eventIds[i]
  const map = {}
  for (const isHost of [true, false]) {
    const count = faker.random.number({
      min: 1,
      max: isHost ? maxHostCount : maxAttendeeCount,
    })
    progress(`Generating ${count} ${isHost ? `hosts` : `attendees`} for event ${i + 1} / ${eventCount}...`)
    // Hosts
    for (let j = 0; j < count; j++) {
      let userId
      do {
        userId = faker.random.arrayElement(userIds)
      } while (map[userId])
      map[userId] = true
      insert(
        eventId,
        userId,
        isHost
      )
      if (j < count - 1) {
        stream.write(`,`)
      }
    }
    if (isHost) {
      stream.write(`,`)
    }
  }
  if (i < eventCount - 1) {
    stream.write(`,`)
  }
}
stream.write(`;
`)

// Sessions
progress(`Generating sessions...`)
stream.write(`-- Sessions
CREATE TABLE sessions (
  id                    uuid PRIMARY KEY,
  event_id              uuid REFERENCES events(id),
  created_at            timestamp NOT NULL,
  start_at              timestamp NOT NULL
);\n`)
stream.write(`INSERT INTO sessions (
  id,
  event_id,
  created_at,
  start_at
) VALUES`)
for (let i = 0; i < eventCount; i++) {
  const eventId = eventIds[i]
  const count = faker.random.number({
    min: 1,
    max: maxSessionCount,
  })
  for (let j = 0; j < count; j++) {
    const id = uuid()
    const past = faker.random.boolean()
    if (past) {
      pastSessionIds.push(id)
    }
    insert(
      id,
      eventId,
      faker.date.past(),
      past ? faker.date.past() : faker.date.future()
    )
    if (j < count - 1) {
      stream.write(`,`)
    }
  }
  if (i < eventCount - 1) {
    stream.write(`,`)
  }
}
stream.write(`;

`)
const pastSessionCount = pastSessionIds.length

// Messages
progress(`Generating messages...`)
stream.write(`-- Messages
CREATE TABLE messages (
  id                    uuid PRIMARY KEY,
  user_id               uuid REFERENCES users(id),
  session_id            uuid REFERENCES sessions(id),
  created_at            timestamp NOT NULL,
  content               text NOT NULL
);\n`)
stream.write(`INSERT INTO messages (
  id,
  user_id,
  session_id,
  created_at,
  content
) VALUES`)
for (let i = 0; i < pastSessionCount; i++) {
  const sessionId = pastSessionIds[i]
  const count = faker.random.number({
    min: 0,
    max: maxMessageCount,
  })
  progress(`Generating ${count} messages for session ${i + 1} / ${pastSessionCount}...`)
  for (let j = 0; j < count; j++) {
    const id = uuid()
    insert(
      id,
      faker.random.arrayElement(userIds),
      sessionId,
      faker.date.past(),
      faker.lorem.paragraph(),
    )
    if (j < count - 1) {
      stream.write(`,`)
    }
  }
  if (count !== 0 && i < pastSessionCount - 1) {
    stream.write(`,`)
  }
}
stream.write(`;

`)

stream.end()
progress(`Generated ${file}`, `✅`)
process.stdout.write(`\n`)
