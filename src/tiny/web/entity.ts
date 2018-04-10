interface BasicEntity {
  id: String;
  status: Number;
  createTime: String;
  updateTime: String;
  deleteTime: String;
}

export interface MenuItemEntity extends BasicEntity {
  name: String;
  path: String;

  root: String;
  leaf: String;

  childes: MenuItemEntity[]
}

export interface PermissionEntity extends BasicEntity {
  name: String;
  description: String;
}

export interface RoleEntity extends BasicEntity {
  name: String;
  priority: Number;
  description: String;
}