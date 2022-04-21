import type { EndPoints } from './types/cms-types';
import { MicroCMS } from '../src/index';
import { config } from 'dotenv';
import { promiseLimit } from '@node-libraries/promise-limit';

config(); // .env

const cms = new MicroCMS<EndPoints>({
  service: process.env.SERVICE!,
  apiKey: process.env.APIKEY,
  apiWriteKey: process.env.APIKEY_WRITE,
  apiGlobalKey: process.env.APIKEY_GLOBAL,
});

const cms2 = new MicroCMS<EndPoints>({
  service: process.env.SERVICE!,
  apiKey: process.env.APIKEY + 'a',
  apiWriteKey: process.env.APIKEY_WRITE + 'a',
  apiGlobalKey: process.env.APIKEY_GLOBAL + 'a',
});

const ParallelLimit = 5; //最大並列数

const main = async () => {
  const parallels = promiseLimit();

  // 10 write tests
  console.log('\n-- write --');
  for (let i = 0; i < 10; i++) {
    parallels.add(
      cms.post('contents', { title: 'データ' + i }).then((id) => console.log(`id:${id}`))
    );
    await parallels.wait(ParallelLimit);
  }
  await parallels.all();

  const result = await cms.gets('contents', {
    limit: 10000,
    fields: ['id', 'title'],
    orders: 'createdAt',
  });
  if (result) {
    const { totalCount, contents } = result;
    console.log(`\n-- read: ${contents.length}/${totalCount} --`);
    contents.forEach(({ id, title }) => {
      console.log(title, id);
    });
  }

  // batch deletion
  console.log('\n-- delete --');
  if (result) {
    for (let i = 0; i < result.contents.length; i++) {
      parallels.add(
        cms
          .del('contents', result.contents[i]['id'])
          .then((v) => (v ? console.log(`削除:${result.contents[i]['id']}`) : false))
      );
      await parallels.wait(ParallelLimit);
    }
    await parallels.all();
  }

  console.log('\n-- 404 ---');
  console.log(await cms.get2('contentsa' as never, 'abc'));
  console.log(await cms.gets2('contentsa' as never));

  console.log('\n-- Bad key ---');
  console.log(await cms2.get2('contents', '21amfa23d6'));
  console.log(await cms2.gets2('contents'));
};
main();
