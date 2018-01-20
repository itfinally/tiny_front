<style scoped>
    form > .ivu-form-item {
        margin-bottom: .5rem;
    }
</style>

<template>
    <Row>
        <MultiFunctionTable ref="table" :columns="table.columns" :data="table.data" :total="table.total"
                            @on-data-loading="beforeQuery" @on-data-insert="beforeCreateUser"
                            @on-data-delete="removeAllUser">

            <Form :model="table.condition" :label-width="60" inline slot="conditions">
                <FormItem prop="account" :label-width="40" label="id">
                    <Input v-model="table.condition.id" type="text" placeholder="id"/>
                </FormItem>
                <FormItem prop="account" label="用户名">
                    <Input v-model="table.condition.nickname" type="text" placeholder="nickname"/>
                </FormItem>
                <FormItem label="用户状态">
                    <Select v-model="table.condition.status" :value="0" style="width: 6rem;">
                        <Option v-for="item in statusList" :value="item.status" :key="item.name">
                            {{ item.name }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="起始日期">
                    <Row>
                        <Col span="11">
                        <DatePicker v-model="table.condition.createStartTime" type="datetime"
                                    placeholder="起始时间"></DatePicker>
                        </Col>
                        <Col span="2" style="text-align: center">
                        -</Col>
                        <Col span="11">
                        <DatePicker v-model="table.condition.createEndingTime" type="datetime"
                                    placeholder="结束时间"></DatePicker>
                        </Col>
                    </Row>
                </FormItem>
                <FormItem label="修改日期">
                    <Row>
                        <Col span="11">
                        <DatePicker v-model="table.condition.updateStartTime" type="datetime"
                                    placeholder="起始时间"></DatePicker>
                        </Col>
                        <Col span="2" style="text-align: center">
                        -</Col>
                        <Col span="11">
                        <DatePicker v-model="table.condition.updateEndingTime" type="datetime"
                                    placeholder="结束时间"></DatePicker>
                        </Col>
                    </Row>
                </FormItem>
            </Form>
        </MultiFunctionTable>

        <Modal title="修改用户信息" v-model="userUpdateModal.isShowModal"
               @on-ok="modifyUserDetail" @on-cancel="userUpdateModalCancel">
            <Form>
                <FormItem label="昵称" :label-width="60">
                    <Input v-model="userUpdateModal.nickname" type="text" placeholder="昵称"/>
                </FormItem>
                <FormItem label="用户状态" :label-width="60">
                    <Select v-model="userUpdateModal.status" style="width: 6rem;">
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

        <Modal title="角色分配" v-model="roleModal.isShowModal" @on-ok="modifyUserRole">
            <Transfer :data="roleModal.roles" :targetKeys="roleModal.existRoles"
                      :list-style="{ width: '215px' }" :titles="['角色列表', '用户角色']"
                      @on-change="onRoleChange">
            </Transfer>
        </Modal>
    </Row>
</template>
<script>
    import MultiFunctionTable from "@admin/component/ui/multi_function_table";
    import MultiFunctionTableComponent from "@admin/component/multi_function_table_component";

    import { CoreUtils, StringUtils, Dates } from "@core";
    import { userDetailClient, roleClient } from "@admin/rest/client";
    import { ResponseStatusEnum, DataStatusEnum } from "@admin/tools/constant";

    export default {
        extends: MultiFunctionTableComponent,
        components: { MultiFunctionTable },
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

                roleModal: {
                    isShowModal: false,

                    userId: "",
                    roles: [],
                    existRoles: []
                },

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
                                }, "修改" ),
                                h( "Button", {
                                    props: {
                                        type: "text",
                                        size: "small"
                                    },
                                    on: {
                                        click: async () => {
                                            let modal = this.roleModal;
                                            modal.isShowModal = true;
                                            modal.userId = row.id;

                                            let roles = ( await roleClient.getRoles() ).body.result,
                                                existRoles = ( await roleClient.getSpecificUserRoles( row.id ) ).body.result;

                                            modal.existRoles = existRoles.map( item => item.id );
                                            modal.roles = roles.map( item => {
                                                return {
                                                    key: item.id,
                                                    label: item.name,
                                                    description: item.description
                                                };
                                            } );
                                        }
                                    }
                                }, "修改用户角色" )
                            ] );
                        }
                    } ],

                    data: [],
                    total: 0,

                    condition: {
                        createStartTime: 0,
                        createEndingTime: 0,
                        updateStartTime: 0,
                        updateEndingTime: 0,
                        nickname: "",
                        status: 0,
                        id: "",
                    }
                }
            }
        },
        async mounted() {
            this.tableInitializer( "table" );
        },
        methods: {
            beforeUrlUpdate( expressionMetadata ) {
                return `/index/auth/user/${expressionMetadata}`;
            },
            getCondition() {
                return this.table.condition;
            },
            async query( page, range, condition ) {
                let table = this.table,

                    createStartTime = this.getMillisFromDatePicker( condition.createStartTime ),
                    createEndingTime = this.getMillisFromDatePicker( condition.createEndingTime ),
                    updateStartTime = this.getMillisFromDatePicker( condition.updateStartTime ),
                    updateEndingTime = this.getMillisFromDatePicker( condition.updateEndingTime ),

                    id = condition.id,
                    status = condition.status,
                    nickname = condition.nickname,

                    users = ( await userDetailClient.queryByMultiCondition(
                        createStartTime, createEndingTime, updateStartTime, updateEndingTime,
                        status, nickname, id, page - 1, range
                    ) ).body.result;

                let response = ( await userDetailClient.countByMultiCondition(
                    createStartTime, createEndingTime, updateStartTime,
                    updateEndingTime, status, nickname, id
                ) ).body;

                if ( response.statusCode === ResponseStatusEnum.SUCCESS.statusCode ) {
                    table.isTimeToCount = false;
                    table.total = response.result;
                }

                table.data = users.map( item => {
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

            async modifyUserDetail() {
                let modal = this.userUpdateModal,
                    row = modal.data;

                if ( !DataStatusEnum.contains( modal.status ) ) {
                    this.$Message.warning( { "content": "请选择用户状态" } );
                    this.userUpdateModal.isShowModal = true;
                    return;
                }

                if ( StringUtils.isBlank( modal.nickname ) ) {
                    this.$Message.warning( { "content": "请输入用户昵称" } );
                    this.userUpdateModal.isShowModal = true;
                    return;
                }

                let response = await userDetailClient.updateUserDetail( modal.id, modal.status, modal.nickname );
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

            userUpdateModalCancel() {
                this.userUpdateModal.isShowModal = false;
            },

            beforeCreateUser() {
                this.userSaveModal.isShowModal = true;
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

                if ( response.body.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
                    this.$Message.error( { "content": `创建失败 -> ${response.body.message}` } );

                } else {
                    this.$Message.success( { "content": "创建成功" } );
                    this.refresh( "table" );
                }

                this.userSaveModalCancel();
            },

            userSaveModalCancel() {
                this.$refs[ "userSaveModal" ].resetFields();
            },

            async changeUserStatus( row, status ) {
                this.changeStatus( row, status, () => userDetailClient.updateUserDetail( row.id, status, row.nickname ) );
            },

            async removeAllUser( selected ) {
                if ( selected.length <= 0 ) {
                    this.$Message.warning( { content: "请选择要删除的用户" } );
                    return;
                }

                this.removeAll( "table", "table", selected, () => userDetailClient
                    .updateUserStatus( selected.map( user => user.id ), DataStatusEnum.DELETE.status ) );
            },


            onRoleChange( targetKeys ) {
                this.roleModal.existRoles = targetKeys;
            },

            async modifyUserRole() {
                let modal = this.roleModal,
                    response = ( await userDetailClient.grantRolesTo( modal.userId, modal.existRoles ) ).body;

                if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
                    this.$Message.error( { "content": `保存失败 -> ${response.message}` } );

                } else {
                    this.$Message.success( { "content": "保存成功" } );
                }
            }
        }
    }
</script>