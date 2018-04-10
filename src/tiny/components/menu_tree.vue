<style>
  .menu-tree i,
  .menu-tree span {
    font-size: .9rem;
  }

  .menu-tree button {
    padding: .2rem .5rem;
  }
</style>
<template>
  <Row>
    <Tree class="menu-tree" :data="menus.root" :render="treeRender"></Tree>
  </Row>
</template>
<script>
  import { HashSet } from "jcdt";

  export default {
    name: "MenuTree",
    props: {
      data: {
        type: Array,
        required: true
      },
      isModified: {
        type: Function,
        default() {
          return ( newData, oldData ) => false
        }
      }
    },
    data() {
      return {
        menus: {
          root: [ {
            // 子节点加到这个集合
            children: [],
            expand: true,
            title: "根目录",
            render: ( h, { data, node, root } ) => {
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
                    // 这是增加根目录文件/文件夹的按钮
                    h( "Button", {
                      props: {
                        icon: "ios-plus-empty",
                        type: "primary"
                      },
                      style: {
                        marginRight: "0",
                        width: "4rem"
                      },
                      on: { click: () => this.beforeAppendMenu( data, node, root, true ) }
                    } )
                  ] ),

                  h( "Icon", {
                    props: { type: "ios-folder" },
                    style: { marginRight: ".3rem" }
                  } ),
                  h( "span", "根目录" )
                ] ),
              ] );
            }
          } ],

          exists: new HashSet(),
          removed: new HashSet(),
          recover: new HashSet(),
          newBorn: new HashSet(),

          // 被选择的节点
          selectedItem: null,

          // 将要加入新节点的父节点
          appendedItem: null
        }
      };
    },
    watch: {
      data( val ) {
        let exists = this.menus.exists,
          copier = val.slice();

        exists.clear();

        // 迭代所有节点获取菜单名
        ( function walk( data, datas = [] ) {
          if ( !data ) {
            return;
          }

          exists.add( data.name );

          if ( data.children ) {
            for ( let item of data.children ) {
              exists.add( item.name );

              if ( item.children && item.children.length > 0 ) {
                datas.push( item );
              }
            }
          }

          return datas.length > 0 ? walk( datas.shift(), datas ) : null;

        } )( copier.shift(), copier );

        this.menus.root[ 0 ].children = val ? val : [];
      }
    },
    methods: {
      initAttrForTreeItem( data ) {
        if ( !( "new" in data ) ) {
          this.$set( data, "new", false );
        }

        if ( !( "root" in data ) ) {
          this.$set( data, "root", false );
        }

        if ( !( "leaf" in data ) ) {
          this.$set( data, "leaf", false );
        }

        if ( !( "expand" in data ) ) {
          this.$set( data, "expand", true );
        }

        if ( !( "selected" in data ) ) {
          this.$set( data, "selected", false );
        }

        if ( !( "disabled" in data ) ) {
          this.$set( data, "disabled", false );
        }
      },
      treeRender( h, { data, node, root } ) {
        this.initAttrForTreeItem( data );

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
            // 这是新增/恢复按钮
            h( "Button", {
              props: { icon: "ios-plus-empty" },
              style: {
                marginRight: "1rem",
              },

              attrs: { disabled: !data.disabled && data.leaf },
              on: {
                click: () => this.beforeAppendMenu( data, node, root, false )
              }
            } ),

            // 这是删除按钮
            h( "Button", {
              props: { icon: "ios-minus-empty" },
              attrs: { disabled: data.disabled },
              on: {
                click: () => this.removeMenu( data, node, root )
              }
            } )
          ] ),

          //
          h( "span", {
            style: {
              color: `${data.disabled && data.new
                ? "blue" : data.disabled ? "red" : data.new ? "green" : ""}`
            }
          }, [
            h( "Icon", {
              props: { type: data.leaf ? "ios-paper-outline" : "ios-folder" },
              style: { marginRight: ".3rem" }
            } ),
            h( "span", {
              "class": `ivu-tree-title
                            ${data.selected && !data.disabled ? "ivu-tree-title-selected" : ""}
                            ${data.disabled ? "ivu-tree-arrow-disabled" : ""}`,
              style: {
                color: `${data.disabled && data.new
                  ? "blue" : data.disabled ? "red" : data.new ? "green" : ""}`
              },
              on: {
                click: () => this.selectMenu( data, node, root )
              }
            }, data.name )
          ] )
        ] );
      },

      beforeAppendMenu( data, node, root, isRoot ) {
        if ( !data.disabled ) {
          this.menus.appendedItem = data;
          this.$emit( "on-append-menu", data, node, root, isRoot );
          return;
        }

        let parent = root.find( el => el.nodeKey === node.parent ),
          recover = this.menus.recover,
          removed = this.menus.removed;

        // 如果当前节点已经删除但还没保存到服务器, 从 removes 集合中移除该元素, 否则加入到 recover 集合
        removed.contains( data.id ) ? removed.remove( data.id ) : recover.add( data.id );
        data.disabled = data.selected = false;

        if ( !parent ) {
          return;
        }

        let parentData = parent.node;
        while ( parentData.disabled ) {
          removed.contains( parentData.id ) ? removed.remove( parentData.id ) : recover.add( parentData.id );
          parent = root.find( el => el.nodeKey === parent.parent );
          parentData.disabled = false;

          if ( !parent ) {
            return;
          }

          parentData = parent.node;
        }
      },
      removeMenu( data, node, root ) {
        if ( data.new ) {
          let parent = root.find( el => el.nodeKey === node.parent ).node,
            children = parent.children;

          children.splice( children.indexOf( data ), 1 );

          // 从新增列表中删除该节点
          let iterator = this.menus.newBorn.iterator();
          while ( iterator.hasNext() ) {
            if ( iterator.next().name === data.name ) {
              iterator.remove();
              break;
            }
          }

          return;
        }

        let hasChild = node => node.children && node.children.length > 0,
          removed = this.menus.removed,
          removeNode = data => {
            removed.add( data.id );

            data.disabled = true;
            data.selected = false;
          };

        // 先删除自身
        if ( !hasChild( data ) ) {
          removeNode( data );
          return;
        }

        // 然后迭代子节点并删除
        ( function walk( data, datas = [] ) {
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
        } )( data );
      },
      selectMenu( data ) {
        let oldData = this.selectedItem;

        // 留给外部定义, 如果不符合某些条件时禁止切换
        if ( this.isModified( data, oldData ) ) {
          return;
        }

        if ( this.selectedItem === data ) {
          data.selected = false;

        } else {
          if ( this.selectedItem ) {
            this.selectedItem.selected = false;
          }

          data.selected = true;
          this.selectedItem = data;
        }

        this.$emit( "on-select-menu", data, oldData );
      },
      appendMenu( data ) {
        let menus = this.menus;

        if ( menus.exists.contains( data.name ) ) {
          this.$Message.warning( { content: `${data.name} 菜单已存在` } );
          return;
        }

        if ( !data.leaf ) {
          data.children = [];
        }

        menus.newBorn.add( data );
        menus.appendedItem.children.push( data );
      },
      getRemoved() {
        return this.menus.removed.toArray();
      },
      getRecover() {
        return this.menus.recover.toArray();
      },
      getNewBorn() {
        return this.menus.newBorn.toArray();
      },
      clear() {
        let menus = this.menus;

        menus.removed.clear();
        menus.recover.clear();
        menus.newBorn.clear();
      }
    }
  };
</script>