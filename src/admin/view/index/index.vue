<style>
    .frame-scroll {
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .frame > * {
        height: 100%;
    }

    /* hook iview menu to  */
    .menu-hidden .ivu-menu-submenu-title > span,
    .menu-hidden .ivu-menu-item > span {
        visibility: hidden;
        white-space: nowrap;
    }

    /* reset iview menu font size */
    .ivu-menu, .ivu-menu-submenu-title > .ivu-icon,
    .ivu-menu > .ivu-menu-item {
        font-size: .9rem !important;
    }

    /* reset iview menu arrow position */
    .ivu-menu-vertical .ivu-menu-submenu-title-icon {
        float: left;
        font-size: 20px;
    }

    /* cancel iview sub menu padding */
    .ivu-menu-vertical .ivu-menu-submenu .ivu-menu-item {
        padding-left: 24px;
    }
</style>
<template>
    <Row type="flex" style="flex-direction: column;">
        <Row style="width: 100%; height: 3rem; background-color: #373d41;">

        </Row>
        <Row type="flex" style="width: 100%; flex: 1;">
            <Col :span="menus.span">
            <Row type="flex" style="height: 100%; flex-direction: column;">
                <Row style="width: 100%; height: 1.5rem;">
                    <div @click="showMenuOrHidden"
                         style="background-color: rgba(73,80,95,0.9); text-align: center; cursor: pointer;">
                        <Icon type="ios-barcode-outline" style="color: aliceblue;" size="20"></Icon>
                    </div>
                </Row>
                <Row class="frame-scroll" ref="navMenu" style="flex: 1;">
                    <Menu :class="{'menu-hidden': !menus.show}" @on-select="selectMenuItem" style="width: 100%; position: absolute;">
                        <template v-for="item in menus.members">
                            <Submenu :style="{width: menus.memberWidth}" v-if="!item.leaf" :name="item.id">
                                <template slot="title">
                                    <span>{{ item.name }}</span>
                                </template>
                                <template v-for="subItem in item.childes">
                                    <Menu-item v-if="subItem.leaf" :name="subItem.id">
                                        <Icon type="android-menu"></Icon>
                                        <span>{{ subItem.name }}</span>
                                    </Menu-item>
                                </template>
                            </Submenu>
                            <Menu-item v-if="item.leaf" :name="item.id">
                                <Icon type="android-menu"></Icon>
                                <span>{{ subItem.name }}</span>
                            </Menu-item>
                        </template>
                    </Menu>
                </Row>
            </Row>
            </Col>
            <Col style="border-left: 1px solid #dddee1; padding: .3rem; flex: 1;">
            <Row type="flex" style="flex-direction: column; height: 100%;">
                <Row style="width: 100%; height: 2rem;">
                    <Tabs type="card" closable>
                        <TabPane label="标签一"></TabPane>
                        <TabPane label="标签二"></TabPane>
                        <TabPane label="标签三"></TabPane>
                    </Tabs>
                </Row>
                <Row ref="frame" style="margin-top: .3rem; flex: 1;">
                    <div class="frame frame-scroll" style="width: 100%; height: 100%; position: absolute;">
                        <router-view></router-view>
                    </div>
                </Row>
            </Row>
            </Col>
        </Row>
    </Row>
</template>

<script>
    import { HashMap } from "@core/index";
    import { menuClient } from "@admin/rest/client";

    import {
        GLOBAL_EVENT_EMITTER,
        GLOBAL_CACHE,
        MENU_INITIALIZE,
        MENU_ITEMS,
        FRAME_RECT
    } from "@admin/tools/constant";

    export default {
        data() {
            return {
                menus: {
                    members: [],

                    span: 4,
                    show: true,
                    memberWidth: "auto"
                }
            }
        },
        async mounted() {
            let response = await menuClient.getMenuTree(),
                menusItems = response.body.result,
                menus = this.menus;

            // create menus
            menus.members = this.translateTo( menusItems );

            GLOBAL_EVENT_EMITTER.emit( MENU_INITIALIZE, menusItems );
            GLOBAL_CACHE.put( MENU_ITEMS, menusItems );

            // create frame notification
            let timer,
                frameModifiedNotification = this.frameModifiedNotification.bind( this );

            // reset immediately
            setTimeout( frameModifiedNotification, 0 );

            // active sender
            window.onresize = () => {
                clearTimeout( timer );
                timer = setTimeout( frameModifiedNotification, 300 );
            };

            // help gc
            response = menusItems = menus = null;
        },
        methods: {
            translateTo( menu, table = new HashMap(), root = null ) {
                if ( menu.length <= 0 ) {
                    let menus = [];
                    for ( let item of table.values() ) {
                        menus.push( item );
                    }

                    return menus;
                }

                let elem = menu.pop();

                if ( elem.root ) {
                    root = elem;

                    table.put( elem.id, {
                        id: elem.id,
                        name: elem.name,
                        leaf: elem.leaf,
                        root: elem.root,
                        childes: []
                    } );

                } else {
                    table.get( root.id ).childes.push( {
                        id: elem.id,
                        name: elem.name,
                        leaf: elem.leaf,
                        group: elem.name
                    } );
                }

                if ( !elem.leaf ) {
                    menu = menu.concat( elem.childes );
                }

                return this.translateTo( menu, table, root );
            },
            showMenuOrHidden() {
                let menus = this.menus;

                menus.show = !menus.show;
                menus.span = menus.show ? 4 : 1;

                // calculate frame width after frame resize
                setTimeout( this.frameModifiedNotification, 0 );
            },
            frameModifiedNotification() {
                let frame = this.$refs.frame.$el,
                    rect = frame.getBoundingClientRect();

                // notify
                GLOBAL_EVENT_EMITTER.emit( FRAME_RECT, {
                    width: Math.floor( rect.width ),
                    height: Math.floor( rect.height )
                } )
            },
            selectMenuItem() {

            }
        }
    }
</script>