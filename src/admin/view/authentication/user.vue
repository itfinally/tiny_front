<style>
    form > .ivu-form-item {
        margin-bottom: .5rem;
    }
</style>
<template>
    <Row>
        <Row type="flex" style="flex-direction: column; margin: .5rem 0; width: auto; max-height: 8rem;">
            <Form :model="tableCondition" :label-width="60" inline>
                <FormItem prop="account" :label-width="40" label="账户">
                    <Input v-model="tableCondition.account" type="text" placeholder="账户"/>
                </FormItem>
                <FormItem prop="nickname" label="用户名">
                    <Input v-model="tableCondition.nickname" type="text" placeholder="用户名"/>
                </FormItem>
                <FormItem label="用户状态">
                    <Select v-model="tableCondition.status" :value="0" style="width: 6rem;">
                        <Option v-for="item in statusList" :value="item.status" :key="item.name">{{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="起始日期">
                    <Row>
                        <Col span="11">
                        <DatePicker v-model="tableCondition.createStartTime" type="datetime"
                                    placeholder="起始时间"></DatePicker>
                        </Col>
                        <Col span="2" style="text-align: center">
                        -</Col>
                        <Col span="11">
                        <DatePicker v-model="tableCondition.createEndingTime" type="datetime"
                                    placeholder="结束时间"></DatePicker>
                        </Col>
                    </Row>
                </FormItem>
                <FormItem label="修改日期">
                    <Row>
                        <Col span="11">
                        <DatePicker v-model="tableCondition.updateStartTime" type="datetime"
                                    placeholder="起始时间"></DatePicker>
                        </Col>
                        <Col span="2" style="text-align: center">
                        -</Col>
                        <Col span="11">
                        <DatePicker v-model="tableCondition.updateEndingTime" type="datetime"
                                    placeholder="结束时间"></DatePicker>
                        </Col>
                    </Row>
                </FormItem>
            </Form>
            <Form inline>
                <FormItem prop="user" :label-width="0">
                    <Button>新建</Button>
                </FormItem>
                <FormItem prop="user" :label-width="0">
                    <Button @click="beforeQuery">查询</Button>
                </FormItem>
            </Form>
        </Row>
        <Row>
            <Table :width="tableSetting.width" :height="tableSetting.height"
                   :columns="table.columns" :data="table.data"></Table>
        </Row>
        <Row style="margin: .5rem 0;">
            <Page :current="table.current" :total="table.total" :page-size="table.pageSize"
                  :page-size-opts="table.pageSizeOpts"
                  :show-total="true" :show-elevator="true" :show-sizer="true" placement="top"></Page>
        </Row>
    </Row>
</template>
<script>
    import { CoreUtils, StringUtils, Dates } from "@core";
    import { userDetailClient } from "@admin/rest/client";
    import { GLOBAL_EVENT_EMITTER, FRAME_RECT, DataStatusEnum } from "@admin/tools/constant";

    export default {
        data() {
            return {
                tableAdapter: null,
                statusList: [ {
                    status: 1,
                    name: "正常"
                }, {
                    status: -1,
                    name: "已删除"
                }, {
                    status: 0,
                    name: "全选"
                } ],

                tableSetting: {
                    width: 0,
                    height: 0
                },

                tableCondition: {
                    createStartTime: "",
                    createEndingTime: "",
                    updateStartTime: "",
                    updateEndingTime: "",
                    nickname: "",
                    account: "",
                    status: 0
                },

                table: {
                    columns: [ {
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
                        title: "账户",
                        key: "account"
                    }, {
                        title: "昵称",
                        key: "nickname"
                    }, {
                        title: "权限账户Id",
                        key: "authorityId"
                    }, {
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
                                    on: { click: () => this.changeUserStatus( row, nextStatus ) }
                                }, DataStatusEnum.DELETE.status === row.status ? "恢复" : "删除" ),
                                h( "Button", {
                                    props: {
                                        type: "text",
                                        size: "small"
                                    },
                                    on: { click: () => this.modifyUserDetail( row ) }
                                }, "修改" )
                            ] );
                        }
                    } ],

                    data: [],
                    cache: [],

                    total: 100,
                    current: 1,
                    pageSize: 10,
                    pageSizeOpts: [ 10, 20, 40, 80, 160 ]
                }
            }
        },
        mounted() {
            this.tableAdapter = rect => {
                let tableSetting = this.tableSetting;

                tableSetting.width = rect.width;
                tableSetting.height = rect.height;
            };

            GLOBAL_EVENT_EMITTER.removeListener( FRAME_RECT, this.tableAdapter );
            GLOBAL_EVENT_EMITTER.on( FRAME_RECT, this.tableAdapter );

            try {
                let current = this.$router.history.current;
                if ( CoreUtils.isNone( current.params.params ) ) {
                    this.beforeQuery();
                }

                let params = JSON.parse( this.$router.history.current.params.params );
                if ( typeof params !== "object" ) {
                    this.beforeQuery();
                    return;
                }

                let condition = this.tableCondition;
                CoreUtils.deepCopy( condition, params );

                this.query();

            } catch ( e ) {
                this.beforeQuery();
            }
        },
        destroyed() {
            GLOBAL_EVENT_EMITTER.removeListener( FRAME_RECT, this.tableAdapter );
            this.tableAdapter = null;
        },
        methods: {
            beforeQuery() {
                let condition = this.tableCondition,
                    pueCondition = Object.create( null );

                Object.keys( this.tableCondition ).forEach( key => pueCondition[ key ] =
                    (condition[ key ] instanceof Date ? condition[ key ].getTime() : condition[ key ]) );

                this.$router.replace( `/index/auth/user/${encodeURIComponent( JSON.stringify( pueCondition ) )}` );
            },
            async query() {
                let table = this.table,
                    condition = this.tableCondition,

                    // date component variable is a string type by default,
                    // but it will change to a number type when you selected.
                    createStartTime = StringUtils.isBlank( condition.createStartTime ) ? 0 : condition.createStartTime,
                    createEndingTime = StringUtils.isBlank( condition.createEndingTime ) ? 0 : condition.createEndingTime,
                    updateStartTime = StringUtils.isBlank( condition.updateStartTime ) ? 0 : condition.updateStartTime,
                    updateEndingTime = StringUtils.isBlank( condition.updateEndingTime ) ? 0 : condition.updateEndingTime,

                    status = condition.status,
                    account = condition.account,
                    nickname = condition.nickname,

                    response = await userDetailClient.queryByMultiCondition(
                        createStartTime, createEndingTime, updateStartTime, updateEndingTime,
                        status, nickname, account, table.current - 1, table.pageSize
                    ),

                    buffer = response.body.result.map( item => {
                        return {
                            id: item.id,
                            status: item.status,
                            statusName: DataStatusEnum.getNameByStatus( item.status ),
                            createTime: Dates.toLocalDateTimeString( item.createTime ),
                            updateTime: Dates.toLocalDateTimeString( item.updateTime ),
                            deleteTime: item.deleteTime <= 0 ? "" : Dates.toLocalDateTimeString( item.deleteTime ),
                            account: item.account,
                            nickname: item.nickname,
                            authorityId: item.authorityId
                        };
                    } ),

                    tableData = table.data,
                    asyncRender = new Promise( resolve => resolve( tableData.push( buffer.shift() ) ) );

                while ( buffer.length > 0 ) {
                    asyncRender = asyncRender.then( Promise.resolve( tableData.push( buffer.shift() ) ) );
                }

            },
            async changeUserStatus( row, status ) {
                let response = await userDetailClient.updateUserDetail( row.id, status, undefined );

                row.status = response.body.status;
                row.statusName = DataStatusEnum.getNameByStatus( response.body.status );
            },
            async modifyUserDetail( row, status ) {

            }
        }
    }
</script>