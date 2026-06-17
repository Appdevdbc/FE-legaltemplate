export default [
  {
    path: "/",
    redirect: "/dashboard",
    component: () => import("./../layouts/MainLayout.vue"),
    children: [
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