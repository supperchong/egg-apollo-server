'use strict';

const mock = require('egg-mock');
const assert = require('assert');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const { split } = require('apollo-link');
const { HttpLink } = require('apollo-link-http');
const { WebSocketLink } = require('apollo-link-ws');
const { getMainDefinition } = require('apollo-utilities');
const { InMemoryCache } = require('apollo-cache-inmemory');
const ApolloClient = require('apollo-client').default;
const ws = require('ws');
const fetch = require('node-fetch');
const cache = new InMemoryCache();
const gql = require('graphql-tag');
function createLink(port) {
  const httpLink = new HttpLink({
    uri: `http://localhost:${port}/graphql`,
    fetch,
  });

  // Create a WebSocket link:
  const wsLink = new WebSocketLink({
    uri: `ws://localhost:${port}/graphql`,
    options: {
      reconnect: true,
    },
    webSocketImpl: ws,
  });

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );
  return link;
}
function createApolloClient({ link, cache }) {
  return new ApolloClient({
    cache,
    link,
  });
}

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
const users = [
  {
    id: 1,
    name: '小王',
    age: 21,
  },
  {
    id: 2,
    name: '小李',
    age: 22,
  },
  {
    id: 3,
    name: '小白',
    age: 24,
  },
];
describe('test/app.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/app-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should get playground html', async () => {
    const res = app
      .httpRequest()
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);
    assert(res.type, 'text/html');
  });

  it('request get should return users', async () => {

    const res = await app
      .httpRequest()
      .get('/graphql?query={users{id\nname\nage}}')
      .expect(200);
    assert.deepEqual(res.body.data, {
      users,
    });
  });

  it('request post should return users', async () => {
    const query = `
    {
      users{
        id
        name
        age
      }
    }
    `;
    const res = await app.httpRequest()
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);
    assert.deepEqual(res.body.data, {
      users,
    });
  });
  it('should return user where id=1', async () => {
    const query = `
    {
      user(id:1){
        id
        name
      }
    }
    `;
    const user = {
      id: 1,
      name: '小王',
    };
    const res = await app.httpRequest()
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);
    assert.deepEqual(res.body.data, {
      user,
    });
  });
  it('should return null where id=4', async () => {
    const query = `
    {
      user(id:4){
        id
        name
      }
    }
    `;
    const user = null;
    const res = await app.httpRequest()
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);
    assert.deepEqual(res.body.data, {
      user,
    });
  });
  it('should return user when use variables', async () => {
    const query = `
    query getUser($id:ID!){
      user(id:$id){
        id
        name
      }
    }
    `;
    const user = {
      id: 2,
      name: '小李',
    };
    const res = await app.httpRequest()
      .post('/graphql')
      .send({
        query,
        variables: {
          id: 2,
        },
      })
      .expect(200);
    assert.deepEqual(res.body.data, {
      user,
    });
  });

  it('should return error Syntax Error: Expected Name, found }', async () => {
    const query = `
    query {
      user(id:1){}
    }
    `;
    const res = await app.httpRequest()
      .post('/graphql')
      .send({
        query,
      });
    assert.deepEqual(res.body.errors[0].message, 'Syntax Error: Expected Name, found }');
  });
  it('should add  project', async () => {
    const projectInput = {
      user_id: 1,
      name: '产品1',
      describe: 'a product',
    };
    const query = `
      mutation addProject($input:ProjectInput){
        addProject(input:$input){
          id
          user_id
          name
          describe
        }
      }
    `;
    const res = await app.httpRequest()
      .post('/graphql')
      .send({
        query,
        variables: {
          input: projectInput,
        },
      })
      .expect(200);
    assert.equal(res.body.data.addProject.user_id, projectInput.user_id);


  });
  it('should upload image', async () => {
    const fd = new FormData();
    const o = {
      query: `mutation ($file: Upload!) {
        uploadImage (file: $file)
      }`,
      variables: {
        file: null,
      },
    };
    const map = {
      0: [ 'variables.file' ],
    };
    fd.append('operations', JSON.stringify(o));
    fd.append('map', JSON.stringify(map));
    fd.append(0, fs.createReadStream(`${__dirname}/logo.svg`));


    const port = app.server.address().port;
    const res = await axios.post(`http://localhost:${port}/graphql`, fd, {
      headers: {
        ...fd.getHeaders(),
      },
    });
    assert.deepEqual(res.data,
      {
        data: {
          uploadImage: true,
        },
      }
    );

    /**
     * 以下写法发生错误
     * ```js
     * app.httpRequest().post("/graphql").send(fd).expect(200);
     * ```
     */
  });

  it('should return HELLO when use @upper directive', async () => {
    const query = `
    query{
      hello
    }
    `;
    const res = await app.httpRequest()
      .post('/graphql')
      .send({
        query,
      })
      .expect(200);
    assert.equal(res.body.data.hello, 'HELLO');
  });
});

describe('test subscription', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/subscription-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);
  it('should get data in subscription', async () => {
    /**
     * TODO 在调用httpRequest前使用app.server.address()返回null
     * may be egg bug
     */
    const res = app
      .httpRequest()
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);
    assert(res.type, 'text/html');

    const port = app.server.address().port;
    console.log('port', port);
    const link = createLink(port);
    const apolloClient = createApolloClient({ link, cache });

    return new Promise(async resolve => {
      apolloClient.subscribe({
        query: gql`
          subscription{
            commentAdded(repoFullName:"asd"){
                id
                content
              }
            }
          `,
        variables: {},
      }).subscribe({
        next(data) {
          assert.equal(data.data.commentAdded.id, 1);
          assert.equal(data.data.commentAdded.content, 'Hello!');
          resolve(data);
        },
        error(err) { console.error('err', err); },
      });

      await sleep(100);
      const data = await apolloClient.mutate({
        mutation: gql`
          mutation{
            sendComment
          }
        `,
      });
      assert.deepEqual(data, { data: { sendComment: true } });
    });

  });

});
