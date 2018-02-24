import { RetrofitPromise } from "retrofitjs";

interface BaseResponseEntity<Entity extends BaseResponseEntity<Entity>> {
  message: string;
  statusCode: number;
}

interface CollectionResponseEntity<T> extends BaseResponseEntity<SingleResponseEntity<T>> {
  result: T[];
}

interface SingleResponseEntity<T> extends BaseResponseEntity<SingleResponseEntity<T>> {
  result: T;
}

type CollectionResponsePromise<T = any> = RetrofitPromise<CollectionResponseEntity<T>>;
type SingleResponsePromise<T = any> = RetrofitPromise<SingleResponseEntity<T>>;

interface BaseEntity {
  id: string;
  status: number;
  createTime: number;
  updateTime: number;
  deleteTime: number;
}


interface MenuItemEntity extends BaseEntity {
  name: string;
  path: string;

  isLeaf: boolean;
  isRoot: boolean;

  childes: MenuItemEntity[];
}


interface RoleEntity extends BaseEntity {
  name: string;
  priority: number;
  description: string;
}


interface PermissionEntity extends BaseEntity {
  name: string;
  description: string;
}


interface UserDetailsEntity extends BaseEntity {
  account: string;
  nickname: string;
  authorityId: string;
}

export {
  BaseResponseEntity, CollectionResponsePromise, SingleResponsePromise,
  CollectionResponseEntity, SingleResponseEntity,

  MenuItemEntity, RoleEntity, UserDetailsEntity, PermissionEntity
}