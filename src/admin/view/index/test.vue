<style>
    .frame-scroll {
        /*overflow-x: hidden;*/
        overflow-y: scroll;
    }
</style>
<template>
    <Row type="flex" style="flex-direction: column;">
        <Row style="width: 100%; height: 3rem; background-color: #373d41;">

        </Row>
        <Row type="flex" style="width: 100%; flex: 1;">
            <Col span="4">
            <Row type="flex" style="height: 100%; flex-direction: column;">
                <Row style="width: 100%; height: 1.5rem;
                background-color: rgba(73,80,95,0.9); text-align: center; cursor: pointer;">
                    <Icon type="ios-barcode-outline" style="font-size: 1.5rem; color: aliceblue;"></Icon>
                </Row>
                <Row class="frame-scroll" ref="navMenu" style="flex: 1;">
                    <Menu style="width: 100%; position: absolute;">
                        <template v-for="item in menus">
                            <Submenu v-if="!item.leaf" :name="item.id">
                                <template slot="title">
                                    <Icon type="android-menu" size="20"></Icon>
                                    {{ item.name }}
                                </template>
                                <template v-for="subItem in item.childes">
                                    <Menu-item v-if="subItem.leaf" :name="subItem.id">{{ subItem.name }}</Menu-item>
                                </template>
                            </Submenu>
                            <Menu-item v-if="item.leaf" :name="item.id">{{ item.name }}</Menu-item>
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
                <Row style="margin-top: .3rem; flex: 1; overflow-y: hidden;" ref="frame">
                    <div class="frame-scroll" style="width: 100%; height: 100%; position: absolute;">
                        <div style="height: 30rem; background-color: red;"></div>
                        <div style="height: 30rem; background-color: black;"></div>
                        <div style="height: 30rem; background-color: beige;"></div>
                    </div>
                </Row>
            </Row>
            </Col>
        </Row>
    </Row>
</template>

<script>
    import { HashMap, HashSet } from "@core/index";
    import { menuClient } from "@admin/rest/client";
    import { GLOBAL_EVENT_EMITTER } from "@admin/tools/constant";

    export default {
        data() {
            return {
                menus: []
            }
        },
        async mounted() {
            let response = await menuClient.getMenuTree();
            this.menus = this._translateTo( response.body.result );

            //
//            GLOBAL_EVENT_EMITTER.emit( MENU_INITIALIZE, response.body.result );
        },
        methods: {
            _translateTo( menu, table = new HashMap(), root = null ) {
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

                return this._translateTo( menu, table, root );
            }
        }
    }
</script>