'use strict';

const mock = require('egg-mock');
// TODO add test
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

  it('should GET /', () => {
    return (
      app
        .httpRequest()
        .get('/')
        // .expect('hi, app')
        .expect(200)
    );
  });
});
