# Sea :ocean:

[![GitHub Actions status (master)](https://github.com/rinsuki/sea/workflows/Build%20and%20Test/badge.svg)](https://github.com/rinsuki/sea/actions)
[![Codecov Test Coverage](https://img.shields.io/codecov/c/github/rinsuki/sea)](https://codecov.io/github/rinsuki/sea)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=rinsuki/sea)](https://dependabot.com)

## Requires

-   Node.js 12.x
-   Postgres >= 10.x

## How to develop

```sh
cp .env.example .env
yarn web-push generate-vapid-keys
# Insert your vapid keys to .env
editor .env
docker-compose up
```

## Deploy

### Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Docker

https://hub.docker.com/r/rinsuki/sea
