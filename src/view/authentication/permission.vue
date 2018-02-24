<template>
    <Row>
        <MultiFunctionTable ref="table" :columns="table.columns" :data="table.data" :total="table.total"
                            :canNew="this.security.write" :canDelete="this.security.write"

                            @on-data-loading="beforeQuery" @on-data-insert="beforeCreatePermission"
                            @on-data-delete="removeAllPermission"/>

        <Modal title="修改权限信息" v-model="permissionUpdateModal.isShowModal" @on-ok="modifyPermission">
            <Form>
                <FormItem label="权限名" :label-width="60">
                    <Input v-model="permissionUpdateModal.name" type="text" placeholder="权限名"/>
                </FormItem>
                <FormItem label="权限描述" :label-width="60">
                    <Input v-model="permissionUpdateModal.description" type="text" placeholder="权限描述"/>
                </FormItem>
                <FormItem label="权限状态" :label-width="60">
                    <Select v-model="permissionUpdateModal.status" style="width: 6rem;">
                        <Option v-for="item in statusList.slice( 0, 2 )" :value="item.status" :key="item.name">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
            </Form>
        </Modal>

        <Modal title="新增权限" v-model="permissionSaveModal.isShowModal"
               @on-ok="savePermissionModal" @on-cancel="permissionSaveModalCancel">
            <Form ref="permissionSaveModal" :model="permissionSaveModal" :rules="permissionSaveModal.rules"
                  :label-width="80">
                <FormItem label="权限名" prop="name" style="height: 3rem;">
                    <Input v-model="permissionSaveModal.name" type="text" placeholder="权限名"/>
                </FormItem>
                <FormItem label="权限描述" prop="description" style="height: 3rem;">
                    <Input v-model="permissionSaveModal.description" type="text" placeholder="权限描述"/>
                </FormItem>
            </Form>
        </Modal>
    </Row>
</template>

<script>
  import MultiFunctionTable from "@/component/ui/multi_function_table";
  import MultiFunctionTableComponent from "@/component/multi_function_table_component";

  import { Dates, StringUtils } from "jcdt"
  import { DataStatusEnum, ResponseStatusEnum } from "@/tools/constant";
  import { authorizationClient, permissionClient } from "@/rest/client";

  export default {
    extends: MultiFunctionTableComponent,
    components: { MultiFunctionTable },
    data() {
      return {
        security: {
          write: false
        },

        permissionUpdateModal: {
          isShowModal: false,
          data: null,

          id: "",
          name: "",
          status: 0,
          description: ""
        },

        permissionSaveModal: {
          isShowModal: false,

          name: "",
          description: "",

          rules: {
            name: [ { required: true, message: "请填写权限名" } ],
            description: [ { required: true, message: "请填写权限描述" } ],
          }
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
              title: "权限名",
              key: "name"
            }, {
              title: "描述",
              key: "description"
            } ];

            this.isForbidden( "permission_write" ).then( isTrue => {
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
                      on: { click: () => this.changePermissionStatus( row, nextStatus ) }
                    }, DataStatusEnum.DELETE.status === row.status ? "恢复" : "删除" ),
                    h( "Button", {
                      props: {
                        type: "text",
                        size: "small"
                      },
                      on: {
                        click: () => {
                          let modal = this.permissionUpdateModal;
                          modal.isShowModal = true;
                          modal.data = row;

                          modal.id = row.id;
                          modal.name = row.name;
                          modal.status = row.status;
                          modal.description = row.description;
                        }
                      }
                    }, "修改" )
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
      this.security.write = !( await this.isForbidden( "permission_write" ) );
    },
    methods: {
      beforeUrlUpdate( expressionMetadata ) {
        return `/index/auth/permission/${expressionMetadata}`;
      },

      async query( page, range, condition ) {
        let table = this.table,

          createStartTime = this.getMillisFromDatePicker( condition.createStartTime ),
          createEndingTime = this.getMillisFromDatePicker( condition.createEndingTime ),
          updateStartTime = this.getMillisFromDatePicker( condition.updateStartTime ),
          updateEndingTime = this.getMillisFromDatePicker( condition.updateEndingTime ),

          id = condition.id,
          status = condition.status,

          permission = ( await permissionClient.queryByMultiCondition(
            createStartTime, createEndingTime, updateStartTime, updateEndingTime,
            status, id, page - 1, range
          ) ).data.result;

        let response = ( await permissionClient.countByMultiCondition(
          createStartTime, createEndingTime, updateStartTime,
          updateEndingTime, status, id
        ) ).data;

        if ( response.statusCode === ResponseStatusEnum.SUCCESS.statusCode ) {
          table.isTimeToCount = false;
          table.total = response.result;
        }

        table.data = permission.map( item => {
          return {
            id: item.id,
            status: item.status,
            statusName: DataStatusEnum.getNameByStatus( item.status ),
            createTime: Dates.toLocalDateTimeString( item.createTime ),
            updateTime: Dates.toLocalDateTimeString( item.updateTime ),
            deleteTime: item.deleteTime <= 0 ? "" : Dates.toLocalDateTimeString( item.deleteTime ),
            name: item.name,
            description: item.description
          };
        } );
      },

      async modifyPermission() {
        if ( await this.isForbidden( "permission_write", true ) ) {
          return;
        }

        let modal = this.permissionUpdateModal,
          row = modal.data;

        if ( StringUtils.isBlank( modal.name ) ) {
          this.$Message.warning( { "content": "请输入权限名" } );
          modal.isShowModal = true;
          return;
        }

        if ( StringUtils.isBlank( modal.description ) ) {
          this.$Message.warning( { "content": "请输入权限描述" } );
          modal.isShowModal = true;
          return;
        }

        if ( !DataStatusEnum.contains( modal.status ) ) {
          this.$Message.warning( { "content": "请选择权限状态" } );
          modal.isShowModal = true;
          return;
        }

        let response = ( await permissionClient.updatePermissionDetail( modal.id, modal.name, modal.description, modal.status ) ).data;
        if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
          this.$Message.error( { "content": `更新失败 -> ${response.message}` } );
          return;
        }

        row.name = modal.name;
        row.status = modal.status;
        row.description = modal.description;
        row.statusName = DataStatusEnum.getNameByStatus( modal.status );

        row.deleteTime = modal.status !== DataStatusEnum.DELETE.status
          ? ""
          : Dates.toLocalDateTimeString( ( Date.now || new Date().getTime )() );

        this.$Message.success( { "content": "更新成功" } );
      },

      beforeCreatePermission() {
        this.permissionSaveModal.isShowModal = true;
      },

      async savePermissionModal() {
        if ( await this.isForbidden( "permission_write", true ) ) {
          return;
        }

        let modal = this.permissionSaveModal,
          description = modal.description,
          name = modal.name;

        if ( StringUtils.isBlank( name ) ) {
          this.$Message.warning( "请输入权限名" );
          setTimeout( () => modal.isShowModal = true, 0 );
          return;
        }

        if ( StringUtils.isBlank( description ) ) {
          this.$Message.warning( "请输入权限描述" );
          setTimeout( () => modal.isShowModal = true, 0 );
          return;
        }

        let response = ( await authorizationClient.addPermission( name, description ) ).data;

        if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
          this.$Message.error( { "content": `创建失败 -> ${response.data.message}` } );

        } else {
          this.$Message.success( { "content": "创建成功" } );
          this.refresh( "table" );
        }

        this.permissionSaveModalCancel();
      },

      permissionSaveModalCancel() {
        this.$refs[ "permissionSaveModal" ].resetFields();
      },

      async changePermissionStatus( row, status ) {
        if ( await this.isForbidden( "permission_write", true ) ) {
          return;
        }

        this.changeStatus( row, status,
          () => permissionClient.updatePermissionDetail( row.id, row.name, row.description, status ) );
      },

      async removeAllPermission( selected ) {
        if ( await this.isForbidden( "permission_write", true ) ) {
          return;
        }

        if ( selected.length <= 0 ) {
          this.$Message.warning( { content: "请选择要删除的权限" } );
          return;
        }

        let permissionIds = selected.map( item => item.id );
        this.removeAll( "table", "table", selected,
          () => permissionClient.updatePermissionStatus( permissionIds, DataStatusEnum.DELETE.status ) );
      }
    }
  }
</script>