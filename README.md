# microcms-lib

## usage

Export the MicroCMS schema file and save it in a folder.  
Execute the command as follows to generate the TypeScript types.  
[microcms-typescript]<https://www.npmjs.com/package/microcms-typescript>

```sh
yarn add -D microcms-typescript
microcms-typescript test/schema test/types/cms-types.ts
```

Import the MicroCMS class and set the EndPoints.  

## Functions of the MicroCMS class

```ts
interface GetOptions<T> {
  draftKey?: string;
  fields?: ReadonlyArray<T>;
  depth?: number;
  globalKey?: boolean;
}
interface GetsOptions<T> {
  draftKey?: string;
  limit?: number;
  offset?: number;
  orders?: string;
  q?: string;
  fields?: T[];
  ids?: string;
  filters?: string;
  depth?: number;
  globalKey?: boolean;
}

// Constructor
constructor(options: {
    service: string;
    apiKey?: string;
    apiWriteKey?: string;
    apiGlobalKey?: string;
  })
// Get a single content
get(endpoint:string ,id: string,options: GetOptions) : Promise<Contents>
// Acquiring multiple contents
gets(endpoint:string ,id: string,options: GetsOptions) : Promise<{
  contents: Contents[];
  totalCount: number;
  offset: number;
  limit: number;
}>
// Create new content
post(endpoint: string,params: Contents) : Promise<ID>
// Create a new content with ID
put(endpoint: string, id: string, params: Contents) : Promise<ID>
// Rewriting content
patch(endpoint: string, id: string, params: Contents) : Promise<ID>
// Deleting content
del(id: string) : Promise<boolean>
```

## sample

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
        .del('contents', result.contents[i]['id'])
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
