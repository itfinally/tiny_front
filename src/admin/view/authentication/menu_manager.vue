<style>
    .frame-scroll {
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .tree i,
    .tree span {
        font-size: .9rem;
    }

    .tree button {
        padding: .2rem .5rem;
    }

    .tree-modal .ivu-modal-confirm-footer {
        margin-top: 1.5rem;
    }
</style>
<template>
    <Row type="flex">
        <Col span="10" style="border: 1px solid #dddee1">
        <Row class="frame-scroll" style="width: 100%; height: 100%;">
            <div style="margin: 0 .3rem; padding: .5rem 0; border-bottom: 1px solid #dddee1;">
                <Button type="primary" @click="saveMenuTree">保存菜单目录</Button>
            </div>
            <div>
                <Tree class="tree" style="margin: 0 .5rem;" :data="tree.root" :render="treeRender"></Tree>
            </div>
        </Row>
        </Col>
        <Col offset="1" span="13" style="border: 1px solid #dddee1">
        <Row type="flex" align="middle" justify="center" v-if="null === selected.item"
             style="width: 100%; height: 100%;">
            <span>暂无数据, 请选择其中一个菜单项</span>
        </Row>
        <Row class="frame-scroll" type="flex" justify="center" v-if="selected.item !== null"
             style="padding: .3rem;">
            <div style="width: 100%; margin: 0 .3rem .5rem; padding: .5rem 0; border-bottom: 1px solid #dddee1;">
                <Button type="primary" @click="saveMenuItem">保存菜单信息</Button>
            </div>
            <Form :label-width="50" style="width: 100%;">
                <FormItem :model="menu" label="菜单名">
                    <Input type="text" v-model="menu.name" placeholder="菜单名不能为空"/>
                </FormItem>
            </Form>
            <Transfer :data="menu.availableRole" :targetKeys="menu.targetRole" :list-style="{ width: '200px' }"
                      :titles="['角色列表', '可访问的角色']" @on-change="menuRoleChange"
                      :render-format="transferRender"></Transfer>
        </Row>
        </Col>

        <Modal v-model="modal.show" title="创建菜单项" @on-ok="onModalOk" @on-cancel="onModalCancel">
            <Form :model="modal" :label-width="85">
                <FormItem prop="name" label="菜单名">
                    <Input v-model="modal.name" placeholder="菜单名不能超过八个字..."/>
                </FormItem>
                <FormItem label="作为目录创建">
                    <RadioGroup v-model="modal.isFolder">
                        <Radio label="true">是</Radio>
                        <Radio label="false">否</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
        </Modal>
    </Row>
</template>

<script>
    import { CoreUtils, HashMap, HashSet, ArrayDeque } from "@core";
    import { menuClient, menuRoleClient, authorizationClient } from "@admin/rest/client";
    import { DataStatusEnum, ResponseStatusEnum } from "@admin/tools/constant";
    import { name } from "@/admin/tools/constant";

    export default {
        data() {
            return {
                selected: {
                    item: null,
                    roles: [],
                    name: "",
                },

                modal: {
                    isFolder: "false",
                    isRoot: false,
                    show: false,
                    item: null,
                    name: ""
                },

                menu: {
                    name: "",
                    targetRole: [],
                    availableRole: []
                },

                tree: {
                    root: [ {
                        title: "root",
                        expand: true,
                        render: ( h, { root, node, data } ) => {
                            return h( "span", {
                                style: {
                                    display: "inline-block",
                                    width: "100%"
                                }
                            }, [
                                h( "span", [
                                    h( "span", {
                                        style: {
                                            display: "inline-block",
                                            marginRight: "2rem",
                                            float: "right",
                                        }
                                    }, [
                                        h( "Button", {
                                            props: {
                                                icon: "ios-plus-empty",
                                                type: "primary"
                                            },
                                            style: {
                                                marginRight: "0rem",
                                                width: "4rem"
                                            },
                                            on: { click: () => this.appendNode( root, node, data, true ) }
                                        } )
                                    ] ),

                                    h( "Icon", {
                                        props: { type: "ios-paper-outline" },
                                        style: { marginRight: ".3rem" }
                                    } ),
                                    h( "span", "根目录" )
                                ] ),
                            ] );
                        },

                        // render tree with this
                        children: []
                    } ],

                    exists: new HashSet(),
                    removes: new HashSet(),
                    recovers: new HashSet(),
                    newNodeDetails: new ArrayDeque()
                }
            };
        },
        async mounted() {
            let menuResponse = await menuClient.getMenuTree(),
                tree = [];

            this.translateTo( tree, menuResponse.body.result );
            this.tree.root[ 0 ].children = tree;
        },
        methods: {
            translateTo( toMenus, fromMenus ) {
                let exists = this.tree.exists;

                for ( let elem of fromMenus ) {
                    exists.add( elem.name );

                    if ( elem.leaf ) {
                        toMenus.push( {
                            id: elem.id,
                            expand: true,
                            title: elem.name,
                            isRoot: elem.root,
                            isLeaf: elem.leaf,
                            disabled: elem.status === DataStatusEnum.DELETE.status
                        } );
                        continue;
                    }

                    if ( elem.childes.length <= 0 ) {
                        continue;
                    }

                    let childrens = [];
                    toMenus.push( {
                        id: elem.id,
                        expand: true,
                        title: elem.name,
                        isRoot: elem.root,
                        isLeaf: elem.leaf,
                        children: childrens,
                        disabled: elem.status === DataStatusEnum.DELETE.status
                    } );

                    this.translateTo( childrens, elem.childes );
                }
            },
            itemDescriptionInitialize( data ) {
                if ( !("selected" in data) ) {
                    this.$set( data, "selected", false );
                }

                if ( !("disabled" in data) ) {
                    this.$set( data, "disabled", false );
                }

                if ( !("disableCheckbox" in data) ) {
                    this.$set( data, "disableCheckbox", false );
                }

                if ( !("checked" in data) ) {
                    this.$set( data, "checked", false );
                }

                if ( !("expand" in data) ) {
                    this.$set( data, "expand", true );
                }

                // the old always false
                if ( !("isNew" in data) ) {
                    this.$set( data, "isNew", false );
                }

                if ( !("isRoot" in data) ) {
                    this.$set( data, "isRoot", false );
                }
            },
            treeRender( h, { root, node, data } ) {
                this.itemDescriptionInitialize( data );

                return h( "span", {
                    style: {
                        display: "inline-block",
                        width: "100%"
                    }
                }, [
                    h( "span", {
                        style: {
                            display: "inline-block",
                            marginRight: "2rem",
                            float: "right",
                        }
                    }, [
                        h( "Button", {
                            props: { icon: "ios-plus-empty" },
                            style: { marginRight: "1rem" },

                            // if node is remove, pass
                            // if node is normal but also is leaf, ban
                            attrs: { disabled: !data.disabled && data.isLeaf },
                            on: { click: () => this.appendNode( root, node, data, false ) }
                        } ),
                        h( "Button", {
                            props: { icon: "ios-minus-empty" },
                            attrs: { disabled: data.disabled },
                            on: { click: () => this.removeNode( root, node, data ) }
                        } )
                    ] ),

                    // after float element
                    h( "span", {
                        style: {
                            color: `${data.disabled && data.isNew
                                ? "blue" : data.disabled ? "red" : data.isNew ? "green" : ""}`
                        }
                    }, [
                        h( "Icon", {
                            props: { type: data.isLeaf ? "ios-paper-outline" : "ios-folder" },
                            style: { marginRight: ".3rem" }
                        } ),
                        h( "span", {
                            "class": `ivu-tree-title
                            ${data.selected && !data.disabled ? "ivu-tree-title-selected" : ""}
                            ${data.disabled ? "ivu-tree-arrow-disabled" : ""}`,
                            style: {
                                color: `${data.disabled && data.isNew
                                    ? "blue" : data.disabled ? "red" : data.isNew ? "green" : ""}`
                            },
                            on: {
                                click: () => this.selectNode( root, node, data )
                            }
                        }, data.title )
                    ] )
                ] );
            },
            appendNode( root, node, data, isRoot ) {
                if ( data.disabled ) {
                    data.disabled = !data.disabled;
                    data.selected = false;
                    data.checked = false;

                    let parent = root.find( el => el.nodeKey === node.parent ),
                        recover = this.tree.recovers,
                        removes = this.tree.removes;

                    // if remove but not save yet, use 'removes'
                    // otherwise use 'recover'
                    removes.contains( data.id ) ? removes.remove( data.id ) : recover.add( data.id );

                    if ( !parent ) {
                        return;
                    }

                    let pNode = parent.node;
                    while ( pNode.disabled ) {
                        // the reason of 'undefined' is server can recover parent by child
                        removes.contains( pNode.id ) ? removes.remove( pNode.id ) : undefined;
                        parent = root.find( el => el.nodeKey === parent.parent );
                        pNode.disabled = !pNode.disabled;

                        if ( !parent ) {
                            return;
                        }

                        pNode = parent.node;
                    }

                    return;
                }

                let modal = this.modal;
                modal.isRoot = isRoot;
                modal.item = data;
                modal.show = true;
            },
            removeNode( root, node, data ) {
                // remove new
                if ( data.isNew ) {
                    let parent = root.find( el => el.nodeKey === node.parent ).node,
                        children = parent.children;

                    children.splice( children.indexOf( data ), 1 );
                    this.tree.exists.remove( data.title );
                    return;
                }

                let hasChild = node => !!node.children && node.children.length > 0,
                    removes = this.tree.removes,
                    removeNode = data => {
                        removes.add( data.id );

                        data.disabled = true;
                        data.checked = false;
                        data.selected = false;
                    };

                // done if node is leaf
                if ( !hasChild( data ) ) {
                    removeNode( data );
                    return;
                }

                (function walk( data, datas = [] ) {
                    removeNode( data );

                    if ( hasChild( data ) ) {
                        for ( let elem of data.children ) {
                            removeNode( elem );

                            if ( hasChild( elem ) ) {
                                datas.push( ...elem.children );
                            }
                        }
                    }

                    return datas.length > 0 ? walk( datas.shift(), datas ) : undefined;
                })( data );
            },
            async selectNode( root, node, data ) {
                if ( data.isNew ) {
                    this.$Message.warning( { content: "请先保存新菜单再设置" } );
                    return;
                }

                if ( this.isModified() ) {
                    this.$Message.warning( { content: "菜单已被修改, 请先保存" } );
                    return;
                }

                data.selected = !data.selected;
                data.checked = !data.checked;

                let selected = this.selected;
                if ( data === selected.item ) {
                    selected.item = data.selected ? data : null;

                } else {
                    let item = selected.item;
                    if ( item !== null ) {
                        item.selected = false;
                        item.checked = false;
                    }

                    selected.item = data;
                }

                let availableRoleResponse = menuRoleClient.queryAvailableRole( data.id ),
                    existRolesResponse = menuRoleClient.queryMenuItemRoles( data.id ),

                    availableRole = (await availableRoleResponse).body.result,
                    existRole = (await existRolesResponse).body.result,
                    menu = this.menu;

                selected.name = menu.name = data.title;
                selected.roles = existRole.map( role => role.id );      // role id list

                menu.availableRole = availableRole.concat( existRole ).map( role => {
                    return {
                        key: role.id,
                        label: role.name,
                        description: role.description
                    };
                } );

                menu.targetRole = existRole.map( role => role.id );
            },
            menuRoleChange( targetKeys ) {
                this.menu.targetRole = targetKeys;
            },
            transferRender( item ) {
                return `${item.label} - ${item.description}`;
            },
            isModified() {
                let selected = this.selected,
                    menu = this.menu;

                if ( selected.roles.length !== menu.targetRole.length ) {
                    return true;
                }

                let exists = selected.roles;
                for ( let roleId of menu.targetRole ) {
                    if ( exists.indexOf( roleId ) < 0 ) {
                        return true;
                    }
                }

                return selected.name !== menu.name;
            },
            onModalOk() {
                let modal = this.modal,
                    data = modal.item,
                    children = data.children || [];

                if ( "" === modal.name || /^\s+$/.test( modal.name ) ) {
                    return;
                }

                if ( this.tree.exists.contains( modal.name ) ) {
                    this.$Message.warning( { content: `${modal.name} 菜单已存在` } );
                    this.onModalCancel();
                    return;
                }

                children.push( {
                    isNew: true,
                    title: modal.name,
                    isRoot: modal.isRoot,
                    isLeaf: "true" !== modal.isFolder
                } );

                if ( !("children" in data) ) {
                    this.$set( data, "children", children );
                }

                let tree = this.tree;
                tree.exists.add( modal.name );
                tree.newNodeDetails.offerFirst( {
                    parent: modal.isRoot ? null : { id: data.id, name: data.title },
                    isLeaf: "true" !== modal.isFolder,
                    isRoot: modal.isRoot,
                    name: modal.name,
                    checkCount: 0       // avoid dead loop
                } );

                this.onModalCancel();
            },
            onModalCancel() {
                let modal = this.modal;

                modal.name = "";
                modal.item = null;
                modal.show = false;
                modal.isFolder = "false";
            },
            async saveMenuTree() {
                let tree = this.tree,
                    nameMapping = new HashMap(),
                    details = tree.newNodeDetails,
                    isCreated = !details.isEmpty();

                // remove nodes
                if ( !tree.removes.isEmpty() ) {
                    await menuClient.removeMultiMenuItem( tree.removes.toArray() );
                }

                // recover nodes
                if ( !tree.recovers.isEmpty() ) {
                    await menuClient.recoverMenuMultiItem( tree.recovers.toArray() );
                }

                let detail, response;

                while ( !details.isEmpty() ) {
                    detail = details.pollLast();

                    if ( null === detail ) {
                        continue;
                    }

                    // add menu item by loop, because user can be create some menu item under new menu item,
                    // and this item haven't id,
                    if ( detail.isRoot ) {
                        response = await menuClient.addRootMenu( detail.name, detail.isLeaf );

                    } else if ( !CoreUtils.isNone( detail.parent.id ) ) {
                        response = await menuClient.addMenu( detail.parent.id, detail.name, detail.isLeaf );

                    } else if ( nameMapping.containsKey( detail.parent.name ) ) {
                        response = await menuClient.addMenu( nameMapping.get( detail.parent.name ), detail.name, detail.isLeaf );

                    } else if ( detail.checkCount < 3 ) {
                        detail.checkCount += 1;
                        details.offerFirst( detail );

                    } else {
                        this.$Message.warning( { content: `${detail.name} 菜单创建失败` } );
                        continue;
                    }

                    if ( response.statusCode === ResponseStatusEnum.SUCCESS.statusCode ) {
                        nameMapping.put( detail.name, response.result.id );
                    }
                }

                if ( isCreated ) {
                    this.$Message.info( { content: "菜单创建完毕" } );
                }

                // menu tree refresh
                let container = [];
                response = await menuClient.getMenuTree();
                this.translateTo( container, response.body.result );
                this.tree.root[ 0 ].children = container;

                this.$Message.info( { content: "菜单已更新" } );
            },
            async saveMenuItem() {
                if( !this.isModified() ) {
                    return;
                }

                let selected = this.selected,
                    menu = this.menu,

                    targetRole = menu.targetRole,
                    roles = selected.roles,

                    theNews = targetRole.filter( id => roles.indexOf( id ) < 0 ),
                    deletes = roles.filter( id => targetRole.indexOf( id ) < 0 );


                let theNewsRequest, deletesRequest, renameRequest;
                theNewsRequest = deletesRequest = renameRequest = Promise.resolve();

                if ( theNews.length > 0 ) {
                    theNewsRequest = await menuRoleClient.addRoleMenu( selected.item.id, theNews );
                }

                if ( deletes.length > 0 ) {
                    deletesRequest = await menuRoleClient.removeRoleMenu( selected.item.id, deletes );
                }

                if ( selected.name !== menu.name ) {
                    renameRequest = await menuClient.rename( selected.item.id, menu.name );
                }

                selected.name = menu.name;
                selected.roles = targetRole;

                this.$Message.info( { content: "已更新菜单信息" } );
            }
        }
    };
</script>