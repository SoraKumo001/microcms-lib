# microcms-lib

## usage

Export the MicroCMS schema file and save it in a folder.  
Execute the command as follows to generate the TypeScript types.  

```sh
yarn add -D microcms-typescript
microcms-typescript test/schema test/types/cms-types.ts
```

Import the MicroCMS class and set the EndPoints.  

```ts
import type { EndPoints } from './types/cms-types';
import { MicroCMS } from '../src/index';
import { config } from 'dotenv';

config(); // .env

const cms = new MicroCMS<EndPoints>({
  service: process.env.SERVICE!,
  apiKey: process.env.APIKEY,
  apiWriteKey: process.env.APIKEY_WRITE,
  apiGlobalKey: process.env.APIKEY_GLOBAL,
});

const main = async () => {
  // 10 write tests
  for (let i = 0; i < 10; i++) {
    await cms.post('contents', { title: 'Write' + i }).then((id) => console.log(`id:${id}`));
  }

  // loading content
  const result = await cms.gets('contents', {
    limit: 10000,
    fields: ['id', 'title'],
    orders: 'createdAt',
  });
  if (result) {
    const { totalCount, contents } = result;
    console.log(`Acquisition data: ${contents.length}/${totalCount}`);
    contents.forEach(({ id, title }) => {
      console.log(id, title);
    });
  }

  // batch deletion
  if (result)
    for (let i = 0; i < result.contents.length; i++) {
      const ps = new Set();
      const p = cms
        .delete('contents', result.contents[i]['id'])
        .then((v) => (v ? console.log(i) : false));
      ps.add(p);
      if (ps.size > 20) {
        await Promise.all(ps);
        ps.clear();
      }
    }
};
main();
```
