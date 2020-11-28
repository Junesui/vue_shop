<template>
  <div class="users">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加 -->
      <el-row :gutter="20">
        <!-- 搜索 -->
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="paramsInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot:default="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChanged(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template v-slot:default="slotProps">
            <!-- 编辑按钮 -->
            <el-button @click="editUser(slotProps.row.id)" type="primary" size="mini" icon="el-icon-edit"></el-button>
            <!-- 删除按钮 -->
            <el-button @click="removeUser(slotProps.row.id)" type="danger" size="mini" icon="el-icon-delete"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" size="mini" icon="el-icon-setting" @click="setRole(slotProps.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="paramsInfo.pagenum"
              :page-sizes="[1,2,5,10]"
              :page-size="paramsInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>

    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addUserFormClosed"  >
      <!-- 内容主体区域 -->
      <el-form :model="user" :rules="userRules" ref="userRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="user.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="user.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog @close="editFromClosed" title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editUserForm" :rules="userRules" ref="editUserFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="eitUserInfo">确 定</el-button>
  </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"
            @close="setRoleDialogClosed">
      <div>
        <p>当前用户名称: {{userInfo.username}}</p>
        <p>当前用户角色: {{userInfo.role_name}}</p>
        <p>分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
                    v-for="item in roleList"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    created(){
      this.getUserList()
    },
    name: "Users",
    data() {
      /* 自定义验证邮箱的规则 */
      const checkEmail = (rule, value, callback) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)){
          return callback()
        }
        return callback(new Error('请输入正确的邮箱'))
      }

      /* 自定义验证手机的规则 */
      const checkMobile = (rule, value, callback) => {
        const regMobile = /^1[3|4|5|7|8][0-9]{9}$/
        if (regMobile.test(value)){
          return callback()
        }
        return callback(new Error('请输入正确的手机号'))

      }

     return {
       /* 请求用户列表的参数对象 */
       paramsInfo: {
         query: '',
         pagenum: 1,
         pagesize: 2
       },
       /* 添加用户对象 */
       user: {
         username: '',
         password: '',
         email: '',
         mobile: ''
       },
       /* 添加用户的规则 */
       userRules: {
         username: [
           {required: true, message: '请输入用户名称', trigger: 'blur' },
           { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
         ],
         password: [
           {required: true, message: '请输入用户密码', trigger: 'blur' }
         ],
         email: [
           {required: true, message: '请输入用户邮箱', trigger: 'blur' },
           { validator: checkEmail, trigger: 'blur' }
         ],
         mobile: [
           {required: true, message: '请输入用户手机', trigger: 'blur' },
           { validator: checkMobile, trigger: 'blur' }
         ]
       },
       userList: [],
       total: 0,
       addDialogVisible: false,
       editDialogVisible: false,
       editUserForm: {},
       setRoleDialogVisible: false,
       userInfo: {},
       roleList: [],
       selectedRoleId: ''
     }
    },
    methods: {
      async getUserList() {
       const {data:res} = await this.$http.get('users', {params : this.paramsInfo})
        if (res.meta.status !== 200) {
         return this.$message.error('获取用户列表失败')
        }
        this.userList = res.data.users
        this.total = res.data.total
      },
      /* 监听每页显示数量改变的事件 */
      handleSizeChange(newSize) {
        this.paramsInfo.pagesize = newSize
        this.getUserList()
      },
      /* 监听当前页码改变的事件 */
      handleCurrentChange(newPage) {
        this.paramsInfo.pagenum = newPage
        this.getUserList()
      },
      /* 修改用户状态 */
      async userStateChanged(userInfo) {
        const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          this.$message.error('修改用户状态失败')
        }
        this.$message.success('修改用户状态成功')

      },
      /* 监听添加用户对话框关闭事件 */
      addUserFormClosed() {
        this.$refs.userRef.resetFields()
      },
      /* 添加用户 */
      addUser() {
        this.$refs.userRef.validate(async valid => {
          //校验失败
          if(!valid) return
          //校验成功，发送添加用户的请求
          const {data:res} = await this.$http.post('users',this.user)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          this.addDialogVisible = false
          this.getUserList()
        })
      },
      /* 修改用户 */
      async editUser(id) {
        this.editDialogVisible = true
        const {data:res} = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          this.$message.error('获取用户信息失败')
        }
        this.editUserForm = res.data
      },
      /* 监听修改用户对话框关闭事件 */
      editFromClosed() {
        this.$refs.editUserFormRef.resetFields()
      },
      /* 修改用户信息后的提交 */
      eitUserInfo() {
        this.$refs.editUserFormRef.validate(async valid => {
          if(!valid) return
          const {data:res} = await this.$http.put('users/' + this.editUserForm.id, {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile
          })
          if (res.meta.status !== 200) this.$message.error('更新用户信息失败')
          this.editDialogVisible = false
          this.getUserList()
          this.$message.success('更新用户信息成功')
        })
      },
      /* 删除用户 */
      async removeUser(id) {
       const result = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (result === 'cancel') {
         return this.$message.info('取消删除用户操作')
        }
        const {data: res} = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
         return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getUserList()
      },
      /* 分配角色 */
      async setRole(userInfo) {
        this.userInfo = userInfo
        const {data: res} = await this.$http.get('roles')
        if(res.meta.status !== 200) {
          return this.$message.error('get roles fail')
        }
        this.roleList = res.data
        this.setRoleDialogVisible = true
      },
      /* 保存新分配的用户角色 */
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色')
        }
        const {data: res} = await this.$http.put('users/${this.userInfo.id}/role',
            {rid : this.selectedRoleId})
        if (res.meta.status !== 200) {
          console.log(res);
          return this.$message.error('分配角色失败')
        }
        this.$message.success('分配用户角色成功')
        this.getUserList()
        this.setRoleDialogVisible = false
      },
      /* 监听分配角色对话框关闭事件 */
      setRoleDialogClosed() {
        this.selectedRoleId = ''
      }

    }

  }
</script>

<style lang="less" scoped>

</style>
