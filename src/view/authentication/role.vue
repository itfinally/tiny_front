<template>
    <Row>
        <MultiFunctionTable ref="table" :columns="table.columns" :data="table.data" :total="table.total"
                            :canNew="this.security.write" :canDelete="this.security.write"

                            @on-data-loading="beforeQuery" @on-data-insert="beforeCreateRole"
                            @on-data-delete="removeAllRole"/>

        <Modal title="修改权限信息" v-model="roleUpdateModal.isShowModal" @on-ok="modifyRole">
            <Form>
                <FormItem label="角色名" :label-width="60">
                    <Input v-model="roleUpdateModal.name" type="text" placeholder="角色名"/>
                </FormItem>
                <FormItem label="角色描述" :label-width="60">
                    <Input v-model="roleUpdateModal.description" type="text" placeholder="角色描述"/>
                </FormItem>
                <FormItem label="角色级别" :label-width="60">
                    <Input v-model="roleUpdateModal.priority" type="text" placeholder="角色级别"/>
                </FormItem>
                <FormItem label="角色状态" :label-width="60">
                    <Select v-model="roleUpdateModal.status" style="width: 6rem;">
                        <Option v-for="item in statusList.slice( 0, 2 )" :value="item.status" :key="item.name">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
            </Form>
        </Modal>

        <Modal title="新增权限" v-model="roleSaveModal.isShowModal" @on-ok="saveRoleModal" @on-cancel="roleSaveModalCancel">
            <Form ref="roleSaveModal" :model="roleSaveModal" :rules="roleSaveModal.rules" :label-width="80">
                <FormItem label="角色名" prop="name" style="height: 3rem;">
                    <Input v-model="roleSaveModal.name" type="text" placeholder="角色名"/>
                </FormItem>
                <FormItem label="角色描述" prop="description" style="height: 3rem;">
                    <Input v-model="roleSaveModal.description" type="text" placeholder="角色描述"/>
                </FormItem>
                <FormItem label="角色级别" prop="priority" style="height: 3rem;">
                    <Input v-model="roleSaveModal.priority" type="text" placeholder="角色级别"/>
                </FormItem>
            </Form>
        </Modal>

        <Modal title="权限分配" v-model="permissionModal.isShowModal" @on-ok="modifyRolePermission">
            <Transfer :data="permissionModal.permissions" :targetKeys="permissionModal.existPermission"
                      :list-style="{ width: '215px' }" :titles="['权限列表', '角色权限']"
                      @on-change="onPermissionChange">
            </Transfer>
        </Modal>
    </Row>
</template>

<script>
  import MultiFunctionTable from "@/component/ui/multi_function_table";
  import MultiFunctionTableComponent from "@/component/multi_function_table_component";

  import { ResponseStatusEnum, DataStatusEnum } from "@/tools/constant";
  import { roleClient, permissionClient, authorizationClient } from "@/rest/client";

  import { Dates, StringUtils } from "jcdt";

  export default {
    extends: MultiFunctionTableComponent,
    components: { MultiFunctionTable },
    data() {
      return {
        security: {
          write: false
        },

        roleUpdateModal: {
          isShowModal: false,
          data: null,

          id: "",
          name: "",
          status: 0,
          priority: "",
          description: ""
        },

        roleSaveModal: {
          isShowModal: false,

          name: "",
          priority: "",
          description: "",

          rules: {
            name: [ { required: true, message: "请填写角色名" } ],
            priority: [ { required: true, message: "请填写角色级别" } ],
            description: [ { required: true, message: "请填写角色描述" } ],
          }
        },

        permissionModal: {
          isShowModal: false,

          roleId: "",
          permissions: [],
          existPermission: []
        },

        table: {
          columns: ( () => {
            let columns = [ {
              type: "selection",
              align: "center",
              width: 60
            }, {
              title: "id",
              key: "id"
            }, {
              title: "创建时间",
              key: "createTime"
            }, {
              title: "修改时间",
              key: "updateTime"
            }, {
              title: "删除时间",
              key: "deleteTime"
            }, {
              title: "状态",
              key: "statusName"
            }, {
              title: "角色名",
              key: "name"
            }, {
              title: "角色描述",
              key: "description"
            }, {
              title: "角色优先级",
              key: "priority"
            } ];

            this.isForbidden( "role_write" ).then( isTrue => {
              if ( isTrue ) {
                return;
              }

              columns.push( {
                title: "操作",
                key: "action",
                fixed: "right",
                render: ( h, args ) => {
                  let row = args.row,
                    nextStatus = DataStatusEnum.DELETE.status === row.status
                      ? DataStatusEnum.NORMAL.status
                      : DataStatusEnum.DELETE.status;

                  return h( "Row", [
                    h( "Button", {
                      props: {
                        type: "text",
                        size: "small"
                      },
                      on: { click: () => this.changeRoleStatus( row, nextStatus ) }
                    }, DataStatusEnum.DELETE.status === row.status ? "恢复" : "删除" ),
                    h( "Button", {
                      props: {
                        type: "text",
                        size: "small"
                      },
                      on: {
                        click: () => {
                          let modal = this.roleUpdateModal;
                          modal.isShowModal = true;
                          modal.data = row;

                          modal.id = row.id;
                          modal.name = row.name;
                          modal.status = row.status;
                          modal.priority = row.priority;
                          modal.description = row.description;
                        }
                      }
                    }, "修改" ),
                    h( "Button", {
                      props: {
                        type: "text",
                        size: "small"
                      },
                      on: {
                        click: async () => {
                          let modal = this.permissionModal;
                          modal.isShowModal = true;
                          modal.roleId = row.id;

                          let permission = ( await permissionClient.getPermissions() ).data.result,
                            existPermission = ( await permissionClient.getSpecificRolePermissions( row.id ) ).data.result;

                          modal.existPermission = existPermission.map( item => item.id );
                          modal.permissions = permission.map( item => {
                            return {
                              key: item.id,
                              label: item.name,
                              description: item.description
                            };
                          } );
                        }
                      }
                    }, "修改角色权限" )
                  ] );
                }
              } );
            } );

            return columns;
          } )(),

          data: [],
          total: 0
        }
      };
    },
    async mounted() {
      this.tableInitializer( "table" );
      this.security.write = !( await this.isForbidden( "role_write" ) );
    },
    methods: {
      beforeUrlUpdate( expressionMetadata ) {
        return `/index/auth/role/${expressionMetadata}`;
      },

      async query( page, range, condition ) {
        let table = this.table,

          createStartTime = this.getMillisFromDatePicker( condition.createStartTime ),
          createEndingTime = this.getMillisFromDatePicker( condition.createEndingTime ),
          updateStartTime = this.getMillisFromDatePicker( condition.updateStartTime ),
          updateEndingTime = this.getMillisFromDatePicker( condition.updateEndingTime ),

          id = condition.id,
          status = condition.status,

          role = ( await roleClient.queryByMultiCondition(
            createStartTime, createEndingTime, updateStartTime, updateEndingTime,
            status, id, page - 1, range
          ) ).data.result;

        let response = ( await roleClient.countByMultiCondition(
          createStartTime, createEndingTime, updateStartTime,
          updateEndingTime, status, id
        ) ).data;

        if ( response.statusCode === ResponseStatusEnum.SUCCESS.statusCode ) {
          table.isTimeToCount = false;
          table.total = response.result;
        }

        table.data = role.map( item => {
          return {
            id: item.id,
            status: item.status,
            statusName: DataStatusEnum.getNameByStatus( item.status ),
            createTime: Dates.toLocalDateTimeString( item.createTime ),
            updateTime: Dates.toLocalDateTimeString( item.updateTime ),
            deleteTime: item.deleteTime <= 0 ? "" : Dates.toLocalDateTimeString( item.deleteTime ),
            name: item.name,
            priority: item.priority,
            description: item.description
          };
        } );
      },

      async modifyRole() {
        if ( await this.isForbidden( "role_write", true ) ) {
          return;
        }

        let modal = this.roleUpdateModal,
          row = modal.data;

        if ( StringUtils.isBlank( modal.name ) ) {
          this.$Message.warning( { "content": "请输入角色名" } );
          modal.isShowModal = true;
          return;
        }

        if ( StringUtils.isBlank( modal.description ) ) {
          this.$Message.warning( { "content": "请输入角色描述" } );
          modal.isShowModal = true;
          return;
        }

        if ( StringUtils.isBlank( modal.priority ) ) {
          this.$Message.warning( { "content": "请输入角色级别" } );
          setTimeout( () => modal.isShowModal = true, 0 );
          return;
        }

        if ( !/^\d+$/.test( modal.priority ) ) {
          this.$Message.warning( { "content": "角色级别只能用正整数表示" } );
          setTimeout( () => modal.isShowModal = true, 0 );
          return;
        }

        if ( !DataStatusEnum.contains( modal.status ) ) {
          this.$Message.warning( { "content": "请选择角色状态" } );
          modal.isShowModal = true;
          return;
        }

        let response = ( await roleClient.updateRoleDetail( modal.id, modal.name, modal.description, modal.priority, modal.status ) ).data;
        if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
          this.$Message.error( { "content": `更新失败 -> ${response.message}` } );
          return;
        }

        row.name = modal.name;
        row.status = modal.status;
        row.priority = modal.priority;
        row.description = modal.description;
        row.statusName = DataStatusEnum.getNameByStatus( modal.status );

        row.deleteTime = modal.status !== DataStatusEnum.DELETE.status
          ? ""
          : Dates.toLocalDateTimeString( ( Date.now || new Date().getTime )() );

        this.$Message.success( { "content": "更新成功" } );
      },

      beforeCreateRole() {
        this.roleSaveModal.isShowModal = true;
      },

      async saveRoleModal() {
        if ( await this.isForbidden( "role_write", true ) ) {
          return;
        }

        let modal = this.roleSaveModal,
          description = modal.description,
          priority = modal.priority,
          name = modal.name;

        if ( StringUtils.isBlank( name ) ) {
          this.$Message.warning( { "content": "请输入角色名" } );
          setTimeout( () => modal.isShowModal = true, 0 );
          return;
        }

        if ( StringUtils.isBlank( description ) ) {
          this.$Message.warning( { "content": "请输入角色描述" } );
          setTimeout( () => modal.isShowModal = true, 0 );
          return;
        }

        if ( StringUtils.isBlank( priority ) ) {
          this.$Message.warning( { "content": "请输入角色级别" } );
          setTimeout( () => modal.isShowModal = true, 0 );
          return;
        }

        if ( !/^\d+$/.test( priority ) ) {
          this.$Message.warning( { "content": "角色级别只能用正整数表示" } );
          setTimeout( () => modal.isShowModal = true, 0 );
          return;
        }

        let response = ( await authorizationClient.addRole( name, description, priority ) ).data;

        if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
          this.$Message.error( { "content": `创建失败 -> ${response.data.message}` } );

        } else {
          this.$Message.success( { "content": "创建成功" } );
          this.refresh( "table" );
        }

        this.roleSaveModalCancel();
      },

      roleSaveModalCancel() {
        this.$refs[ "roleSaveModal" ].resetFields();
      },

      async changeRoleStatus( row, status ) {
        if ( await this.isForbidden( "role_write", true ) ) {
          return;
        }

        this.changeStatus( row, status,
          () => roleClient.updateRoleDetail( row.id, row.name, row.description, row.priority, status ) );
      },

      async removeAllRole( selected ) {
        if ( await this.isForbidden( "role_write", true ) ) {
          return;
        }

        if ( selected.length <= 0 ) {
          this.$Message.warning( { "content": "请选择要删除的角色" } );
          return;
        }

        let roleIds = selected.map( item => item.id );
        this.removeAll( "table", "table", selected,
          () => roleClient.updateRoleStatus( roleIds, DataStatusEnum.DELETE.status ) );
      },

      onPermissionChange( targetKeys ) {
        this.permissionModal.existPermission = targetKeys;
      },

      async modifyRolePermission() {
        if ( await this.isForbidden( "role_write", true ) ) {
          return;
        }

        let modal = this.permissionModal,
          response = ( await authorizationClient.grantPermissionsTo( modal.roleId, modal.existPermission ) ).data;

        response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode
          ? this.$Message.error( { "content": `保存失败 -> ${response.message}` } )
          : this.$Message.success( { "content": "保存成功" } );
      }
    }
  }
</script>