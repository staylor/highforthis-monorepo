import database from '../../src/database';
import Post from '../../src/models/Post';

const { db } = await database();
const model = new Post({ db });
const posts = await model.all({});

for (const post of posts) {
  const id = String(post._id);

  await model.updateById(id, post);
}

process.exit(0);
