<template>
  <Row type="flex">
    <Col span="10" style="border: 1px solid #dddee1;">
      <Row style="margin: 0 .3rem; padding: .5rem 0; border-bottom: 1px solid #dddee1;">
        <Button type="primary" @click="saveMenuTreeWrapper">保存菜单目录</Button>
      </Row>
      <MenuTree ref="menuTree" :data="menus" :is-modified="isModified" style="margin-left: .3rem;"
                @on-append-menu="openAppendMenuModal" @on-select-menu="selectMenu" :disabled="!security.isAdmin"/>
    </Col>
    <Col offset="1" span="13" style="border: 1px solid #dddee1;">
      <Row type="flex" align="middle" justify="center" v-if="null === selected.data"
           style="width: 100%; height: 100%;">
        <span>暂无数据, 请选择其中一个菜单项</span>
      </Row>
      <Row type="flex" justify="center" v-if="selected.data !== null" style="padding: .3rem;">
        <div style="width: 100%; margin: 0 .3rem .5rem; padding: .5rem 0; border-bottom: 1px solid #dddee1;">
          <Button type="primary" @click="saveMenuItemWrapper">保存菜单信息</Button>
        </div>
        <Form :model="selected" :label-width="60" style="width: 100%;">
          <FormItem label="菜单名">
            <Input type="text" v-model="selected.name" placeholder="菜单名不能为空"/>
          </FormItem>
          <FormItem label="菜单路径" v-if="selected.leaf">
            <Input type="text" v-model="selected.path" placeholder="菜单路径不能为空"/>
          </FormItem>
        </Form>
        <DataTransfer ref="dataTransfer" :data="selected.all" :target-keys="selected.used"
                      :titles="['角色列表', '可访问的角色']" :list-style="{ width: '15.8rem', height: '18rem' }"/>
      </Row>
    </Col>

    <Modal v-model="creatorModal.open" title="创建菜单项" @on-ok="appendMenu" @on-cancel="cancelAppendMenu">
      <Form :model="creatorModal" :label-width="85">
        <FormItem prop="name" label="菜单名">
          <Input v-model="creatorModal.name" placeholder="菜单名不能超过八个字..."/>
        </FormItem>
        <FormItem prop="name" label="菜单路径" v-if="'false' === creatorModal.folder">
          <Input v-model="creatorModal.path" placeholder="菜单路径不能为空..."/>
        </FormItem>
        <FormItem label="作为目录创建">
          <RadioGroup v-model="creatorModal.folder">
            <Radio label="true">是</Radio>
            <Radio label="false">否</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
  </Row>
</template>
<script>
  import BasicPath from "@/tiny/components/basis/basic_page";
  import MenuTree from "@/tiny/components/menu_tree";
  import DataTransfer from "@/tiny/components/data_transfer";

  import { ArrayDeque, CoreUtils, HashMap } from "jcdt";
  import { CLOSE_MASK, GLOBAL_EVENT_EMITTER, OPEN_MASK } from "@/tiny/support/commons";
  import { EntityStatus, ResponseStatus } from "@/tiny/support/status";
  import { menuClient, roleClient } from "@/tiny/web/client";

  export default {
    extends: BasicPath,
    components: { MenuTree, DataTransfer },
    data() {
      return {
        menus: [],
        creatorModal: {
          open: false,

          name: "",
          path: "",
          root: false,
          parentId: "",
          parentName: "",
          folder: "false"
        },

        selected: {
          data: null,

          name: "",
          path: "",
          leaf: false,

          oldName: "",
          oldPath: "",
          wasLeaf: false,

          all: [],
          used: []
        },

        security: {
          isAdmin: false
        }
      }
    },
    async mounted() {
      let security = this.security;
      security.isAdmin = await this.hasRole( "admin" );

      let response = await menuClient.getMenus();
      this.menus = this.buildMenu( response.data.result );

      this.updatePath( this.$route.path );
    },
    methods: {
      buildMenu( members, relations = new HashMap() ) {
        if ( members.length <= 0 ) {
          return relations.values().toArray().filter( item => item.root );
        }

        let item = members.shift();

        if ( item.root ) {
          relations.put( item.id, {
            id: item.id, name: item.name, path: item.path,
            root: item.root, leaf: item.leaf, children: [],
            disabled: item.status === EntityStatus.DELETE.status
          } );
        }

        if ( !item.leaf ) {
          let parent = relations.get( item.id );
          item.childes.forEach( child => {
            let childItem = {
              id: child.id, name: child.name, path: child.path,
              root: child.root, leaf: child.leaf, children: [],
              disabled: child.status === EntityStatus.DELETE.status
            };

            parent.children.push( childItem );

            if ( !child.leaf && child.childes.length > 0 ) {
              relations.put( child.id, childItem );
              members.push( child );
            }
          } );
        }

        return this.buildMenu( members, relations );
      },
      async openAppendMenuModal( data, node, root, isRoot ) {
        if ( !( await this.hasRole( "admin", true ) ) ) {
          return;
        }

        let modal = this.creatorModal;

        modal.parentName = data.name;
        modal.parentId = data.id;
        modal.root = isRoot;
        modal.open = true;
      },
      async appendMenu() {
        if ( !( await this.hasRole( "admin", true ) ) ) {
          return;
        }

        let modal = this.creatorModal,
          isEmpty = /^$|^\s+$/;

        modal.open = false;

        if ( isEmpty.test( modal.name ) ) {
          this.$Message.warning( { content: "请输入菜单名" } );
          setTimeout( () => modal.open = true, 0 );
          return;
        }

        if ( /^false$/.test( modal.folder ) && isEmpty.test( modal.path ) ) {
          this.$Message.warning( { content: "请输入菜单路径" } );
          setTimeout( () => modal.open = true, 0 );
          return;
        }

        // 如果是在新节点下添加节点, parentId 是 undefined
        this.$refs[ "menuTree" ].appendMenu( {
          new: true,
          name: modal.name,
          path: modal.path,
          root: modal.root,
          parentId: modal.parentId,
          parentName: modal.parentName,

          // modal.folder 为 false 时即等于叶节点
          leaf: /^false$/.test( modal.folder )
        } );

        this.cancelAppendMenu();
      },
      cancelAppendMenu() {
        let modal = this.creatorModal;

        modal.name = "";
        modal.path = "";
        modal.root = false;
        modal.parentId = "";
        modal.folder = "false";
      },
      isModified( newData, oldData ) {
        let selected = this.selected;

        if ( newData.new ) {
          this.$Message.warning( { content: "请先保存新菜单" } );
          return true;
        }

        // 第一次点击菜单时直接通过
        if ( !oldData ) {
          return false;
        }

        let flag = selected.name !== selected.oldName
          || selected.path !== selected.oldPath
          || this.$refs[ "dataTransfer" ].hasChange();

        if ( flag ) {
          this.$Message.warning( { content: "菜单数据已更改, 请保存或恢复数据后再切换菜单" } );
        }

        return flag;
      },
      async selectMenu( data ) {
        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        try {
          let expect = status => ResponseStatus.expect( status, ResponseStatus.SUCCESS.code, ResponseStatus.EMPTY_RESULT.code ),
            responses = await Promise.all( [ roleClient.queryAvailableAssignRoles(), roleClient.queryRolesByMenuIdIs( data.id ) ] );

          if ( responses.filter( it => expect( it.data.code ) ).length === 2 ) {
            let selected = this.selected;

            selected.name = selected.oldName = data.name;
            selected.path = selected.oldPath = data.path;
            selected.leaf = selected.wasLeaf = data.leaf;
            selected.data = data;

            // 需要组件渲染后才能操作组件, 说白了就是必须异步
            setTimeout( () => {
              selected.used = responses[ 1 ].data.result.map( it => it.id );
              selected.all = responses[ 0 ].data.result.map( it => {
                return {
                  key: it.id,
                  label: it.name,
                  description: it.description
                };
              } );

              this.$refs[ "dataTransfer" ].clear();
            }, 0 );

          } else {
            responses.forEach( it => !expect( it.data.code )
              ? this.$Message.error( { content: `请求失败, ${it.data.message}` } ) : null );
          }

          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;

        } catch ( ignore ) {
        }

        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
        this.$Message.error( { content: "请求失败" } );
      },
      async saveMenuTreeWrapper() {
        if ( !( await this.hasRole( "admin", true ) ) ) {
          return;
        }

        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        try {
          await this.saveMenuTree();

        } catch ( ignore ) {
          this.$Message.error( { content: "操作失败" } );
        }

        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
      },
      async saveMenuTree() {
        let menuDeque = new ArrayDeque(),
          menuTree = this.$refs[ "menuTree" ];

        let removed = menuTree.getRemoved();
        if ( removed.length > 0 ) {
          try {
            let response = await menuClient.removeMenus( removed );
            if ( response.data.code !== ResponseStatus.SUCCESS.code ) {
              this.$Message.error( { content: `操作失败, ${response.message}` } );
              return
            }

          } catch ( exp ) {
            this.$Message.error( { content: "操作失败" } );
            console.log( exp );
            return;
          }
        }

        let recover = menuTree.getRecover();
        if ( recover.length > 0 ) {
          try {
            let response = await menuClient.recoverMenus( recover );
            if ( response.data.code !== ResponseStatus.SUCCESS.code ) {
              this.$Message.error( { content: `操作失败, ${response.message}` } );
              return;
            }

          } catch ( exp ) {
            this.$Message.error( { content: "操作失败" } );
            console.log( exp );
            return;
          }
        }

        menuTree.getNewBorn().forEach( it => menuDeque.offerFirst( it ) );

        let current, response,

          // 如果当前节点是新节点下的子节点, 那意味着没有 parentId,
          // 只能等到父节点加入后形成 name-parentId 才能加入
          nameMapping = new HashMap();

        while ( !menuDeque.isEmpty() ) {
          current = menuDeque.pollLast();

          if ( !current ) {
            return;
          }

          if ( !( "tryTime" in current ) ) {
            current.tryTime = 0;
          }

          // 先创建父节点, 然后再创建子节点, 循环至创建完毕
          if ( current.root ) {
            response = await menuClient.addRootMenu( current.name, current.path, current.leaf );

          } else if ( !CoreUtils.isNone( current.parentId ) ) {
            response = await menuClient.addMenu( current.name, current.path, current.parentId, current.leaf );

          } else if ( nameMapping.containsKey( current.parentName ) ) {
            response = await menuClient.addMenu( current.name, current.path, nameMapping.get( current.parentName ), current.leaf );

          } else if ( current.tryTime < 20 ) {
            current.tryTime += 1;
            menuDeque.offerFirst( current );
            continue;

          } else {
            this.$Message.warning( { "content": `${current.name} 菜单创建失败` } );
            continue;
          }

          if ( response.data.code === ResponseStatus.SUCCESS.code ) {
            nameMapping.put( current.name, response.data.result.id );
          }
        }

        // 即使有节点新增失败也要清空状态
        menuTree.clear();

        // 刷新菜单树
        response = await menuClient.getMenus();

        if ( response.data.code === ResponseStatus.SUCCESS.code ) {
          this.menus = this.buildMenu( response.data.result );
          this.$Message.success( { content: "菜单已刷新" } );

        } else {
          this.$Message.error( { content: "菜单刷新失败" } );
        }
      },
      async saveMenuItemWrapper() {
        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        try {
          await this.saveMenuItem();

        } catch ( ignore ) {
          this.$Message.error( { content: "操作失败" } );
        }

        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
      },
      async saveMenuItem() {
        let selected = this.selected,
          transfer = this.$refs[ "dataTransfer" ];

        if ( !( selected.name !== selected.oldName
          || selected.path !== selected.oldPath
          || transfer.hasChange() ) ) {

          this.$Message.warning( "菜单信息无改动." );
          return;
        }

        let requests = [],
          canGrant = await this.hasPermission( "grant" ),
          added = transfer.getAdded(), removed = transfer.getRemoved();

        if ( await this.hasRole( "admin" ) ) {
          requests.push( menuClient.updateMenu( selected.data.id, selected.name, selected.path ) );
        }

        if ( canGrant && added.length > 0 ) {
          requests.push( menuClient.addRolesToMenu( selected.data.id, added ) );
        }

        if ( canGrant && removed.length > 0 ) {
          requests.push( menuClient.removeRolesFromMenu( selected.data.id, removed ) );
        }

        if ( requests.length <= 0 ) {
          this.$Message.warning( { content: "操作失败, 缺少权限" } );
          return;
        }

        let responses = await Promise.all( requests );

        if ( responses.filter( it => it.data.code === ResponseStatus.SUCCESS.code ).length === requests.length ) {
          await this.selectMenu( selected.data );
          this.$Message.success( { content: "操作成功" } );

        } else {
          responses.forEach( it => it.data.code !== ResponseStatus.SUCCESS.code
            ? this.$Message.error( { "content": `操作失败, ${it.data.message}` } ) : null );
        }
      }
    }
  };
</script>