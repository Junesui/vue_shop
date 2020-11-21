<template>
  <div class="login_container">
    <div class="login_box">
      <!-- アバター -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- ログインフォーム -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- ユーザー名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- パスワード -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- ボタン -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data() {
      return {
        /* ログインフォームデータ */
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        /*ファームの確認ルール*/
        loginFormRules: {
          /*ユーザー*/
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10个字符', trigger: 'blur' }
          ],
          /*パスワード*/
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15个字符', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      /*フォームデータをリセット*/
      resetLoginForm() {
        this.$refs.loginFormRef.resetFields()
      },
      /*ログイン*/
      login() {
        this.$refs.loginFormRef.validate(async valid => {
          if (!valid) return;
          const {data: res} = await this.$http.post('login', this.loginForm)
          if (res.meta.status !== 200) return this.$message.error('ログイン失敗')
          this.$message.success('ログイン成功')
          /* ログイン成功した後で、tokenが sessionStorage に置く*/
          window.sessionStorage.setItem('token',res.data.token)
          this.$router.push('/home')
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .login_form {
    position: absolute;
    bottom: 0px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left:50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }

  .btns {
    display: flex;
    justify-content: flex-end;
  }
</style>
