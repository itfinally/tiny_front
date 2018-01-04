<template>
    <Row>
        <slot name="searchTools">
            <Row type="flex" style="flex-direction: column; margin: .5rem 0; width: auto; max-height: 8rem;">
                <Form :model="table.condition" :label-width="60" inline>
                    <FormItem prop="account" :label-width="40" label="id">
                        <Input v-model="table.condition.id" type="text" placeholder="id"/>
                    </FormItem>
                    <FormItem prop="nickname" label="用户名">
                        <Input v-model="table.condition.nickname" type="text" placeholder="用户名"/>
                    </FormItem>
                    <FormItem label="用户状态">
                        <Select v-model="table.condition.status" :value="0" style="width: 6rem;">
                            <Option v-for="item in statusList" :value="item.status" :key="item.name">{{ item.name }}
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
                <Form inline>
                    <FormItem :label-width="0">
                        <Button @click="insertOrUpdate('on-data-insert')">新建</Button>
                    </FormItem>
                    <FormItem :label-width="0">
                        <Button @click="insertOrUpdate( 'on-data-delete', table.selected )">删除</Button>
                    </FormItem>
                    <FormItem :label-width="0">
                        <Button @click="activeQuery">
                            查询
                        </Button>
                    </FormItem>
                </Form>
            </Row>
        </slot>
        <Row>
            <Table :width="tableStyle.width" :height="tableStyle.height"
                   :columns="columns" :data="table.data" @on-selection-change="selectedTableData"></Table>
        </Row>
        <Row style="margin: .5rem 0;">
            <Page :current="table.cursor" :total="total" :page-size="table.scrollRange"
                  :page-size-opts="pageSizeOpts" :show-total="true" :show-elevator="true"
                  :show-sizer="true" placement="top" @on-change="moveTheCursor"
                  @on-page-size-change="changeScrollRange"></Page>
        </Row>
    </Row>
</template>

<script>
    import { GLOBAL_EVENT_EMITTER, FRAME_RECT } from "@admin/tools/constant";
    import { CoreUtils } from "@core";

    export default {
        name: "MultifunctionTable",
        props: {
            columns: {
                type: Array,
                required: true
            },
            data: {
                type: Array,
                required: true
            },

            condition: {
                type: Object
            },

            total: {
                type: Number,
                default: 0
            },
            current: {
                type: Number,
                default: 1
            },
            pageSize: {
                type: Number,
                default: 10
            },
            pageSizeOpts: {
                type: Array,
                default() {
                    return [ 10, 20, 40, 80, 160 ];
                }
            },

            statusList: {
                type: Array,
                default() {
                    return [ {
                        status: 1,
                        name: "正常"
                    }, {
                        status: -1,
                        name: "已删除"
                    }, {
                        status: 0,
                        name: "全选"
                    } ];
                }
            }
        },
        watch: {
            columns( val ) {
                this.table.keys = val;
            },
            condition( val ) {
                this.table.condition = val;
            },
            current( val ) {
                this.table.cursor = val;
            },
            pageSize( val ) {
                this.table.scrollRange = val;
            },
            data( val ) {
                let data = this.table.data = [],

                    // copy data, avoid to active dead loop by data observer ( the __observer__ object )
                    buffer = val.map( c => c );

                if ( val.length <= 0 ) {
                    return;
                }

                let asyncRender = new Promise( resolve => resolve() );
                buffer.forEach( item => asyncRender.then( () => Promise.resolve( data.push( item ) ) ) );
            }
        },
        data() {
            return {
                tableAdapter: null,

                tableStyle: {
                    width: 0,
                    height: 0
                },

                table: {
                    data: [],
                    buffer: [],
                    selected: [],

                    cursor: this.current,
                    scrollRange: this.pageSize,

                    condition: {
                        createStartTime: "",
                        createEndingTime: "",
                        updateStartTime: "",
                        updateEndingTime: "",
                        nickname: "",
                        id: "",
                        status: 0
                    }
                }
            };
        },
        mounted() {
            this.tableAdapter = rect => {
                let tableStyle = this.tableStyle;

                tableStyle.width = rect.width;
                tableStyle.height = rect.height;
            };

            GLOBAL_EVENT_EMITTER.removeListener( FRAME_RECT, this.tableAdapter );
            GLOBAL_EVENT_EMITTER.on( FRAME_RECT, this.tableAdapter );

            let table = this.table;

            this.$on( "table-condition-request", () => this.$emit(
                "table-condition-response", table.cursor, table.scrollRange, table.condition ) );

            this.$on( "table-condition-update-request", ( page, range, condition ) => {
                table.cursor = page;
                table.scrollRange = range;
                table.condition = condition;
            } );

            this.$on( "table-data-refresh", () => this.refreshTableData() );

            this.$emit( "on-data-count-loading", this.table.condition );
        },
        destroyed() {
            GLOBAL_EVENT_EMITTER.removeListener( FRAME_RECT, this.tableAdapter );
            this.tableAdapter = null;
        },
        methods: {
            moveTheCursor( current ) {
                let table = this.table;

                table.cursor = current;
                this.$emit( "on-data-loading", current, table.scrollRange, table.condition );
            },
            changeScrollRange( pageSize ) {
                let table = this.table;

                table.scrollRange = pageSize;
                this.$emit( "on-data-loading", table.cursor, pageSize, table.condition );
            },
            refreshTableData() {
                let data = this.table.data = [],
                    buffer = this.table.buffer,
                    asyncRender = new Promise( resolve => resolve() );

                buffer.forEach( item => asyncRender.then( () => Promise.resolve( data.push( item ) ) ) );
            },
            selectedTableData( selection ) {
                this.table.selected = selection;
            },
            insertOrUpdate( name, ...args ) {
                this.$emit( name, ...args );
            },
            activeQuery() {
                let table = this.table;
                this.$emit( 'on-data-loading', table.cursor, table.scrollRange, table.condition );
            }
        }
    }
</script>