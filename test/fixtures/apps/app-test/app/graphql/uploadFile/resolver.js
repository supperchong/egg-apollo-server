'use strict';
const fs = require('fs');
module.exports = {
  Mutation: {
    uploadImage: async (root, { file }) => {
      const { createReadStream, filename } = await file;
      const stream = createReadStream();
      return await new Promise((resolve, reject) => {
        stream.pipe(fs.createWriteStream('./' + filename));
        stream.on('end', () => {
          resolve(true);
        });
        stream.on('error', err => {
          reject(err);
        });
      });


      // console.log(stream);
      // return true;
    },
  },
}
;
