import { createRouter, createWebHashHistory } from "vue-router";
import { role } from "./../utils";

import master from './master';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        ...master,
        {
            path: "/login",
            component: () => import("./../layouts/MainLogin.vue"),
        },
        {
            path: "/login_portal",
            component: () => import("./layouts/MainLoginPortal.vue"),
            },
        {
            path: "/login_admin_dbc2026",
            component: () => import("./layouts/MainLoginDev.vue"),
        },
        {
            path: "/404",
            component: () => import("./../pages/Error404.vue"),
        },
        // Always leave this as last one,
        // but you can also remove it
        {
            path: "/:catchAll(.*)*",
            component: () => import("./../pages/Error404.vue"),
        },
    ],
});


router.beforeEach(async (to, from, next) => {
    window.scrollTo(0, 0);

    if (to.meta.title) {
        document.title = to.meta.title;
    }
    if (to.meta.description) {
        cription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            aDescription.setAttribute('content', to.meta.description);
        }
    }

    next();
});

export default router;
