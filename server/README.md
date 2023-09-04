# server

server implements a graphQL server to access and write the data.

The schema.graphql file is in server/web/schema.graphql

To access the data, a tool like [graphqurl](https://github.com/hasura/graphqurl) can be used.


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
