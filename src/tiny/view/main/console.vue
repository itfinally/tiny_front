<style>
  .menu-icon {
    transition: all .3s;
  }

  .rotate-icon {
    transform: rotate(-90deg);
  }

  .tabs-bar > .ivu-tabs-bar {
    margin: .5rem 0;
  }
</style>

<template>
  <Layout style="width: 100%; height: 100%;">

    <!-- mask -->
    <Row type="flex" justify="center" align="middle" v-if="mask.open" style="width: 100%; height: 100%; position: fixed;
    z-index: 9999; background-color: rgba(255, 255, 255, .5); flex-direction: column;">
      <Spin></Spin>
      <h2>{{ mask.message }}</h2>
    </Row>

    <Sider ref="sidebar" :width="sidebar.width" collapsible hide-trigger :collapsed-width="0" style="overflow: scroll;">
      <Row v-if="menuMembers.length <= 0" style="text-align: center; color: white;">
        <h3 style="margin-top: 2rem;">请联系管理员开启权限</h3>
      </Row>
      <Menu theme="dark" width="auto" v-if="sidebar.isOpen && menuMembers.length > 0"
            :active-name="router.activeMenu" @on-select="activeMenu">
        <template v-for="item in menuMembers">
          <Submenu style="width: auto;" v-if="!item.leaf" :name="item.id">
            <template slot="title">
              <span>{{ item.name }}</span>
            </template>
            <template v-for="subItem in item.childes">
              <MenuItem v-if="subItem.leaf" :name="subItem.id">
                <span>{{ subItem.name }}</span>
              </MenuItem>
            </template>
          </Submenu>
          <MenuItem v-if="item.leaf" :name="item.id">
            <span>{{ subItem.name }}</span>
          </MenuItem>
        </template>
      </Menu>
    </Sider>

    <Layout ref="content">
      <Header style="padding: 0; background: #fff; box-shadow: 0 1px 1px rgba(0, 0, 0, .1);">
        <Icon @click.native="toggleSider" type="navicon-round" size="24"
              style="margin: 1.25rem 1.25rem 0; cursor: pointer;" :class="rotateIcon"></Icon>
      </Header>
      <Content style="margin: .5rem; background-color: #fff; position: relative;">
        <Tabs class="tabs-bar" type="card" @on-click="activeTab" @on-tab-remove="removeTab"
              v-if="router.tabs.length > 0" v-model="router.activeTab" closable>
          <TabPane v-for="tab in router.tabs" :key="tab.id" :name="tab.id" :label="tab.name"></TabPane>
        </Tabs>

        <router-view></router-view>
      </Content>
    </Layout>
  </Layout>
</template>

<script>
  import md5 from "blueimp-md5";
  import { ArrayList, HashMap, HashSet, IllegalStateException } from "jcdt";

  import { EntityStatus } from "@/tiny/support/status";
  import { menuClient } from "@/tiny/web/client";
  import {
    CLOSE_MASK,
    FRAME_SCROLL,
    GLOBAL_CACHE,
    GLOBAL_EVENT_EMITTER,
    MENU_INITIALIZE,
    MENU_ITEMS,
    OPEN_MASK,
    UPDATE_TAB
  } from "@/tiny/support/commons";

  export default {
    data() {
      return {
        sidebar: {
          width: /Mobile/.test( navigator.userAgent ) ? 128 : 200,
          isOpen: true
        },

        menuMembers: [],
        router: {
          paths: new HashMap(),           // menuId - menuPath
          menus: new HashMap(),           // menuPath - menu
          menuTabMapping: new HashMap(),  // menuId - tabId

          tabs: [],
          tabRecord: new HashSet(),

          activeTab: "",
          activeMenu: ""
        },

        mask: {
          open: false,
          message: ""
        }
      };
    },
    async mounted() {
      await this.installMask();       // 安装全局遮罩层, 执行耗时任务时可用于禁用用户操作
      await this.installMenu();       // 安装菜单
      await this.installTabs();       // 安装选项卡, 必须在菜单初始化之后
      await this.installScroller();   // 安装滚动方向提示
    },
    computed: {
      rotateIcon() {
        return [ "menu-icon", this.sidebar.isOpen ? "" : "rotate-icon" ];
      }
    },
    methods: {
      buildMenu( members, currentRoot = null, roots = new ArrayList(), tables = new HashMap() ) {
        if ( members.length <= 0 ) {
          return [ roots, tables ];
        }

        // currentRoot 是不可能为 null, 除非后台对菜单的处理流程有问题
        let item = members.shift();

        if ( item.root && item.status === EntityStatus.NORMAL.status ) {
          currentRoot = {
            id: item.id, name: item.name, path: item.path,
            root: item.root, leaf: item.leaf, childes: []
          };

          roots.add( currentRoot );
          tables.put( currentRoot.id, currentRoot );
        }

        if ( !item.leaf ) {
          item.childes.forEach( child => {
            if ( child.status !== EntityStatus.NORMAL.status ) {
              return;
            }

            let childItem = {
              id: child.id, name: child.name, path: child.path,
              root: child.root, leaf: child.leaf, childes: []
            };

            currentRoot.childes.push( childItem );
            tables.put( childItem.id, childItem );

            if ( !child.leaf && child.childes.length > 0 ) {
              members.unshift( child );
            }
          } );
        }

        return this.buildMenu( members, currentRoot, roots, tables );
      },
      async installMenu() {
        let paths = this.router.paths,
          menus = this.router.menus,

          response = await menuClient.getMenus(),
          [ roots, table ] = this.buildMenu( response.data.result );

        // 文件夹的 path 都是空串
        table.values().toArray().filter( menu => menu.path ).forEach( menu => {
          paths.put( menu.id, menu.path );
          menus.put( menu.path, menu );
        } );

        this.menuMembers = roots.toArray();
        GLOBAL_CACHE.put( MENU_ITEMS, table );
        GLOBAL_EVENT_EMITTER.emit( MENU_INITIALIZE, table );
      },
      installScroller() {
        this.$refs[ "content" ].$el.addEventListener( "scroll", ( () => {
          let lastTop = 0, currentDirect = "";

          return function () {
            if ( this.scrollTop > lastTop && currentDirect !== "down" ) {
              currentDirect = "down";
              GLOBAL_EVENT_EMITTER.emit( FRAME_SCROLL, currentDirect );
            }

            if ( this.scrollTop < lastTop && currentDirect !== "up" ) {
              currentDirect = "up";
              GLOBAL_EVENT_EMITTER.emit( FRAME_SCROLL, currentDirect );
            }

            lastTop = this.scrollTop;
          };
        } )() );
      },
      installMask() {
        GLOBAL_EVENT_EMITTER.on( CLOSE_MASK, () => this.mask.open = false );
        GLOBAL_EVENT_EMITTER.on( OPEN_MASK, ( message = "请稍后..." ) => {
          let mask = this.mask;
          mask.message = message;
          mask.open = true;
        } );
      },
      installTabs() {
        let tabInitializing = ( path, menuItem ) => {
          let router = this.router;

          if ( router.tabRecord.contains( path ) ) {
            return router.tabs.some( tab => {
              if ( tab.path !== path ) {
                return false;
              }

              router.activeMenu = tab.menuId;
              router.activeTab = tab.id;
              return true;
            } );
          }

          let tab = {
            id: md5( `${menuItem.id}_${path}` ),
            menuId: menuItem.id,
            name: menuItem.name,
            path
          };

          router.activeTab = tab.id;
          router.activeMenu = tab.menuId;

          router.tabs.push( tab );
          router.tabRecord.add( path );
          router.menuTabMapping.put( menuItem.id, path );
        };

        GLOBAL_EVENT_EMITTER.on( UPDATE_TAB, ( oldPath, newPath, routerPath ) => {
          let router = this.router,
            menuItem = router.menus.get( routerPath );

          if ( !menuItem ) {
            throw new IllegalStateException( `No Match menu for path ${routerPath}` )
          }

          if ( "" === oldPath ) {
            tabInitializing( newPath, menuItem );
            return;
          }

          let oldTabId = md5( `${menuItem.id}_${oldPath}` ),
            newTabId = md5( `${menuItem.id}_${newPath}` );

          router.tabs.some( item => {
            if ( item.path !== oldPath ) {
              return false;
            }

            router.menuTabMapping.put( menuItem.id, newPath );
            item.path = newPath;
            item.id = newTabId;

            let tabRecord = router.tabRecord;
            tabRecord.remove( oldPath );
            tabRecord.add( newPath );

            if ( router.activeTab === oldTabId ) {
              router.activeTab = newTabId;
            }

            return true;
          } );
        } );
      },
      toggleSider() {
        this.$refs[ "sidebar" ].toggleCollapse();

        let sidebar = this.sidebar;
        sidebar.isOpen ? sidebar.isOpen = false : setTimeout( () => sidebar.isOpen = true, 250 );
      },
      activeMenu( menuId ) {
        let router = this.router,
          menuTabMapping = router.menuTabMapping;

        if ( menuTabMapping.containsKey( menuId ) ) {
          this.$router.push( { path: menuTabMapping.get( menuId ) } );

        } else {
          let paths = router.paths;
          if ( !paths.containsKey( menuId ) ) {
            return;
          }

          this.$router.push( { path: paths.get( menuId ).split( "/:" )[ 0 ] } );
        }
      },
      activeTab( tabId ) {
        let router = this.router;
        router.tabs.some( tab => {
          if ( tab.id !== tabId ) {
            return false;
          }

          this.$router.push( { path: tab.path } );
          return true;
        } );
      },
      removeTab( tabId ) {
        let router = this.router;
        router.tabs.some( ( tab, index, tabs ) => {
          if ( tab.id !== tabId ) {
            return false;
          }

          router.menuTabMapping.remove( tab.menuId );
          router.tabRecord.remove( tab.path );
          tabs.splice( index, 1 );

          if ( tabs.length <= 0 ) {
            router.activeMenu = router.activeTab = "";
            this.$router.replace( "/console" );

          } else if ( router.activeTab === tab.id ) {
            let newIndex = index - 1;
            this.$router.replace( router.menuTabMapping.get( tabs[ newIndex < 0 ? 0 : newIndex ].menuId ) );
          }

          return true;
        } );
      }
    }
  }
</script>