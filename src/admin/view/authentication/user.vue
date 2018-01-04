<style>
    form > .ivu-form-item {
        margin-bottom: .5rem;
    }
</style>
<template>
    <Row>
        <MultifunctionTable ref="table" :columns="table.columns" :data="table.data" :total="table.total"
                            :statusList="statusList" @on-data-loading="beforeQuery" @on-data-insert="beforeCreateUser"
                            @on-data-delete="removeAllUser"/>

        <Modal title="修改用户信息" v-model="userUpdateModal.isShowModal"
               @on-ok="modifyUserDetail" @on-cancel="userUpdateModalCancel">
            <Form>
                <FormItem label="昵称" :label-width="60">
                    <Input v-model="userUpdateModal.nickname" type="text" placeholder="昵称"/>
                </FormItem>
                <FormItem label="用户状态" :label-width="60">
                    <Select v-model="userUpdateModal.status" :value="0" style="width: 6rem;">
                        <Option v-for="item in statusList.slice(0,2)" :value="item.status" :key="item.name">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
            </Form>
        </Modal>

        <Modal title="新增用户" v-model="userSaveModal.isShowModal"
               @on-ok="saveUserDetail" @on-cancel="userSaveModalCancel">
            <Form ref="userSaveModal" :model="userSaveModal" :rules="userSaveModal.rules">
                <FormItem label="账户" :label-width="60" prop="account" style="height: 3rem;">
                    <Input v-model="userSaveModal.account" type="text" placeholder="账户"/>
                </FormItem>
                <FormItem label="昵称" :label-width="60" prop="nickname" style="height: 3rem;">
                    <Input v-model="userSaveModal.nickname" type="text" placeholder="昵称"/>
                </FormItem>
                <FormItem label="密码" :label-width="60" prop="password" style="height: 3rem;">
                    <Input v-model="userSaveModal.password" type="password" placeholder="密码"/>
                </FormItem>
            </Form>
        </Modal>
    </Row>
</template>
<script>
    import MultifunctionTable from "@admin/component/multifunctionTable.vue";

    import { CoreUtils, StringUtils, Dates, HashMap } from "@core";
    import { userDetailClient } from "@admin/rest/client";
    import { ResponseStatusEnum, DataStatusEnum } from "@admin/tools/constant";

    export default {
        components: { MultifunctionTable },
        data() {
            return {
                userUpdateModal: {
                    isShowModal: false,
                    data: null,
                    title: "",

                    id: "",
                    status: 0,
                    nickname: ""
                },

                userSaveModal: {
                    isShowModal: false,

                    account: "",
                    nickname: "",
                    password: "",

                    rules: {
                        account: [ { required: true, message: "请填写账户" } ],
                        nickname: [ { required: true, message: "请填写昵称" } ],
                        password: [ { required: true, message: "请填写密码" } ]
                    }
                },

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

                table: {
                    columns: [ {
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
                                    on: {
                                        click: () => {
                                            let modal = this.userUpdateModal;
                                            modal.isShowModal = true;
                                            modal.data = row;

                                            modal.id = row.id;
                                            modal.status = row.status;
                                            modal.nickname = row.nickname;
                                        }
                                    }
                                }, "修改" )
                            ] );
                        }
                    } ],

                    data: [],
                    total: 0
                }
            }
        },
        async mounted() {
            let [ page, range, condition ] = await this.getTableMetaData(),
                currentRoute = this.$router.history.current;

            if ( CoreUtils.isNone( currentRoute.params.metadata ) ) {
                this.beforeQuery( page, range, condition );
                return;
            }

            let metadata = JSON.parse( currentRoute.params.metadata );
            if ( typeof metadata !== "object" ) {
                this.beforeQuery( page, range, condition );
                return;
            }

            [ page, range, condition ] = metadata;
            this.$refs.table.$emit( "table-condition-update-request", page, range, condition );
            this.beforeQuery( page, range, condition );
        },
        methods: {
            getTableMetaData() {
                let tableComponent = this.$refs.table,
                    request = new Promise( resolve => tableComponent.$once( "table-condition-response",
                        ( page, range, condition ) => resolve( [ page, range, condition ] ) ) );

                tableComponent.$emit( "table-condition-request" );

                return request;
            },
            beforeQuery( page, range, condition ) {
                let pureCondition = Object.create( null );

                Object.keys( condition ).forEach( key => pureCondition[ key ] =
                    ( condition[ key ] instanceof Date ? condition[ key ].getTime() : condition[ key ] ) );

                this.$router.replace( `/index/auth/user/${encodeURIComponent( JSON.stringify( [ page, range, pureCondition ] ) )}` );
                setTimeout( () => this.query( page, range, condition ), 0 );
            },
            async query( page, range, condition ) {
                let
                    // date component variable is a string type by default,
                    // but it will change to a number type when you selected.
                    createStartTime = StringUtils.isBlank( condition.createStartTime ) ? 0 : condition.createStartTime,
                    createEndingTime = StringUtils.isBlank( condition.createEndingTime ) ? 0 : condition.createEndingTime,
                    updateStartTime = StringUtils.isBlank( condition.updateStartTime ) ? 0 : condition.updateStartTime,
                    updateEndingTime = StringUtils.isBlank( condition.updateEndingTime ) ? 0 : condition.updateEndingTime,

                    id = condition.id,
                    status = condition.status,
                    nickname = condition.nickname,

                    users = ( await userDetailClient.queryByMultiCondition(
                        createStartTime, createEndingTime, updateStartTime, updateEndingTime,
                        status, nickname, id, page - 1, range
                    ) ).body.result;

                this.table.total = ( await userDetailClient.countByMultiCondition(
                    createStartTime, createEndingTime, updateStartTime,
                    updateEndingTime, status, nickname, id
                ) ).body.result;

                this.table.data = users.map( item => {
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
                } );
            },
            async changeUserStatus( row, status ) {
                let response = await userDetailClient.updateUserDetail( row.id, status, row.nickname );

                if ( response.body.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
                    this.$Message.warning( { "content": `${status === DataStatusEnum.DELETE.status ? "删除" : "恢复"}失败` } );
                    return;
                }

                row.status = status;
                row.statusName = DataStatusEnum.getNameByStatus( status );

                row.deleteTime = status !== DataStatusEnum.DELETE.status ? "" :
                    Dates.toLocalDateTimeString( ( Date.now || new Date().getTime )() );

                this.$Message.success( { "content": `${status === DataStatusEnum.DELETE.status ? "删除" : "恢复"}成功` } );
            },

            userUpdateModalCancel() {
                let modal = this.userUpdateModal;

                modal.isUpdate = modal.isShowModal = false;
                modal.data = null;
            },
            async modifyUserDetail() {
                let modal = this.userUpdateModal,
                    row = modal.data,
                    response = await userDetailClient.updateUserDetail( modal.id, modal.status, modal.nickname );

                if ( response.body.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
                    this.$Message.error( { "content": `更新失败 -> ${response.body.message}` } );
                    return;
                }

                row.status = modal.status;
                row.nickname = modal.nickname;
                row.statusName = DataStatusEnum.getNameByStatus( modal.status );

                row.deleteTime = modal.status !== DataStatusEnum.DELETE.status ? "" :
                    Dates.toLocalDateTimeString( ( Date.now || new Date().getTime )() );

                this.$Message.success( { "content": "更新成功" } );

                this.userUpdateModalCancel();
            },

            beforeCreateUser() {
                this.userSaveModal.isShowModal = true;
            },
            userSaveModalCancel() {
                this.$refs[ "userSaveModal" ].resetFields();
            },
            async saveUserDetail() {
                let modal = this.userSaveModal,
                    account = modal.account,
                    nickname = modal.nickname,
                    password = modal.password;

                if ( StringUtils.isBlank( account ) ) {
                    this.$Message.warning( { "content": "请填写账户" } );
                    setTimeout( () => modal.isShowModal = true, 0 );
                    return;
                }

                if ( StringUtils.isBlank( nickname ) ) {
                    this.$Message.warning( { "content": "请填写昵称" } );
                    setTimeout( () => modal.isShowModal = true, 0 );
                    return;
                }

                if ( StringUtils.isBlank( password ) ) {
                    this.$Message.warning( { "content": "请填写密码" } );
                    setTimeout( () => modal.isShowModal = true, 0 );
                    return;
                }

                let user = CoreUtils.base64Encoder( `${account}:${nickname}:${password}` ),
                    response = await userDetailClient.register( user );

                response.body.statusCode === ResponseStatusEnum.SUCCESS.statusCode
                    ? this.$Message.success( { "content": "创建成功" } )
                    : this.$Message.error( { "content": `创建失败 -> ${response.body.message}` } );

                this.userSaveModalCancel();
            },

            async removeAllUser( selected ) {
                if ( selected.length <= 0 ) {
                    this.$Message.warning( { content: "请选择要删除的用户" } );
                    return;
                }

                let userIds = selected.map( user => user.id ),
                    response = await userDetailClient.updateUserStatus( DataStatusEnum.DELETE.status, userIds );

                if ( response.body.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
                    this.$Message.warning( { "content": "删除失败" } );

                } else {
                    let user,
                        rows = new HashMap();

                    this.$refs.table.table.data.map( user => rows.put( user.id, user ) );

                    // only modify by table data rows
                    selected.forEach( item => {
                        user = rows.get( item.id );

                        user.status = DataStatusEnum.DELETE.status;
                        user.statusName = DataStatusEnum.getNameByStatus( user.status );
                        user.deleteTime = Dates.toLocalDateTimeString( ( Date.now || new Date().getTime )() )
                    } );

                    this.$Message.success( { "content": "删除成功" } );
                }
            }
        }
    }
</script>