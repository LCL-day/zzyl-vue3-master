<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <div class="register-brand">
        <img src="/logo.png" class="register-brand__logo" alt="知味仓" />
        <h3 class="title">注册知味仓账号</h3>
      </div>

      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="登录账号（2-20 位字母、数字或下划线）"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>

      <el-form-item prop="nickName">
        <el-input
          v-model="registerForm.nickName"
          type="text"
          size="large"
          auto-complete="off"
          placeholder="昵称（展示在发布内容与评论上，可留空）"
        >
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="登录密码（5-20 位）"
          show-password
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="确认密码"
          show-password
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>

      <el-form-item style="width:100%;">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          style="width:100%;"
          @click.prevent="handleRegister"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
      </el-form-item>

      <div class="register-footer">
        <span>已有账号？</span>
        <el-link type="primary" :underline="false" @click="goLogin">返回登录</el-link>
      </div>
    </el-form>

    <div class="el-login-footer">
      <span>Copyright © 2026 知味仓 All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { register, getRegisterEnabled } from "@/api/food/app";

const router = useRouter();

const registerRef = ref();
const loading = ref(false);

const registerForm = reactive({
  username: "",
  nickName: "",
  password: "",
  confirmPassword: ""
});

const validateConfirm = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, message: "请输入登录账号", trigger: "blur" },
    { pattern: /^[A-Za-z0-9_]{2,20}$/, message: "账号只能是 2-20 位字母、数字或下划线", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入登录密码", trigger: "blur" },
    { min: 5, max: 20, message: "密码长度必须在 5 到 20 个字符之间", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    { validator: validateConfirm, trigger: "blur" }
  ]
};

function handleRegister() {
  registerRef.value.validate(valid => {
    if (!valid) {
      return;
    }
    loading.value = true;
    register({
      username: registerForm.username.trim(),
      nickName: registerForm.nickName.trim(),
      password: registerForm.password,
      confirmPassword: registerForm.confirmPassword
    }).then(() => {
      ElMessage.success("注册成功，请使用新账号登录");
      router.push({ path: "/login", query: { username: registerForm.username.trim() } });
    }).finally(() => {
      loading.value = false;
    });
  });
}

function goLogin() {
  router.push("/login");
}

onMounted(() => {
  // 未开放注册时直接回登录页
  getRegisterEnabled().then(res => {
    if (res.data !== true) {
      ElMessage.warning("当前系统未开放注册");
      router.replace("/login");
    }
  }).catch(() => {});
});
</script>

<style lang='scss' scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.register-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin: 0 0 22px 0;

  &__logo {
    width: 52px;
    height: 52px;
    border-radius: 13px;
    box-shadow: 0 4px 12px rgba(255, 122, 69, 0.28);
  }
}
.title {
  margin: 0;
  text-align: center;
  font-size: 20px;
  letter-spacing: 1px;
  color: #303133;
}
.register-form {
  border-radius: 6px;
  background: #ffffff;
  width: 420px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.register-footer {
  margin-bottom: 14px;
  text-align: center;
  font-size: 13px;
  color: #909399;
  .el-link {
    margin-left: 4px;
    vertical-align: baseline;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>
