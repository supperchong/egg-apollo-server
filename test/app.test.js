'use strict';

const mock = require('egg-mock');
const assert = require('assert');
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
});
