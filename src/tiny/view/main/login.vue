<template>
  <Row type="flex" justify="center" align="middle" style="width: 100%; height: 100%;">
    <section id="particles-js" style="width: 100%; height: 100%; position: fixed; z-index: 10;"></section>
    <Row type="flex" justify="center" align="middle" v-if="passport.landing"
         style="width: 100%; height: 100%; position: fixed; z-index: 30; background-color: rgba(255, 255, 255, .5); flex-direction: column;">
      <Spin></Spin>
      <h2>登陆中...</h2>
    </Row>
    <Row style="width: 80%; max-width: 25rem; height: 21rem; z-index: 20;">
      <Row type="flex" justify="center" align="middle"
           style="text-align: center; width: 95%; height: 4rem; margin: .5rem auto .7rem auto;">
        <img src="@/tiny/resources/login_banner.jpg" style="width: 3rem; height: 3rem; border-radius: 100%;">
      </Row>
      <Row type="flex" justify="center" align="middle"
           style="width: 95%; height: 15rem; margin: .5rem auto .8rem auto; border: 1px solid #6d7380; border-radius: .5rem;">
        <Form ref="passport" :model="passport" :rules="passport.rules" :label-width="60" style="width: 90%;">
          <FormItem label="账户" prop="account">
            <Input v-model="passport.account" type="text" placeholder="请输入账户名..."/>
          </FormItem>
          <FormItem label="密码" prop="password">
            <Input v-model="passport.password" type="password" placeholder="请输入密码..." @on-enter="login"/>
          </FormItem>
          <FormItem label="验证码" prop="verifyCode" v-if="passport.requireVerify">
            <Input v-model="passport.verifyCode" type="text" placeholder="请输入验证码..." style="width: 58%; display: inline-block; vertical-align: top;"/>
            <img :src="passport.verifyImage" @click="nextValidCode" style="width: 40%; height: 2rem; display: inline-block; vertical-align: top; cursor: pointer"/>
          </FormItem>
          <FormItem :label-width="1" style="margin-bottom: 0;">
            <div style="width: 100%; display: flex; justify-content: space-around;">
              <Button type="primary" @click="login">登陆</Button>
              <Button type="ghost" @click="reset">重置</Button>
            </div>
          </FormItem>
        </Form>
      </Row>
    </Row>
  </Row>
</template>

<script>
  import "particles.js";
  import ParticleConfig from "@/tiny/configuration/particles.json";

  import { CoreUtils } from "jcdt";
  import { address } from "@/tiny/support/commons";
  import { authentication } from "@/tiny/web/basic";

  export default {
    data() {
      return {
        passport: {
          account: "",
          password: "",
          verifyCode: "",

          landing: false,
          loginCounter: 0,
          verifyImage: "",
          requireVerify: false,

          rules: {
            account: [ { required: true, message: "请填写账户" } ],
            password: [ { required: true, message: "请填写密码" } ],
            verifyCode: [ { required: false, message: "请填写验证码" } ]
          }
        }
      };
    },
    mounted() {
      // this.passport.requireVerify = true;
      this.$nextTick( () => particlesJS( "particles-js", ParticleConfig ) );
    },
    methods: {
      async login() {
        let passport = this.passport,
          successCallback = () => {
            passport.rules.verifyCode[ 0 ].required = false;
            passport.requireVerify = false;
            passport.loginCounter = 0;
            passport.landing = false;
          },

          failedCallback = () => {
            passport.landing = false;
            passport.loginCounter += 1;

            // max retry 3
            if ( passport.loginCounter >= 3 ) {
              if ( !passport.requireVerify ) {
                passport.requireVerify = true;
              }

              if ( !passport.account ) {
                this.$Message.warning( { content: "请填写账户" } );
                return;
              }

              passport.verifyImage = `${address}/verifies/get_valid_image/${passport.account}/${CoreUtils.uuid()}`;
              passport.rules.verifyCode[ 0 ].required = true;
            }
          };

        passport.landing = true;

        try {
          await authentication( passport.account, passport.password, passport.verifyCode, successCallback, failedCallback );

        } catch ( exp ) {
          passport.landing = false;
        }
      },
      reset() {
        this.$refs[ "passport" ].resetFields();
      },
      nextValidCode() {
        let passport = this.passport;
        passport.verifyImage = `${address}/verifies/get_valid_image/${passport.account}/${CoreUtils.uuid()}`;
      }
    }
  }
</script>
