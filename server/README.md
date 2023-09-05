# server

server implements a graphQL server to access and write the data.

The schema.graphql file is in server/web/schema.graphql

To access the data, a tool like [graphqurl](https://github.com/hasura/graphqurl) can be used.


## Login

The server uses jwt tokens for authentivations. The login route to create the
jwt-token is `/auth`. The body of the request has to contains a json object
like:

```json
{
  "role": "reader",
  "id": 5,
  "token": "secred"
}
```

`role` has to be `admin`, `reader` or `pupil`.

For `admin`, the id can be omitted. The token has to be the same as in the
config.toml file.

For `reader`, the id has to be a campaign id. The token has to be the same as
the loginToken of the campaign.

For `pupil`, the id has to be a pupil id. The token has to be the same as the
loginToken of the pupil.


## Logout

There is no logout route. Just remove the cookie containing the jwt-token. The
session is not saved on the server.


## Reading data

The data can be accessed from a campaign. For example with

```graphql
{
  campaign(id: 1) {
    title
    days {
      id
      title
      events {
        event {
          id
          title
        }
        pupils {
          id
          name
        }
      }
    }
    events {
      id
      title
      capacity
      maxSpecialPupils
    }
    pupils {
      id
      name
      class
      special
      choices {
        event {
          id
          title
        }
        choice
      }
    }
  }
}


```

## Writing data

The schema.graphql contains some mutations. For example:

```graphql
mutation {
  addCampaign(title: "weiterer", days: ["day1", "day2"]) {
    id
    days{
      id
      title
    }
  }
}
```
