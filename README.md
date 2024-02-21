# cf-counter

## Overview

The Cloudflare Counter is a serverless Durable Object on Cloudflare Workers that provides a simple API for incrementing counters, retrieving their current values, and formatting these numbers for human-readable display. It supports special namespaces for temporal granularity such as minute, hour, day, month, and year, allowing for the automatic resetting of counters based on the specified intervals.

## Features

- **Incremental Counting:** Automatically increments a counter's value with each request.
- **Retrieval of Counts:** Supports fetching the current count in plain text, JSON, or in a human-readable format with appropriate suffixes (e.g., K for thousands, M for millions).
- **Temporal Namespaces:** Offers the capability to reset counters automatically at the start of a new minute, hour, day, month, or year.
- **Human-readable Formatting:** Converts large numbers into easily understandable formats using suffixes.

## Setup

Note you must have Cloudflare Workers Paid Plan to use Durable Objects.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YouXam/cf-counter)

or use Wrangler:

```shell
wrangler deploy
```

## API Reference

### Endpoints

The Cloudflare Counter provides the following endpoints, accessible via HTTP requests:

- **Increment Counter:** `GET /{namespace}/{name}`
  - Increments the counter named `{name}` within the specified `{namespace}` and returns the new count.
- **Get Current Count:** `GET /{namespace}/{name}/get`
  - Retrieves the current count of the counter named `{name}` in plain text format.
- **Humanized Count:** `GET /{namespace}/{name}/humanized`
  - Returns the current count in a human-readable format, appending appropriate suffixes.
- **Get Count in JSON:** `GET /{namespace}/{name}/json`
  - Provides the current count and its human-readable format in JSON.
- **Get Badges:** `GET /{namespace}/{name}/badge`
	- Returns a badge image with the current count in SVG format.
	- The `type` get parameter can be configured to display raw numbers(`number`) or humanized numbers(`humanized`).
	- The `increment` get parameter can be set to `true` to increment the counter with each request. Default is `false`, which means the counter will not be incremented when the badge is requested.
	- Other options are same as [shields.io](https://shields.io/badges/dynamic-json-badge).

### Namespaces

Use the following namespaces to specify the temporal granularity for counter resets:

- `minute`
- `hour`
- `day`
- `month`
- `year`

Other namespaces are also supported, but they do not reset automatically.

### Examples

**Increment a Counter:**

```http
GET /day/page_views
```

```plaintext
1
```
**Get Current Count in Plain Text:**

```http
GET /day/page_views/get
```

```plaintext
1
```

**Humanize the Current Count:**

```http
GET /month/signup_count/humanized
```

```plaintext
1.23K
```

**Retrieve Count in JSON Format:**

```http
GET /year/revenue/json
```

```json
{
	"count": 1234567,
	"humanized": "1.23M"
}
```

**Get Badge:**

```
GET /github/youxam-cf-counter/badge?type=humanized&logo=github&label=Page%20views&increment=true
```

![Page views](https://cf-counter.youxam.workers.dev/github/youxam-cf-counter/badge?type=humanized&logo=github&label=Page%20views&increment=true)

## License

[MIT](LICENSE)
