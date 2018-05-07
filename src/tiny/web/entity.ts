export interface BasicEntity {
  id: string;
  status: Number;
  createTime: string;
  updateTime: string;
  deleteTime: string;
}

export interface MenuItemEntity extends BasicEntity {
  name: string;
  path: string;

  root: string;
  leaf: string;

  childes: MenuItemEntity[]
}

export interface PermissionEntity extends BasicEntity {
  name: string;
  description: string;
}

export interface RoleEntity extends BasicEntity {
  name: string;
  priority: Number;
  description: string;
}

export interface DepartmentEntity extends BasicEntity {
  name: string;
  description: string;
}

export interface AccessLogEntity extends BasicEntity {
  requestMethod: string;
  requestPath: string;
  sourceIp: string;
  username: string;

  exception: boolean;
  result: string;
}