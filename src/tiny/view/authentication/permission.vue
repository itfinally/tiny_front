<template>
  <Row>
    <Collapse v-model="collapse" style="width: 100%; margin-bottom: .5rem;">
      <Panel name="condition" style="font-size: .8rem;">
        工具栏
        <QueryForm ref="queryForm" slot="content" @on-query="queryFromForm">
          <Button v-if="security.permissionWrite" type="primary" slot="btn" @click="addPermission">新增权限</Button>
          <Button v-if="security.permissionWrite" type="primary" slot="btn" @click="removeAll">删除选定数据</Button>
          <Button v-if="security.permissionWrite" type="primary" slot="btn" @click="recoverAll">恢复选定数据</Button>
        </QueryForm>
      </Panel>
    </Collapse>
    <DataTable ref="dataTable" :loading="tables.loading" :columns="tables.columns" :data="tables.data"/>
    <Paging ref="paging" :total="tables.total" @on-change="queryFromPaging"/>

    <Modal :value="modal.open" title="修改权限数据" closable mask-closable
           @on-ok="modal.callback.call( this )" @on-cancel="modal.open = false">
      <Form :model="modal" :rules="modal.rule" :label-width="60">
        <FormItem prop="name" label="权限名">
          <Input type="text" v-model="modal.name" placeholder="权限名..."/>
        </FormItem>
        <FormItem prop="description" label="权限描述">
          <Input type="text" v-model="modal.description" placeholder="权限描述..."/>
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
  import QueryForm from "@/tiny/components/query_form";
  import DataTable from "@/tiny/components/data_table";
  import Paging from "@/tiny/components/paging";

  import { CLOSE_MASK, GLOBAL_EVENT_EMITTER, OPEN_MASK } from "@/tiny/support/commons";
  import { EntityStatus, ResponseStatus } from "@/tiny/support/status";
  import { permissionClient } from "@/tiny/web/client";

  export default {
    extends: BasicTablePage,
    components: { QueryForm, Paging, DataTable },
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

              let btns = [],
                security = this.security;

              if ( security.permissionWrite ) {
                btns.push( h( "Button", {
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
                }, "编辑" ) );
              }

              if ( security.permissionWrite && btnName ) {
                btns.push( h( "Button", {
                  props: {
                    type: "text",
                    size: "small"
                  },
                  on: { click: () => this.updateRowStatus( row ) }
                }, btnName ) );
              }

              // 如果没有任何权限操作数据, 则删除自身, 整体布局会好看很多
              // 但 render 函数在 iview 的 table 内是通过 computed 属性抽离, 等于已经缓存 render
              // 也就意味着第一次执行 render 并把自身删除后, 该函数依然会执行直至循环结束
              if ( btns.length <= 0 ) {
                let columns = this.tables.columns,
                  index = columns.findIndex( it => "operation" === it.key );

                if ( index !== -1 ) {
                  columns.splice( index, 1 );
                }
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
          description: "",

          callback: null,
          open: false,
          row: null
        },

        security: {
          permissionRead: false,
          permissionWrite: false
        }
      };
    },
    async mounted() {
      let security = this.security;
      security.permissionRead = await this.hasPermission( "permission_read" );
      security.permissionWrite = await this.hasPermission( "permission_write" );

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
        if ( !( await this.hasPermission( "permission_read", true ) ) ) {
          return;
        }

        this.tables.total = ( await permissionClient.countByConditionsIs( conditions ) ).data.result;
        this.tables.data = ( await permissionClient.queryByConditionsIs(
          Object.assign( Object.create( null ), conditions, pageData ) ) ).data.result.map( item => {
          return {
            id: item.id,
            _status: item.status,
            status: EntityStatus.getNameByStatus( item.status ),
            createTime: this.castMillisToString( item.createTime ),
            updateTime: this.castMillisToString( item.updateTime ),
            deleteTime: -1 === item.deleteTime ? -1 : this.castMillisToString( item.deleteTime ),
            name: item.name,
            description: item.description
          };
        } );

        this.updatePath( conditions, pageData );
      },
      async updateRowStatus( row ) {
        if ( !( await this.hasPermission( "permission_write", true ) ) ) {
          return;
        }

        switch ( row._status ) {
          case EntityStatus.NORMAL.status:
            this.removeOrRecoverRow( row, () => permissionClient.removePermission( row.id ) );
            break;

          case EntityStatus.DELETE.status:
            this.removeOrRecoverRow( row, () => permissionClient.recoverByIdIs( row.id ) );
            break;

          default:
            this.tables.loading = false;
            this.$Message.error( { content: "更新失败, 当前数据状态异常" } );
        }
      },
      async addPermission() {
        if ( !( await this.hasPermission( "permission_write", true ) ) ) {
          return;
        }

        let modal = this.modal;

        modal.name = "";
        modal.row = null;
        modal.description = "";
        modal.callback = this.saveData;
        modal.status = EntityStatus.NORMAL.status;

        modal.open = true;
      },
      async removeAll() {
        if ( !( await this.hasPermission( "permission_write", true ) ) ) {
          return;
        }

        let rows = this.$refs[ "dataTable" ].getAllSelected();
        this.removeAllRow( rows, () => permissionClient.removeAllByIdIn( rows.map( item => item.id ) ) );
      },
      async recoverAll() {
        if ( !( await this.hasPermission( "permission_write", true ) ) ) {
          return;
        }

        let rows = this.$refs[ "dataTable" ].getAllSelected();
        this.recoverAllRow( rows, () => permissionClient.recoverAllByIdIn( rows.map( item => item.id ) ) );
      },
      async updateData() {
        if ( !( await this.hasPermission( "permission_write", true ) ) ) {
          return;
        }

        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        let modal = this.modal;
        modal.open = false;

        try {
          let response = await permissionClient.update( modal.id, modal.status, modal.name, modal.description );

          if ( response.data.code === ResponseStatus.SUCCESS.code ) {
            let row = modal.row;

            row.name = modal.name;
            row._status = modal.status;
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
        if ( !( await this.hasPermission( "permission_write", true ) ) ) {
          return;
        }

        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        let modal = this.modal;

        // 必须显式关闭对话框, 否则无法再次打开
        modal.open = false;

        if ( "" === modal.name ) {
          this.$Message.warning( { content: "请输入权限名" } );
          setTimeout( () => modal.open = true, 0 );
          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;
        }

        if ( !modal.status ) {
          this.$Message.warning( { content: "请选择权限状态" } );
          setTimeout( () => modal.open = true, 0 );
          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;
        }

        try {
          let response = await permissionClient.save( modal.name, modal.description, modal.status );
          if ( response.data.code === ResponseStatus.SUCCESS.code ) {
            this.$Message.success( { content: "新增成功" } );

          } else {
            this.$Message.error( { content: `新增失败, ${response.data.message}` } );
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