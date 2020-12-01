<template>
  <div class="roles">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot:default="slotProps">
            <el-row :class="['bdbottom',i1 == 0 ? 'bdtop' : '','vcenter']" v-for="(item1,i1) in slotProps.row.children" :key="item1.id">
              <!-- 一级权限区域 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限区域 -->
              <el-col :span=19>
                <el-row :class="[i2 == 0 ? '': 'bdtop','vcenter']" v-for="(item2,i2) in item1.children">
                  <!--二级权限区域 -->
                  <el-col :span="6">
                    <el-tag type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--三级权限区域 -->
                  <el-col :span="18">
                    <el-tag closable @close="removeRightById(slotProps.row,item3)" type="warning" v-for="(item3,i3) in item2.children">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template v-slot:default="slotProps">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightsDialog(slotProps.row)">分配权限</el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>

    <!-- 树形权限列表 -->
    <el-dialog
            title="分配权限列表"
            :visible.sync="showSetRightsDialogVisible"
            width="50%"
            @close="setRightsDialogClosed" >
      <!-- 树形区域 -->
      <el-tree
              :data="rightsList"
              show-checkbox
              node-key="id"
              default-expand-all
              :props="rightsProps"
              :default-checked-keys="defKeys"
              ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="showSetRightsDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    created() {
      this.getRolesList()
    },
    name: "Roles",
    data() {
      return {
        rolesList: [],
        showSetRightsDialogVisible: false,
        rightsList: [],
        rightsProps: {
          children: 'children',
          label: 'authName'
        },
        defKeys: [],
        roleId: null
      }
    },
    methods: {
      async getRolesList() {
        const {data:res} = await this.$http.get('roles')
        if (res.meta.status !== 200) return this.$message.error('get roles error')
        this.rolesList = res.data
      },
      /* 通过id删除权限 */
      async removeRightById(role,right) {
        const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => error)

        if (result !== 'confirm') {
          return this.$message.info('取消了删除操作！')
        }

        const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${right.id}`)
        if (res.meta.status !== 200){
          console.log(res);
          return this.$message.error('删除权限失败')
        }
        this.$message.success('删除权限成功')
        role.children = res.data
      },
      /* 显示权限列表树 */
      async showSetRightsDialog(role) {
        //保存角色id
        this.roleId = role.id
        //获取权限列表
        const {data: res} = await this.$http.get('rights/tree')
        if (res.meta.status !== 200) {
          return this.$message.error('get rights list fail')
        }
        this.rightsList = res.data
        this.getLeafKeys(role, this.defKeys)
        this.showSetRightsDialogVisible = true
      },

      /* 递归获取角色下的三级权限id并保存 */
      getLeafKeys(node, arr) {
         //如果是三级权限
         if (!node.children) {
            arr.push(node.id)
         }

         //如果是一二级权限
        if(node.children) {
          node.children.forEach(item => this.getLeafKeys(item, arr))
        }
      },

      /* 关闭分配权限对话框时清空数组 */
      setRightsDialogClosed() {
        this.defKeys = []
      },

      /* 点击分配权限 */
      async allotRights() {
        const ids = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idsStr = ids.join(',')

        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idsStr})
        if (res.meta.status !== 200) {
          this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.showSetRightsDialogVisible=false
        this.getRolesList()
      }
    }
  }
</script>

<style lang="less" scoped>

  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
