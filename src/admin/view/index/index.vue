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
                    <Menu :class="{'menu-hidden': !menus.show}" @on-select="selectMenuItem"
                          :active-name="viewControl.activeMenu" style="width: 100%; position: absolute;">
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
                    <Tabs type="card" :value="viewControl.activeTab" @on-click="selectTab" @on-tab-remove="removeTab"
                          closable>
                        <TabPane v-for="tab in viewControl.tabs" :key="tab.tabId" :name="tab.tabId"
                                 :label="tab.name"></TabPane>
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
    import md5 from "blueimp-md5";

    import { HashMap } from "@core/index";
    import { menuClient } from "@admin/rest/client";

    import {
        GLOBAL_EVENT_EMITTER,
        GLOBAL_CACHE,
        MENU_INITIALIZE,
        MENU_ITEMS,
        FRAME_RECT,
        GO_TO_MENU,
        UPDATE_MENU
    } from "@admin/tools/constant";

    let tableForId, tableForRouter;

    export default {
        data() {
            return {
                menus: {
                    members: [],

                    span: 4,
                    show: true,
                    memberWidth: "auto"
                },

                viewControl: {
                    activeMenu: "",
                    activeTab: "",

                    tabs: []
                }
            }
        },
        async mounted() {
            let response = await menuClient.getMenuTree(),
                menus = this.menus,
                table;

            // create menus
            [ table, menus.members ] = this.translateTo( response.body.result );

            // translate table
            tableForId = this.translateTableTo( table, ( item, menuTable ) => menuTable.put( item.id, item ) );
            tableForRouter = this.translateTableTo( table, ( item, menuTable ) => menuTable.put( item.path, item ) );

            GLOBAL_EVENT_EMITTER.emit( MENU_INITIALIZE, table );
            GLOBAL_CACHE.put( MENU_ITEMS, tableForId );

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

            // add menu tab dispatcher
            this.createMenuWatcher();

            window.v = this.viewControl;

            // help gc
            table = response = menus = null;
        },
        methods: {
            translateTo( menu, table = new HashMap(), root = null ) {
                if ( menu.length <= 0 ) {
                    let menus = [];
                    for ( let item of table.values() ) {
                        menus.push( item );
                    }

                    return [ table, menus ];
                }

                let elem = menu.pop();

                if ( elem.root ) {
                    root = elem;

                    table.put( elem.id, {
                        id: elem.id,
                        name: elem.name,
                        path: elem.path,
                        leaf: elem.leaf,
                        root: elem.root,
                        childes: []
                    } );

                } else {
                    table.get( root.id ).childes.push( {
                        id: elem.id,
                        name: elem.name,
                        path: elem.path,
                        leaf: elem.leaf,
                        group: elem.name
                    } );
                }

                if ( !elem.leaf ) {
                    menu = menu.concat( elem.childes );
                }

                return this.translateTo( menu, table, root );
            },

            translateTableTo( table, processCallBack ) {
                let menuTable = new HashMap( table.size() );
                for ( let item of table.entrySet() ) {
                    ( function walk( item ) {

                        if ( item.leaf ) {
                            processCallBack( item, menuTable );
                            return;
                        }

                        if ( !item.childes ) {
                            console.log( "Missing menu item." );
                            console.log( item.childes );
                            return;
                        }

                        for ( let children of item.childes ) {
                            walk( children );
                        }

                    } )( item.value );
                }

                return menuTable;
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

            createMenuWatcher() {
                let getMenu = vueInstance => {
                    let instanceRouteMatched = vueInstance.$router.history.current.matched,
                        menu = null;

                    instanceRouteMatched.some( matcher => {
                        if ( tableForRouter.containsKey( matcher.path ) ) {
                            menu = tableForRouter.get( matcher.path );
                            return true;
                        }

                        return false;
                    } );

                    if ( null === menu ) {
                        console.warn( `No match router...` );
                        console.warn( [ instanceRouteMatched, vueInstance ] );

                        this.$Message.error( { "content": "网页路由错误, 请联系网页开发者" } );
                        return null;
                    }

                    return menu;
                };

                // update url and tab id when url has been replace
                GLOBAL_EVENT_EMITTER.on( UPDATE_MENU, ( oldUrl, newUrl, vueInstance ) => {
                    let menu = getMenu( vueInstance );
                    if ( null === menu ) {
                        return;
                    }

                    let viewControl = this.viewControl,
                        oldTabId = md5( `${menu.id}_${oldUrl}` ),
                        newTabId = md5( `${menu.id}_${newUrl}` ),
                        tab = null;

                    viewControl.tabs.some( item => {
                        if ( item.url === oldUrl ) {
                            tab = item;
                            return true;
                        }

                        return false;
                    } );

                    if ( null == tab ) {
                        GLOBAL_EVENT_EMITTER.emit( GO_TO_MENU, newUrl, vueInstance );
                        return;
                    }

                    tab.url = newUrl;
                    tab.tabId = newTabId;

                    if ( viewControl.activeTab === oldTabId ) {
                        viewControl.activeTab = newTabId;
                    }
                } );

                // url          -> id of component instance
                // vueInstance  -> component instance object
                GLOBAL_EVENT_EMITTER.on( GO_TO_MENU, ( url, vueInstance ) => {
                    let menu = getMenu( vueInstance );
                    if ( null === menu ) {
                        return;
                    }

                    let viewControl = this.viewControl,
                        tabId = md5( `${menu.id}_${url}` ),

                        // if exist
                        exist = viewControl.tabs.some( item => {
                            if ( item.tabId === tabId ) {
                                viewControl.activeMenu = item.menuId;
                                viewControl.activeTab = item.tabId;
                                return true;
                            }

                            return false;
                        } );

                    if ( exist ) {
                        return;
                    }

                    viewControl.tabs.push( {
                        url, tabId,
                        menuId: menu.id,
                        name: menu.name
                    } );

                    viewControl.activeMenu = menu.id;
                    viewControl.activeTab = tabId;
                } );
            },

            selectMenuItem( menuId ) {
                let table = GLOBAL_CACHE.get( MENU_ITEMS );
                if ( !table ) {
                    this.$Message.warning( { "content": "菜单列表尚未初始化" } );
                    return;
                }

                // change the url like /a/b/c/:d/:e -> /a/b/c
                this.$router.push( { path: tableForId.get( menuId ).path.split( "/:" )[ 0 ] } );
            },
            selectTab( tabId ) {
                this.viewControl.tabs.some( item => {
                    if ( item.tabId === tabId ) {
                        this.$router.push( { path: tableForId.get( item.menuId ).path.split( "/:" )[ 0 ] } );
                        return true;
                    }

                    return false;
                } );
            },
            removeTab( tabId ) {
                let viewControl = this.viewControl,
                    tabs = viewControl.tabs;

                if ( tabs.length <= 1 ) {
                    viewControl.activeTab = viewControl.activeMenu = "";
                    viewControl.tabs = [];

                    this.$router.replace( "/index" );
                    return;
                }

                let index = 0;
                tabs.some( ( item, i, array ) => {
                    if ( tabId === item.tabId ) {
                        array.splice( i, 1 );
                        index = i;
                        return true;
                    }

                    return false;
                } );

                // if the node that has been removed is not active, do nothing.
                if ( viewControl.activeTab !== tabId ) {
                    return;
                }

                // if remove the last, take a step back.
                if ( index >= tabs.length ) {
                    index = tabs.length - 1;
                }

                this.$router.push( { path: tableForId.get( tabs[ index ].menuId ).path.split( "/:" )[ 0 ] } );
            }
        }
    }
</script>