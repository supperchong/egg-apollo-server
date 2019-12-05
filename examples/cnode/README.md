# cnode graphql demo

## Description

[cnode api](https://cnodejs.org/api) write in graphql

## QuickStart

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/graphql
```

###

Once you start the service, you can access the playground at http://localhost:7001/graphql.
try

```gql
query {
  topics(page: 1, limit: 10) {
    id
    author_id
    tab
  }
}
```
