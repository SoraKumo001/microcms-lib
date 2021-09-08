type Reference<T, R> = T extends 'get' ? R : string | null;
type DateType = {
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
};

type Structure<T, P> = T extends 'get'
  ? { id: string } & DateType & Required<P>
  : Partial<DateType> & (T extends 'patch' ? Partial<P> : P);

export type users<T='get'> = Structure<
T,
{
  /**
   * ユーザ名
   */
  name: string
  /**
   * メールアドレス
   */
  email: string
  /**
   * 有効
   */
  enable: boolean
}>

export type keywords<T='get'> = Structure<
T,
{
  /**
   * キーワード
   */
  name: string
}>

export type contents<T='get'> = Structure<
T,
{
  /**
   * タイトル
   */
  title: string
  /**
   * 表示
   */
  visible?: boolean
  /**
   * キーワード
   */
  keyword?: Reference<T,unknown>[]
  /**
   * 親記事
   */
  parent?: Reference<T,unknown | null>
  /**
   * 本文
   */
  body?: string
}>


export interface EndPoints {
  get: {
    users: users<'get'>
    keywords: keywords<'get'>
    contents: contents<'get'>
  }
  post: {
    users: users<'post'>
    keywords: keywords<'post'>
    contents: contents<'post'>
  }
  put: {
    users: users<'put'>
    keywords: keywords<'put'>
    contents: contents<'put'>
  }
  patch: {
    users: users<'patch'>
    keywords: keywords<'patch'>
    contents: contents<'patch'>
  }
}
