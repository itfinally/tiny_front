<style>
  .access-log-form .ivu-input:disabled {
    color: #1f1f1f;
  }
</style>
<template>
  <Row>
    <Collapse v-model="collapse" style="width: 100%; margin-bottom: .5rem;">
      <Panel name="condition" style="font-size: .8rem;">
        工具栏
        <QueryForm ref="queryForm" slot="content" :queryById="false" :queryByStatus="false" @on-query="queryFromForm">
          <FormItem label="用户名" prop="id" :label-width="60" style="width: 14rem" slot="before">
            <Input v-model="conditions.username" placeholder="输入用户名"/>
          </FormItem>
          <FormItem label="请求方法" prop="method" :label-width="70" slot="afterStatus">
            <Select v-model="conditions.method" style="width: 4.5rem;">
              <Option v-for="item in methods" :value="item.value" :key="item.name">
                {{ item.name }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="是否异常" prop="isException" :label-width="70" slot="afterStatus">
            <Select v-model="conditions.isException" style="width: 4.5rem;">
              <Option v-for="item in exceptions" :value="item.value" :key="item.name">
                {{ item.name }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="源地址" prop="id" :label-width="60" style="width: 14rem" slot="afterStatus">
            <Input v-model="conditions.sourceIp" placeholder="输入Ip地址"/>
          </FormItem>
          <FormItem label="请求路径" prop="id" :label-width="70" style="width: 14rem" slot="afterStatus">
            <Input v-model="conditions.path" placeholder="输入请求路径"/>
          </FormItem>
        </QueryForm>
      </Panel>
    </Collapse>
    <DataTable ref="dataTable" :loading="tables.loading" :columns="tables.columns" :data="tables.data"
               :addSelector="false"/>
    <Paging ref="paging" :total="tables.total" @on-change="queryFromPaging"/>

    <Modal v-model="modal.open" :closable="false">
      <Form class="access-log-form" :model="modal" :label-width="70">
        <FormItem label="Id">
          <Input type="text" v-model="modal.id" placeholder="暂无id" disabled/>
        </FormItem>
        <FormItem label="状态">
          <Input type="text" v-model="modal.status" placeholder="暂无状态" disabled/>
        </FormItem>
        <FormItem label="创建日期">
          <Input type="text" v-model="modal.createTime" placeholder="暂无创建日期" disabled/>
        </FormItem>
        <FormItem label="更新日期">
          <Input type="text" v-model="modal.updateTime" placeholder="暂无更新日期" disabled/>
        </FormItem>
        <FormItem label="删除日期">
          <Input type="text" v-model="modal.deleteTime" placeholder="暂无删除日期" disabled/>
        </FormItem>
        <FormItem label="请求方法">
          <Input type="text" v-model="modal.method" placeholder="暂无请求方法" disabled/>
        </FormItem>
        <FormItem label="源地址">
          <Input type="text" v-model="modal.sourceIp" placeholder="暂无源地址" disabled/>
        </FormItem>
        <FormItem label="请求路径">
          <Input type="text" v-model="modal.path" placeholder="暂无请求路径" disabled/>
        </FormItem>
        <FormItem label="是否异常">
          <Input type="text" v-model="modal.isException" placeholder="暂无异常状态" disabled/>
        </FormItem>
        <FormItem label="访问者">
          <Input type="text" v-model="modal.username" placeholder="暂无访问者" disabled/>
        </FormItem>
        <FormItem label="响应结果">
          <Input type="textarea" v-model="modal.result" placeholder="暂无响应结果" disabled/>
        </FormItem>
      </Form>

      <Row slot="footer">
        <Button @click="closingModal">关闭</Button>
      </Row>
    </Modal>
  </Row>
</template>

<script>
  import BasicTablePage from "@/tiny/components/basis/basic_table_page";
  import QueryForm from "@/tiny/components/query_form";
  import DataTable from "@/tiny/components/data_table";
  import Paging from "@/tiny/components/paging";

  import { EntityStatus } from "@/tiny/support/status";
  import { accessLogClient } from "@/tiny/web/client";

  import { Lang } from "jcdt";

  export default {
    extends: BasicTablePage,
    components: { QueryForm, DataTable, Paging },
    data() {
      return {
        collapse: "condition",
        conditions: {
          path: "",
          username: "",
          sourceIp: "",
          method: "default",
          isException: "default"
        },
        tables: {
          loading: false,

          columns: [ {
            title: "请求方法",
            key: "method",
            width: 90
          }, {
            title: "源地址",
            key: "sourceIp",
            width: 120
          }, {
            title: "请求路径",
            key: "path",
            width: 350
          }, {
            title: "是否异常",
            key: "isException",
            width: 90
          }, {
            title: "访问者",
            key: "username",
            width: 180,
          }, {
            title: "操作",
            key: "operation",
            fixed: "right",
            width: 80,
            render: ( h, parameters ) => {
              return [ h( "Button", {
                props: {
                  type: "text",
                  size: "small"
                },
                on: {
                  click: () => {
                    let modal = this.modal,
                      data = parameters.row;

                    modal.id = data.id;
                    modal.status = data.status;
                    modal.createTime = data.createTime;
                    modal.updateTime = data.updateTime;
                    modal.deleteTime = data.deleteTime;

                    modal.method = data.method;
                    modal.path = data.path;
                    modal.sourceIp = data.sourceIp;
                    modal.username = data.username;
                    modal.isException = data.isException;
                    modal.result = data.result;

                    modal.open = true;
                  }
                }
              }, "详情" ) ];
            }
          } ],
          data: [],
          total: 0,
          lastCondition: null
        },
        methods: [ {
          name: "GET",
          value: "GET"
        }, {
          name: "POST",
          value: "POST"
        }, {
          name: "PUT",
          value: "PUT"
        }, {
          name: "DELETE",
          value: "DELETE"
        }, {
          name: "全选",
          value: "default"
        } ],
        exceptions: [ {
          name: "是",
          value: "true"

        }, {
          name: "否",
          value: "false"
        }, {
          name: "全选",
          value: "default"
        } ],
        security: {
          accessLogRead: false
        },

        modal: {
          open: false,

          id: "",
          status: "",
          createTime: "",
          updateTime: "",
          deleteTime: "",
          method: "",
          path: "",
          sourceIp: "",
          isException: "",
          username: "",
          result: ""
        }
      };
    },
    async mounted() {
      let security = this.security;
      security.accessLogRead = await this.hasPermission( "access_log_read" );

      let params = this.$router.history.current.params,
        queryForm = this.$refs[ "queryForm" ],
        paging = this.$refs[ "paging" ];

      if ( params.metadata ) {
        let [ conditions, cursors ] = JSON.parse( decodeURIComponent( params.metadata ) );

        paging.init( cursors );
        queryForm.init( conditions );
      }

      this.query( queryForm.getConditions(), paging.getCursors() );
    },
    methods: {
      // 自定义查询条件的话, 需要自己合并条件
      getConditions() {
        let totals = Object.create( null ),
          localConditions = this.conditions;

        if ( localConditions.username ) {
          totals.username = localConditions.username;
        }

        if ( localConditions.path ) {
          totals.path = localConditions.path;
        }

        if ( localConditions.sourceIp ) {
          totals.sourceIp = localConditions.sourceIp;
        }

        if ( !/default/.test( localConditions.method ) ) {
          totals.method = localConditions.method
        }

        if ( !/default/.test( localConditions.isException ) ) {
          totals.isException = /true/.test( localConditions.isException );
        }

        return totals;
      },
      queryFromForm( conditions ) {
        this.query( Object.assign( this.getConditions(), conditions ), this.$refs[ "paging" ].getCursors() );
      },
      queryFromPaging( cursors ) {
        this.query( Object.assign( this.getConditions(), this.$refs[ "queryForm" ].getConditions() ), cursors );
      },
      async query( conditions, cursors ) {
        if ( !( await this.hasPermission( "access_log_read", true ) ) ) {
          return;
        }

        let tables = this.tables,
          paging = this.$refs[ "paging" ];

        if ( !Lang.eq( tables.lastCondition, conditions ) ) {

          paging.reset();
          cursors = paging.getCursors();
          tables.lastCondition = conditions;

          tables.total = ( await accessLogClient.countByConditionsIs( conditions ) ).data.result;
        }

        tables.data = ( await accessLogClient.queryByConditionsIs(
          Object.assign( Object.create( null ), conditions, cursors ) ) ).data.result.map( item => {
          return {
            id: item.id,
            status: EntityStatus.getNameByStatus( item.status ),
            createTime: this.castMillisToString( item.createTime ),
            updateTime: this.castMillisToString( item.updateTime ),
            deleteTime: -1 === item.deleteTime ? -1 : this.castMillisToString( item.deleteTime ),
            method: item.requestMethod,
            path: item.requestPath,
            sourceIp: item.sourceIp,
            isException: item.exception ? "是" : "否",
            username: item.username,
            result: item.result
          };
        } );

        this.updatePath( conditions, paging.getPagingDetails() );
      },
      closingModal() {
        this.modal.open = false;
      }
    }
  };
</script>