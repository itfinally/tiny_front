<template>
    <Row>
        <Row type="flex" justify="space-between" style="margin-bottom: .3rem; width: auto;">
            <Col>
            <Button>新建</Button>
            </Col>
            <Col>
            时间筛选:
            <DatePicker type="date" placeholder="起始日期" style="width: 8rem;"></DatePicker>
            -
            <DatePicker type="date" placeholder="结束日期" style="width: 8rem;"></DatePicker>
            </Col>
        </Row>
        <Row>
            <Table :width="tableSetting.width" :height="tableSetting.height"
                   :columns="table.columns" :data="table.data"></Table>
        </Row>
        <Row style="margin: .5rem 0;">
            <Page :current="table.current" :total="table.total" :page-size-opts="table.pageSizeOpts"
                  :show-total="true" :show-elevator="true" :show-sizer="true" placement="top"></Page>
        </Row>
    </Row>
</template>

<script>
    import { authorizationClient } from "@admin/rest/client";
    import { Dates } from "@core"
    import { GLOBAL_EVENT_EMITTER, FRAME_RECT, DataStatusEnum } from "@admin/tools/constant";

    export default {
        data() {
            return {
                tableAdapter: null,
                tableSetting: {
                    width: 0,
                    height: 0
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
                        key: "status"
                    }, {
                        title: "权限名",
                        key: "name"
                    }, {
                        title: "描述",
                        key: "description"
                    } ],

                    data: [],

                    total: 100,
                    current: 1,
                    pageSizeOpts: [ 10, 20, 40, 80, 160 ]
                }
            };
        },
        async mounted() {
            let permissions = await authorizationClient.getPermissions();

            this.tableAdapter = rect => {
                    let tableSetting = this.tableSetting;

                    tableSetting.width = rect.width;
                    tableSetting.height = rect.height;
                };

            GLOBAL_EVENT_EMITTER.removeListener( FRAME_RECT, this.tableAdapter );
            GLOBAL_EVENT_EMITTER.on( FRAME_RECT, this.tableAdapter );

            this.table.data = permissions.body.result.map( data => {
                data.createTime = Dates.toLocalDateTimeString( data.createTime );
                data.updateTime = Dates.toLocalDateTimeString( data.updateTime );
                data.deleteTime = data.deleteTime <= 0 ? "" : Dates.toLocalDateTimeString( data.deleteTime );
                data.status = DataStatusEnum.getNameByStatus( data.status );
                return data;
            } );
        },
        destroyed() {
            GLOBAL_EVENT_EMITTER.removeListener( FRAME_RECT, this.tableAdapter );
            this.tableAdapter = null;
        }
    }
</script>