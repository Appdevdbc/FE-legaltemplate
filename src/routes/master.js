export default [
  {
    path: "/",
    redirect: "/dashboard",
    component: () => import("./../layouts/MainLayout.vue"),
    children: [
      { path: "dashboard", component: () => import("./../pages/Index.vue") },
      {
        path: "user",
        component: () => import("./../pages/UserManagement.vue"),
      },
      {
        path: "menu",
        component: () => import("./../pages/MenuManagement.vue"),
      },
      {
        path: "role",
        component: () => import("./../pages/RoleManagement.vue"),
      },
      {
        path: "domain",
        component: () => import("./../pages/Master/Domain.vue"),
      },
      {
        path: "site",
        component: () => import("./../pages/Master/Site.vue"),
      },
      // {
      //   path: "role",
      //   component: () => import("./../pages/Master/Role.vue"),
      // },
      {
        path: "menu-detail/:id",
        component: () => import("./../pages/Master/MenuDetail.vue"),
      },
      
      {
        path: "collection",
        component: () => import("./../pages/Master/Collection.vue"),
      },
      {
        path: "collection-detail/:id/:parent/:parentName",
        component: () => import("./../pages/Master/CollectionDetail.vue"),
      },
      {
        path: "error-list",
        component: () => import("./../pages/Master/ErrorList.vue"),
      },
      // Document Management Routes
      {
        path: "document",
        component: () => import("./../pages/Document/DocumentPage.vue"),
      },
      {
        path: "document/add-file/:folderId",
        component: () => import("./../pages/Document/AddFile.vue"),
      },
      {
        path: "document/edit-file/:id",
        component: () => import("./../pages/Document/EditFile.vue"),
      },
      {
        path: "document/detail/:id",
        component: () => import("./../pages/Document/DetailFile.vue"),
      },
      {
        path: "document/permission-folder/:id",
        component: () => import("./../pages/Document/PermissionFolder.vue"),
      },
      {
        path: "document/permission-file/:id",
        component: () => import("./../pages/Document/PermissionFile.vue"),
      },
      {
        path: "document/search",
        component: () => import("./../pages/Document/Search.vue"),
      },
      {
        path: "rekaptemplate",
        component: () => import("./../pages/Document/RekapTemplate.vue"),
      },
      {
        path: "document/report-renewable",
        component: () => import("./../pages/Document/ReportRenewable.vue"),
      },
      {
        path: "logactivity",
        component: () => import("./../pages/Document/LogActivity.vue"),
      },
      {
        path: "document/target",
        component: () => import("./../pages/Document/TargetManagement.vue"),
      },
      {
        path: "document/restore",
        component: () => import("./../pages/Document/Restore.vue"),
      },
      // Collection routes
      {
        path: "collection/user",
        component: () => import("./../pages/Master/IndexUser.vue"),
      },
      {
        path: "collection/role",
        component: () => import("./../pages/Master/IndexRole.vue"),
      },
    ],
    beforeEnter: (to, from, next) => {
      if (!window.localStorage.getItem("token")) {
        next({
          path: "/login",
        });
      } else {
        next();
      }
    },
  },
]