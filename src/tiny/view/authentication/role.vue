<template>
  <Row>
    <Collapse v-model="collapse" style="width: 100%; margin-bottom: .5rem;">
      <Panel name="condition" style="font-size: .8rem;">
        工具栏
        <QueryForm ref="queryForm" slot="content" @on-query="queryFromForm">
          <Button type="primary" slot="btn" @click="addPermission">新增角色</Button>
          <Button type="primary" slot="btn" @click="removeAll">删除选定数据</Button>
          <Button type="primary" slot="btn" @click="recoverAll">恢复选定数据</Button>
        </QueryForm>
      </Panel>
    </Collapse>
    <DataTable ref="dataTable" :loading="tables.loading" :columns="tables.columns" :data="tables.data"/>
    <Paging ref="paging" :total="tables.total" @on-change="queryFromPaging"/>

    <TransferModal v-model="permissionModal.open" :data="permissionModal.all"
                   :metadata="['可分配权限', '角色权限']" :target-keys="permissionModal.used"
                   :title="permissionModal.title" @on-ok="updateRolePermission"
                   @on-cancel="permissionModal.open = false"/>

    <Modal :value="modal.open" title="修改角色数据" closable mask-closable
           @on-ok="modal.callback.call( this )" @on-cancel="modal.open = false">
      <Form :model="modal" :rules="modal.rule" :label-width="70">
        <FormItem prop="name" label="角色名">
          <Input type="text" v-model="modal.name" placeholder="角色名"/>
        </FormItem>
        <FormItem prop="description" label="角色描述">
          <Input type="text" v-model="modal.description" placeholder="角色描述"/>
        </FormItem>
        <FormItem prop="description" label="角色优先度">
          <Input type="text" v-model="modal.priority" placeholder="角色优先度"/>
        </FormItem>
        <FormItem prop="status" label="状态">
          <Select v-model="modal.status" :value="0" style="width: 4.5rem;">
            <Option v-for="item in entityStatus" :value="item.status" :key="item.name">
              {{ item.name }}
            </Option>
          </Select>
        </FormItem>
      </Form>
    </Modal>
  </Row>
</template>

<script>
  import BasicTablePage from "@/tiny/components/basis/basic_table_page";
  import TransferModal from "@/tiny/components/transfer_modal";
  import QueryForm from "@/tiny/components/query_form";
  import DataTable from "@/tiny/components/data_table";
  import Paging from "@/tiny/components/paging";

  import { CLOSE_MASK, GLOBAL_EVENT_EMITTER, OPEN_MASK } from "@/tiny/support/commons";
  import { EntityStatus, ResponseStatus } from "@/tiny/support/status";
  import { roleClient, permissionClient } from "@/tiny/web/client";

  export default {
    extends: BasicTablePage,
    components: { QueryForm, Paging, DataTable, TransferModal },
    data() {
      return {
        collapse: "condition",

        tables: {
          loading: false,

          columns: [ {
            title: "名称",
            key: "name"
          }, {
            title: "描述",
            key: "description"
          }, {
            title: "角色优先级",
            key: "priority"
          }, {
            title: "操作",
            key: "operation",
            fixed: "right",
            render: ( h, parameters ) => {
              let btnName, row = this.tables.data[ parameters.index ];

              switch ( row._status ) {
                case EntityStatus.NORMAL.status:
                  btnName = "删除";
                  break;

                case EntityStatus.DELETE.status:
                  btnName = "恢复";
                  break;

                default:
                  btnName = ""
              }

              let btns = [
                h( "Button", {
                  props: {
                    type: "text",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      let modal = this.modal;

                      modal.id = row.id;
                      modal.name = row.name;
                      modal.status = row._status;
                      modal.description = row.description;

                      modal.row = row;
                      modal.callback = this.updateData;

                      modal.open = true;
                    }
                  }
                }, "编辑" )
              ];

              if ( btnName ) {
                btns.push( h( "Button", {
                  props: {
                    type: "text",
                    size: "small"
                  },
                  on: {
                    click: () => this.updateRowStatus( row )
                  }
                }, btnName ) );
              }

              if ( row.name.toLowerCase() !== "admin" ) {
                btns.push( h( "Button", {
                  props: {
                    type: "text",
                    size: "small"
                  },
                  on: {
                    click: async () => {
                      GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

                      try {
                        let expect = code => ResponseStatus.expect( code, ResponseStatus.SUCCESS.code, ResponseStatus.EMPTY_RESULT.code ),
                          responses = await Promise.all( [ permissionClient.queryOwnPermissions(), roleClient.queryPermissionsByRoleIdIs( row.id ) ] );

                        if ( responses.filter( it => expect( it.data.code ) ).length === 2 ) {
                          let modal = this.permissionModal;

                          modal.used = responses[ 1 ].data.result.map( it => it.id );
                          modal.all = responses[ 0 ].data.result.map( it => {
                            return {
                              key: it.id,
                              label: it.name,
                              description: it.description
                            };
                          } );

                          modal.title = `为 ${row.name} 分配权限`;
                          modal.roleId = row.id;
                          modal.open = true;

                        } else {
                          responses.forEach( it => !expect( it.data.code )
                            ? this.$Message.error( { content: `请求失败, ${it.data.message}` } ) : null );
                        }

                        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
                        return;

                      } catch ( exp ) {
                      }

                      GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
                      this.$Message.error( { content: "请求失败" } );
                    }
                  }

                }, "权限分配" ) );
              }

              return h( "Row", btns );
            }
          } ],
          data: [],
          total: 0
        },

        modal: {
          id: "",
          name: "",
          status: 0,
          priority: 1,
          description: "",

          callback: null,
          open: false,
          row: null
        },

        permissionModal: {
          title: "",
          roleId: "",

          all: [],
          used: [],

          open: false
        }
      };
    },
    async mounted() {
      let paging = this.$refs[ "paging" ],
        queryForm = this.$refs[ "queryForm" ],
        params = this.$router.history.current.params;

      if ( params.metadata ) {
        let [ conditions, pageData ] = JSON.parse( decodeURIComponent( params.metadata ) );
        paging.init( pageData );
        queryForm.init( conditions );
      }

      this.query( queryForm.getConditions(), paging.getPageData() );
    },
    methods: {
      queryFromForm( conditions ) {
        this.query( conditions, this.$refs[ "paging" ].getPageData() );
      },
      queryFromPaging( pageData ) {
        this.query( this.$refs[ "queryForm" ].getConditions(), pageData );
      },
      async query( conditions, pageData ) {
        this.tables.total = ( await roleClient.countByConditionsIs( conditions ) ).data.result;
        this.tables.data = ( await roleClient.queryByConditionsIs(
          Object.assign( Object.create( null ), conditions, pageData ) ) ).data.result.map( item => {
          return {
            id: item.id,
            _status: item.status,
            status: EntityStatus.getNameByStatus( item.status ),
            createTime: this.castMillisToString( item.createTime ),
            updateTime: this.castMillisToString( item.updateTime ),
            deleteTime: -1 === item.deleteTime ? -1 : this.castMillisToString( item.deleteTime ),
            name: item.name,
            priority: item.priority,
            description: item.description
          };
        } );

        this.updatePath( conditions, pageData );
      },
      async updateRowStatus( row ) {
        switch ( row._status ) {
          case EntityStatus.NORMAL.status:
            this.removeOrRecoverRow( row, () => roleClient.removeByIdIs( row.id ) );
            break;

          case EntityStatus.DELETE.status:
            this.removeOrRecoverRow( row, () => roleClient.recoverByIdIs( row.id ) );
            break;

          default:
            this.tables.loading = false;
            this.$Message.error( { content: "更新失败, 当前数据状态异常" } );
        }
      },
      addPermission() {
        let modal = this.modal;

        modal.name = "";
        modal.row = null;
        modal.priority = 1;
        modal.description = "";
        modal.callback = this.saveData;
        modal.status = EntityStatus.NORMAL.status;

        modal.open = true;
      },
      async removeAll() {
        let rows = this.$refs[ "dataTable" ].getAllSelected();
        this.removeAllRow( rows, () => roleClient.removeAllByIdIn( rows.map( item => item.id ) ) );
      },
      async recoverAll() {
        let rows = this.$refs[ "dataTable" ].getAllSelected();
        this.recoverAllRow( rows, () => roleClient.recoverAllByIdIn( rows.map( item => item.id ) ) );
      },
      async updateData() {
        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        let modal = this.modal;
        modal.open = false;

        try {
          let response = await roleClient.update( modal.id, modal.status, modal.name, modal.description, modal.priority );

          if ( response.data.code === ResponseStatus.SUCCESS.code ) {
            let row = modal.row;

            row.name = modal.name;
            row._status = modal.status;
            row.priority = modal.priority;
            row.description = modal.description;
            row.status = EntityStatus.getNameByStatus( row._status );

            switch ( row._status ) {
              case EntityStatus.NORMAL.status:
                row.deleteTime = -1;
                row.updateTime = this.castMillisToString( Date.now() );
                break;

              case EntityStatus.DELETE.status:
                row.deleteTime = row.updateTime = this.castMillisToString( Date.now() );
                break;
            }

            this.$Message.success( { content: "更新成功" } );

          } else {
            this.$Message.error( { content: `更新失败, ${response.data.message}` } );
          }

          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;

        } catch ( ignore ) {
        }

        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
        this.$Message.error( { content: "更新失败" } );
      },
      async saveData() {
        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        let modal = this.modal;

        // 必须显式关闭对话框, 否则无法再次打开
        modal.open = false;

        if ( "" === modal.name ) {
          this.$Message.warning( { content: "请输入角色名" } );
          setTimeout( () => modal.open = true, 0 );
          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;
        }

        if ( !modal.status ) {
          this.$Message.warning( { content: "请选择角色状态" } );
          setTimeout( () => modal.open = true, 0 );
          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;
        }

        try {
          let response = await roleClient.save( modal.name, modal.description, modal.status, modal.priority );
          if ( response.data.code === ResponseStatus.SUCCESS.code ) {
            this.$Message.success( { content: "新增成功" } );

          } else {
            this.$Message.error( { content: `新增失败, ${response.data.message}` } );
          }

          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;

        } catch ( ignore ) {
        }

        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
        this.$Message.error( { content: "更新失败" } );
      },
      async updateRolePermission( added, removed ) {
        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        let requests = [], modal = this.permissionModal;
        modal.open = false;

        if ( added.length > 0 ) {
          requests.push( roleClient.addPermissionsToRole( modal.roleId, added ) );
        }

        if ( removed.length > 0 ) {
          requests.push( roleClient.removePermissionsFromRole( modal.roleId, removed ) );
        }

        if ( requests <= 0 ) {
          this.$Message.warning( { content: "权限无变动" } );
          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;
        }

        try {
          let responses = await Promise.all( requests );

          if ( responses.filter( it => it.data.code === ResponseStatus.SUCCESS.code ).length === requests.length ) {
            this.$Message.success( { content: "更新成功" } );

          } else {
            responses.forEach( it => it.data.code !== ResponseStatus.SUCCESS.code
              ? this.$Message.error( { content: `更新失败, ${it.data.message}` } ) : null );
          }

          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;

        } catch ( exp ) {
        }

        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
        this.$Message.error( { content: "更新失败" } );
      }
    }
  };
</script>