import { CoreUtils } from "jcdt";
import {
  GLOBAL_CACHE, IS_RE_LOGIN, REQUEST_ADDRESS, ResponseStatusEnum, ROUTER_KEY, TOKEN,
  VUE_KEY
} from "@/tools/constant";
import { Body, Field, FormUrlEncoded, GET, HTTP, Path, POST } from "retrofitjs";
import retrofit from "./retrofit";
import {
  CollectionResponsePromise, MenuItemEntity, PermissionEntity, RoleEntity, SingleResponsePromise,
  UserDetailsEntity
} from "@/tools/vo";
import { AxiosResponse } from "axios";

export async function authentication( account: string, password: String, validCode?: string,
                                      successFunc = () => null, failFunc = () => null ) {
  let baseContent = `${account}:${password}`,

    response: AxiosResponse<any> = await retrofit.getEngine().post<any>( `${REQUEST_ADDRESS}/verifies/login`, {
      "validCode": validCode
    }, {
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${CoreUtils.base64Encoder( baseContent )}`
      }
    } );

  let content: any = response.data;

  if ( response.status !== ResponseStatusEnum.SUCCESS.statusCode ) {
    GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": "登陆失败, 请查看控制台了解更多信息" } );
    console.warn( content );
    return;
  }

  if ( content.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
    GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": `登录失败, ${content.message}` } );
    failFunc();
    return;
  }

  // save token
  localStorage.setItem( TOKEN, content.result );

  // go back if reLogin is true
  if ( GLOBAL_CACHE.get( IS_RE_LOGIN ) ) {
    GLOBAL_CACHE.remove( IS_RE_LOGIN );
    GLOBAL_CACHE.get( ROUTER_KEY ).go( -1 );
    return;
  }

  successFunc();
  GLOBAL_CACHE.get( ROUTER_KEY ).replace( { "path": "/index" } );
}


/// Http client declare
@HTTP( "/menu" )
class MenuClient {

  @FormUrlEncoded
  @POST( "/added_root_menu" )
  public addRootMenu( @Field( "name" ) name: string, @Field( "isLeaf" ) isLeaf: boolean ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/added_menu" )
  public addMenu( @Field( "parentId" ) parentId: string, @Field( "name" ) name: string,
                  @Field( "path" ) path: string, @Field( "isLeaf" ) isLeaf: boolean ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/remove_menu_item" )
  public removeMenuItem( @Field( "itemId" ) itemId: string ): SingleResponsePromise<number> {
  }

  @POST( "/remove_multi_menu_item" )
  public removeMultiMenuItem( @Body itemIds: string[] ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/recover_menu_item" )
  public recoverMenuItem( @Field( "itemId" ) itemId: string ): SingleResponsePromise<number> {
  }

  @POST( "/recover_menu_multi_item" )
  public recoverMenuMultiItem( @Body itemIds: string[] ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/update_menu" )
  public updateMenu( @Field( "menuId" ) menuId: string, @Field( "name" ) name: string,
                     @Field( "path" ) path: string ): SingleResponsePromise<number> {
  }

  @GET( "/get_menu_tree" )
  public getMenuTree(): CollectionResponsePromise<MenuItemEntity> {
  }
}

@HTTP( "/role_menu" )
class MenuRoleClient {

  @GET( "/query_menu_item_roles/:menuId" )
  public queryMenuItemRoles( @Path( "menuId" ) menuId: string ): CollectionResponsePromise<RoleEntity> {
  }

  @GET( "/query_available_role/:menuId" )
  public queryAvailableRole( @Path( "menuId" ) menuId: string ): CollectionResponsePromise<RoleEntity> {
  }

  @POST( "/add_role_menu/:menuItemId" )
  public addRoleMenu( @Path( "menuItemId" ) menuItemId: string, @Body roleIds: string[] ): SingleResponsePromise<number> {
  }

  @POST( "/remove_role_menu/:menuItemId" )
  public removeRoleMenu( @Path( "menuItemId" ) menuItemId: string, @Body roleIds: string[] ): SingleResponsePromise<number> {
  }
}

@HTTP( "/authorization" )
class AuthorizationClient {

  @FormUrlEncoded
  @POST( "/add_permission" )
  public addPermission( @Field( "name" ) name: string, @Field( "description" ) description: string ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/add_role" )
  public addRole( @Field( "name" ) name: string, @Field( "description" ) description: string,
                  @Field( "priority" )priority: string ): SingleResponsePromise<number> {
  }

  @POST( "/grant_role_to/:authorityId" )
  public grantRolesTo( @Path( "authorityId" ) authorityId: string, @Body roleIds: string[] ): SingleResponsePromise<number> {
  }

  @POST( "/grant_permission_to/:roleId" )
  public grantPermissionsTo( @Path( "roleId" ) roleId: string, @Body permissionIds: string[] ): SingleResponsePromise<number> {
  }
}

@HTTP( "/user" )
class UserDetailClient {

  @FormUrlEncoded
  @POST( "/query_by_multi_condition" )
  public queryByMultiCondition( @Field( "createStartTime" ) createStartTime: number, @Field( "createEndingTime" ) createEndingTime: number,
                                @Field( "updateStartTime" ) updateStartTime: number, @Field( "updateEndingTime" ) updateEndingTime: number,
                                @Field( "status" ) status: number, @Field( "nickname" ) nickname: string, @Field( "id" ) id: string,
                                @Field( "page" ) page: number, @Field( "row" ) row: number ): CollectionResponsePromise<UserDetailsEntity> {
  }

  @FormUrlEncoded
  @POST( "/count_by_multi_condition" )
  public countByMultiCondition( @Field( "createStartTime" ) createStartTime: number, @Field( "createEndingTime" ) createEndingTime: number,
                                @Field( "updateStartTime" ) updateStartTime: number, @Field( "updateEndingTime" ) updateEndingTime: number,
                                @Field( "status" ) status: number, @Field( "nickname" ) nickname: string,
                                @Field( "id" ) id: string ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/update_user_detail" )
  public updateUserDetail( @Field( "id" ) id: string, @Field( "status" ) status: number,
                           @Field( "name" ) name: string ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/update_user_status/:status" )
  public updateUserStatus( @Body userIds: string[], @Path( "status" ) status: number ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/register" )
  public register( @Field( "user" ) user: string ): SingleResponsePromise<number> {
  }

  @GET( "/get_own_details" )
  public getOwnDetails(): SingleResponsePromise<UserDetailsEntity> {
  }

  @GET( "/get_own_roles" )
  public getOwnRoles(): CollectionResponsePromise<RoleEntity> {
  }

  @GET( "/get_own_permissions" )
  public getOwnPermissions(): CollectionResponsePromise<PermissionEntity> {
  }
}

@HTTP( "/permission" )
class PermissionClient {

  @FormUrlEncoded
  @POST( "/query_by_multi_condition" )
  public queryByMultiCondition( @Field( "createStartTime" ) createStartTime: number, @Field( "createEndingTime" ) createEndingTime: number,
                                @Field( "updateStartTime" ) updateStartTime: number, @Field( "updateEndingTime" ) updateEndingTime: number,
                                @Field( "status" ) status: number, @Field( "id" ) id: string,
                                @Field( "page" ) page: number, @Field( "row" ) row: number ): CollectionResponsePromise<PermissionEntity> {
  }

  @FormUrlEncoded
  @POST( "/count_by_multi_condition" )
  public countByMultiCondition( @Field( "createStartTime" ) createStartTime: number, @Field( "createEndingTime" ) createEndingTime: number,
                                @Field( "updateStartTime" ) updateStartTime: number, @Field( "updateEndingTime" ) updateEndingTime: number,
                                @Field( "status" ) status: number, @Field( "id" ) id: string ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/update_permission_detail" )
  public updatePermissionDetail( @Field( "id" ) id: string, @Field( "name" ) name: string,
                                 @Field( "description" ) description: string, @Field( "status" ) status: number ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/update_permission_status/:status" )
  public updatePermissionStatus( @Body permissionIds: string[], @Path( "status" ) status: number ): SingleResponsePromise<number> {
  }

  @GET( "/get_permissions" )
  public getPermissions(): CollectionResponsePromise<PermissionEntity> {
  }

  @GET( "/get_specific_role_permissions/:roleId" )
  public getSpecificRolePermissions( @Path( "roleId" ) roleId: string ): CollectionResponsePromise<PermissionEntity> {
  }
}

@HTTP( "/role" )
class RoleClient {

  @FormUrlEncoded
  @POST( "/query_by_multi_condition" )
  public queryByMultiCondition( @Field( "createStartTime" ) createStartTime: number, @Field( "createEndingTime" ) createEndingTime: number,
                                @Field( "updateStartTime" ) updateStartTime: number, @Field( "updateEndingTime" ) updateEndingTime: number,
                                @Field( "status" ) status: number, @Field( "id" ) id: string,
                                @Field( "page" ) page: number, @Field( "row" ) row: number ): CollectionResponsePromise<RoleEntity> {
  }

  @FormUrlEncoded
  @POST( "/count_by_multi_condition" )
  public countByMultiCondition( @Field( "createStartTime" ) createStartTime: number, @Field( "createEndingTime" ) createEndingTime: number,
                                @Field( "updateStartTime" ) updateStartTime: number, @Field( "updateEndingTime" ) updateEndingTime: number,
                                @Field( "status" ) status: number, @Field( "id" ) id: string ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/update_role_detail" )
  public updateRoleDetail( @Field( "id" ) id: string, @Field( "name" ) name: string,
                           @Field( "description" ) description: string, @Field( "priority" ) priority: string,
                           @Field( "status" ) status: number ): SingleResponsePromise<number> {
  }

  @FormUrlEncoded
  @POST( "/update_role_status/:status" )
  public updateRoleStatus( @Body roleIds: string[], @Path( "status" ) status: number ): SingleResponsePromise<number> {
  }

  @GET( "/get_roles" )
  public getRoles(): CollectionResponsePromise<RoleEntity> {
  }

  @GET( "/get_specific_user_roles/:userId" )
  public getSpecificUserRoles( @Path( "userId" ) userId: string ): CollectionResponsePromise<RoleEntity> {
  }
}

let
  menuClient: MenuClient = retrofit.create( MenuClient ),
  menuRoleClient: MenuRoleClient = retrofit.create( MenuRoleClient ),
  userDetailClient: UserDetailClient = retrofit.create( UserDetailClient ),
  authorizationClient: AuthorizationClient = retrofit.create( AuthorizationClient ),
  permissionClient: PermissionClient = retrofit.create( PermissionClient ),
  roleClient: RoleClient = retrofit.create( RoleClient );

export {
  menuClient, menuRoleClient, userDetailClient, authorizationClient,
  permissionClient, roleClient
};