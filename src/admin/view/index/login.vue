<style>
    .login-form {
        padding: 1rem;
        border-radius: .5rem;
        border: 1px solid #6d7380;

        position: absolute;
    }

    .login-banner {
        position: absolute;
        text-align: center;
        top: -5rem;
    }

    .forget-password-btn {
        padding-top: .3rem;
        font-size: .2rem;

        cursor: pointer;
    }

    #particles-js > canvas {
        position: absolute;
        z-index: -1;
    }
</style>

<template>
    <Row id="particles-js" type="flex" justify="center" align="middle" style="justify-content: center;">
        <Col class="login-form" span="6">
        <Row class="login-banner" style="width: 90%">
            <img src="../../resources/login_banner.jpg"
                 style="width: 3rem; height: 3rem; border-radius: 100%;">
        </Row>
        <Form ref="loginForm" :model="loginForm" :rules="loginRule">
            <Form-item prop="account">
                <Input type="text" v-model="loginForm.account" placeholder="账户">
                <Icon type="person" slot="prepend" size="20"></Icon>
                </Input>
            </Form-item>
            <Form-item prop="password">
                <Input type="password" v-model="loginForm.password" placeholder="密码">
                <Icon type="locked" slot="prepend" size="20"></Icon>
                </Input>
            </Form-item>
            <Form-item prop="validCode" v-show="loginForm.requireValid">
                <Col span="12">
                <Input type="text" v-model="loginForm.validCode" placeholder="验证码"/>
                </Col>
                <Col span="11" offset="1">
                <img :src="loginForm.validImage" @click="getImage"
                     style="width: 100%; height: 2rem;">
                </Col>
            </Form-item>
            <Row type="flex" justify="end">
                <Button type="success" @click="login" long>登陆</Button>
                <div class="forget-password-btn" @click="forget">忘记密码</div>
            </Row>
        </Form>
        </Col>
    </Row>
</template>

<script>
    import Vue from "vue";

    import ParticleConfig from "@admin/config/particles.json";
    import "particles.js";

    import { CoreUtils, StringUtils } from "@core/index";
    import { authentication } from "@admin/rest/client";
    import { REQUEST_ADDRESS } from "@admin/tools/constant";

    export default {
        data() {
            return {
                loginForm: {
                    account: "",
                    password: "",
                    validCode: "",

                    tryTime: 0,
                    validImage: "",
                    requireValid: false
                },
                loginRule: {
                    account: [ { required: true, message: "请填写账户" } ],
                    password: [ { required: true, message: "请填写密码" } ],
                    validCode: [ { required: false, message: "请填写验证码" } ]
                }
            }
        },
        methods: {
            login() {
                let user = this.loginForm;

                authentication( user.account, user.password, user.validCode, () => {
                    user.tryTime = 0;
                    user.requireValid = false;

                }, () => {
                    user.tryTime += 1;

                    if ( user.tryTime >= 3 && !user.requireValid ) {
                        this.getImage();
                        user.requireValid = true;
                    }
                } );
            },
            getImage() {
                let loginForm = this.loginForm;

                if ( !loginForm.account ) {
                    this.$Message.warning( { "content": "请填写账户" } );
                    return;
                }

                loginForm.validImage = StringUtils.format( `${REQUEST_ADDRESS}/get_valid_image/\${account}/\${random}`, {
                    "account": loginForm.account,
                    "random": CoreUtils.uuid()
                } );
            },
            forget() {

            }
        },
        mounted() {
            this.$nextTick( () => particlesJS( "particles-js", ParticleConfig ) );
        }
    }
</script>