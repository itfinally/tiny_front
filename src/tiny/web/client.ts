import { Body, DELETE, Field, FormUrlEncoded, GET, HTTP, Path, POST } from "retrofitjs";
import { BasicResponse, ListResponse, retrofit, SingleResponse } from "@/tiny/web/basic";
import {
  AccessLogEntity,
  BasicEntity,
  DepartmentEntity,
  MenuItemEntity,
  PermissionEntity,
  RoleEntity
} from "@/tiny/web/entity";

class BasicClient<Entity extends BasicEntity> {
  @POST( "/query_by_conditions_is" )
  public queryByConditionsIs( @Body conditions: any ): ListResponse<Entity> {
  }

  @POST( "/count_by_conditions_is" )
  public countByConditionsIs( @Body conditions: any ): SingleResponse<Number> {
  }

  @POST( "/recover_by_id_is/:id" )
  public recoverByIdIs( @Path( "id" ) id: String ): BasicResponse {
  }

  @DELETE( "/remove_all_by_id_in" )
  public removeAllByIdIn( @Body ids: Array<String> ): BasicResponse {
  }

  @POST( "/recover_all_by_id_in" )
  public recoverAllByIdIn( @Body ids: Array<String> ): BasicResponse {
  }
}

@HTTP( "/menu" )
class MenuClient {

  @GET( "/get_menus" )
  public getMenus(): ListResponse<MenuItemEntity> {
  }

  @DELETE( "/remove_menus" )
  public removeMenus( @Body menuIds: Array<String> ): BasicResponse {
  }

  @POST( "/recover_menus" )
  public recoverMenus( @Body menuIds: Array<String> ): BasicResponse {
  }

  @FormUrlEncoded
  @POST( "/add_root_menu" )
  public addRootMenu( @Field( "name" ) name: String, @Field( "path" ) path: String,
                      @Field( "isLeaf" ) isLeaf: Boolean ): SingleResponse<MenuItemEntity> {
  }

  @FormUrlEncoded
  @POST( "/add_menu" )
  public addMenu( @Field( "name" ) name: String, @Field( "path" ) path: String,
                  @Field( "parentId" ) parentId: String, @Field( "isLeaf" ) isLeaf: Boolean ) {
  }

  @POST( "/add_roles_to_menu/:menuId" )
  public addRolesToMenu( @Path( "menuId" ) menuId: String, @Body roleIds: String[] ): BasicResponse {
  }

  @DELETE( "/remove_roles_from_menu/:menuId" )
  public removeRolesFromMenu( @Path( "menuId" ) menuId: String, @Body roleIds: String[] ): BasicResponse {
  }

  @FormUrlEncoded
  @POST( "/update_menu" )
  public updateMenu( @Field( "menuId" ) menuId: String, @Field( "name" ) name: String,
                     @Field( "path" ) path: String ): BasicResponse {
  }
}

@HTTP( "/permission" )
class PermissionClient extends BasicClient<PermissionEntity> {
  @FormUrlEncoded
  @POST( "/update/:id" )
  public update( @Path( "id" ) id: String, @Field( "status" ) status: Number,
                 @Field( "name" ) name: String, @Field( "description" )description: String ): BasicResponse {
  }

  @FormUrlEncoded
  @POST( "/add_permission" )
  public save( @Field( "name" ) name: String, @Field( "description" ) description: String, @Field( "status" ) status: Number ): BasicResponse {
  }

  @DELETE( "/remove_permission/:permissionId" )
  public removePermission( @Path( "permissionId" ) permissionId: String ): BasicResponse {
  }

  @GET( "/query_own_permissions" )
  public queryOwnPermissions(): ListResponse<PermissionEntity> {
  }
}

@HTTP( "/role" )
class RoleClient extends BasicClient<RoleEntity> {
  @FormUrlEncoded
  @POST( "/update/:id" )
  public update( @Path( "id" ) id: String, @Field( "status" ) status: Number, @Field( "name" ) name: String,
                 @Field( "description" ) description: String, @Field( "priority" ) priority: Number ): BasicResponse {
  }

  @FormUrlEncoded
  @POST( "/add_role" )
  public save( @Field( "name" ) name: String, @Field( "description" ) description: String,
               @Field( "status" ) status: Number, @Field( "priority" ) priority: Number ): BasicResponse {
  }

  @DELETE( "/remove_role/:roleId" )
  public removeRole( @Path( "roleId" ) roleId: String ): BasicResponse {
  }

  @GET( "/query_permissions_by_role_id_is/:roleId" )
  public queryPermissionsByRoleIdIs( @Path( "roleId" ) roleId: String ): ListResponse<PermissionEntity> {
  }

  @GET( "/query_available_assign_roles" )
  public queryAvailableAssignRoles(): ListResponse<RoleEntity> {
  }

  @POST( "/add_permissions_to_role/:roleId" )
  public addPermissionsToRole( @Path( "roleId" ) roleId: String, @Body permissionsIds: String[] ): BasicResponse {
  }

  @DELETE( "/remove_permissions_from_role/:roleId" )
  public removePermissionsFromRole( @Path( "roleId" ) roleId: String, @Body permissionsIds: String[] ): BasicResponse {
  }

  @GET( "/query_roles_by_menu_id_is/:menuId" )
  public queryRolesByMenuIdIs( @Path( "menuId" ) menuId: String ): ListResponse<RoleEntity> {
  }

  @GET( "/query_own_roles" )
  public queryOwnRoles(): ListResponse<RoleEntity> {
  }
}

@HTTP( "/department" )
class DepartmentClient extends BasicClient<DepartmentEntity> {
  @FormUrlEncoded
  @POST( "/update/:id" )
  public update( @Path( "id" ) id: String, @Field( "status" ) status: Number,
                 @Field( "name" ) name: String, @Field( "description" ) description: String ): BasicResponse {
  }

  @FormUrlEncoded
  @POST( "/add_department" )
  public save( @Field( "name" ) name: String, @Field( "description" ) description: String, @Field( "status" ) status: Number ): BasicResponse {
  }

  @DELETE( "/remove_department/:departmentId" )
  public removeDepartment( @Path( "departmentId" ) departmentId: String ): BasicResponse {
  }

  @POST( "/add_roles_to_department/:departmentId" )
  public addRolesToDepartment( @Path( "departmentId" ) departmentId: String, @Body roleIds: String[] ): BasicResponse {
  }

  @DELETE( "/remove_roles_from_department/:departmentId" )
  public removeRolesFromDepartment( @Path( "departmentId" ) departmentId: String, @Body roleIds: String[] ): BasicResponse {
  }

  @GET( "/query_roles_by_department_id_is/:departmentId" )
  public queryRolesByDepartmentIdIs( @Path( "departmentId" ) departmentId: String ): ListResponse<RoleEntity> {
  }
}

@HTTP( "/access_log" )
class AccessLogClient {
  @POST( "/query_by_conditions_is" )
  public queryByConditionsIs( @Body conditions: any ): ListResponse<AccessLogEntity> {
  }

  @POST( "/count_by_conditions_is" )
  public countByConditionsIs( @Body conditions: any ): SingleResponse<Number> {
  }
}

export let menuClient: MenuClient = retrofit.create( MenuClient );
export let roleClient: RoleClient = retrofit.create( RoleClient );
export let accessLogClient: AccessLogClient = retrofit.create( AccessLogClient );
export let departmentClient: DepartmentClient = retrofit.create( DepartmentClient );
export let permissionClient: PermissionClient = retrofit.create( PermissionClient );