import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import { checkToken } from "@/api/user";
import Cookies from 'js-cookie'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/noAuth'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
    // start progress bar
    NProgress.start()

    // set page title
    document.title = getPageTitle(to.meta.title)

    // Cookies.set("vue_vertica_paas_token", 'admin-token')

    // determine whether the user has logged in
    const hasToken = getToken()

    if (hasToken) {
        if (to.path === '/index') {
            // if is logged in, redirect to the home page
            next({ path: '/' })
            NProgress.done()
        } else if (to.path === '/noAuth') {
            next()
        } else {
            const hasGetUserInfo = store.getters.name
            if (hasGetUserInfo) {
                next()
            } else {
                try {
                    let token = to.query.jwtKey || hasToken;
                    if (token) {
                        checkToken(token).then(response => {
                            if (response.code == 20000) {
                                if (response.data != null) {
                                    Cookies.set("vue_vertica_paas_token", response.data.token)
                                    next()
                                } else {
                                    next(`/noAuth`)
                                }
                            }
                        });
                    } else {
                        next(`/noAuth`)
                    }
                    // get user info
                    // await store.dispatch('user/getInfo')
                    // next()
                } catch (error) {
                    // remove token and go to login page to re-login
                    // await store.dispatch('user/resetToken')
                    // Message.error(error || 'Has Error')
                    next(`/noAuth`)
                    NProgress.done()
                }
            }
        }
    } else {
        /* has no token*/
        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.

            let token = to.query.jwtKey || hasToken;
            if (token) {
                checkToken(token).then(response => {
                    if (response.code == 20000) {
                        if (response.data != null) {
                            Cookies.set("vue_vertica_paas_token", response.data.token)
                            next()
                        } else {
                            next(`/noAuth`)
                        }
                    }
                });
            } else {
                next(`/noAuth`)
            }
            // next(`/login?redirect=${to.path}`)
            NProgress.done()
        }
    }
})

router.afterEach(() => {
    // finish progress bar
    NProgress.done()
})