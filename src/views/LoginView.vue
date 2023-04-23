<template>
  <div class="login-page">
    <div :class="isToLogin ? 'to_login' : ''">
      <div class="aside">
        <div class="aside-inner">
          <h2>自由的分享工具</h2>
          <span class="text-white-70">斜光, Google</span>
          <a-button
            class="to_login_button"
            type="primary"
            size="large"
            @click="handleToLogin"
          >
            立即体验
          </a-button>
        </div>
      </div>
      <div class="login-area">
        <a-form layout="vertical" :model="form" :rules="rules" ref="loginForm">
          <h2>欢迎回来</h2>
          <p class="subTitle">使用手机号码和验证码登录到分享乐</p>
          <a-form-item label="手机号码" required name="cellphone">
            <a-input placeholder="手机号码" v-model:value="form.cellphone">
              <template v-slot:prefix
                ><UserOutlined style="color: rgba(0, 0, 0, 0.25)"
              /></template>
            </a-input>
          </a-form-item>
          <a-form-item label="验证码" required name="verifyCode">
            <a-input placeholder="四位验证码" v-model:value="form.verifyCode">
              <template v-slot:prefix
                ><LockOutlined style="color: rgba(0, 0, 0, 0.25)"
              /></template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" size="large" @click="login">
              登录
            </a-button>
            <a-button
              size="large"
              :style="{ marginLeft: '20px' }"
              :disabled="codeButtonDisable"
              @click="getCode"
            >
              {{ counter === 60 ? '获取验证码' : `${counter}秒后重发` }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, Ref, computed, watch } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useForm } from 'ant-design-vue/lib/form'
import { Rule } from 'ant-design-vue/es/form/interface'
import axios from 'axios'
import { message } from 'ant-design-vue'

interface RuleFormInstance {
  validate: () => Promise<any>
}
export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
  },
  setup() {
    const form = reactive({
      cellphone: '',
      verifyCode: '',
    })
    const loginForm = ref() as Ref<RuleFormInstance>
    const cellNumberValidator = (rule: Rule, value: string) => {
      return new Promise((resolve, reject) => {
        const passed = /^1[3-9]\d{9}$/.test(value.trim())
        setTimeout(() => {
          if (passed) {
            resolve('')
          } else {
            reject('手机号码格式不正确')
          }
        }, 300)
      })
    }
    const rules = reactive({
      cellphone: [
        { required: true, message: '手机号码不能为空', trigger: 'blur' },
        // { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确', trigger: 'blur' }
        { asyncValidator: cellNumberValidator, trigger: 'blur' },
      ],
      verifyCode: [
        { required: true, message: '验证码不能为空', trigger: 'blur' },
      ],
    })
    const { validate, resetFields } = useForm(form, rules)
    const login = () => {
      validate().then(() => {
        alert('passed')
        resetFields()
      })
    }

    const isToLogin = ref(false)
    const handleToLogin = () => {
      isToLogin.value = true
    }

    const counter = ref(60)
    let timer = 0
    const codeButtonDisable = computed(() => {
      return !/^1[3-9]\d{9}$/.test(form.cellphone.trim()) || counter.value < 60
    })
    const startCounter = () => {
      counter.value--
      timer = setInterval(() => {
        counter.value--
      }, 1000)
    }
    watch(counter, (newValue) => {
      if (newValue === 0) {
        clearInterval(timer)
        counter.value = 60
      }
    })
    const getCode = () => {
      axios
        .post('/users/genVeriCode', { phoneNumber: form.cellphone })
        .then(() => {
          message.success('验证码已发送，请注意查收', 5)
          startCounter()
        })
    }
    return {
      form,
      rules,
      isToLogin,
      handleToLogin,
      loginForm,
      login,
      codeButtonDisable,
      getCode,
      counter,
    }
  },
})
</script>
<style lang="scss">
$cubicBezier: 0, 1.06, 0.58, 0.98;
.logo-area {
  position: absolute;
  top: 30px;
  width: 150px;
}
.aside {
  height: 100vh;
  width: 100vw;
  background-color: #1a1919;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  display: flex !important;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all cubic-bezier($cubicBezier) 0.8s;
}
.aside .logo-img {
  width: 200px;
  margin-bottom: 20px;
}
.aside h2 {
  color: #cccccc;
  font-size: 29px;
}
.aside-inner {
  text-align: center;
}
.to_login_button {
  opacity: 1;
  transition: all cubic-bezier($cubicBezier) 0.8s;
}
.to_login {
  .aside {
    width: 38.2vw;
  }
  .login-area {
    width: 61.8vw;
  }
  .to_login_button {
    opacity: 0;
  }
}
.login-area {
  height: 100vh;
  position: absolute;
  top: 0;
  right: 0;
  transition: all cubic-bezier($cubicBezier) 0.8s;
  .ant-form {
    width: 350px;
  }
}
.text-white-70 {
  color: #999;
  display: block;
  font-size: 19px;
}

.login-area {
  z-index: 0;
  width: 100vw;
  display: flex !important;
  align-items: center;
  justify-content: center;
  h2 {
    color: #333333;
    font-size: 29px;
  }
  .subTitle {
    color: #666666;
    font-size: 19px;
  }
  .ant-form-item-label {
    display: none;
  }
  .ant-input-prefix {
    left: auto;
    right: 30px;
    font-size: 19px;
  }
  .ant-input {
    font-size: 17px;
    padding: 20px 45px 20px 30px;
  }
}
</style>
