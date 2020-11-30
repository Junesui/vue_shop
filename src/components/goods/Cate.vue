<template>
  <div class="category">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table class="treeTable"
              :data="cateList"
              :columns="columns"
              border
              show-index
              index-text="#"
              :show-row-hover="false"
              :expand-type="false"
              :selection-type="false">
        <!-- 是否有效 -->
        <template v-slot:isok="slotProps">
          <i class="el-icon-success" style="color: lightgreen" v-if="slotProps.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="slotProps">
          <el-tag size="mini" v-if="slotProps.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="slotProps.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="slotProps">
           <el-button size="small" type="primary" icon="el-icon-edit">编辑</el-button>
           <el-button size="small" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[3, 5, 10]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="this.total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
                  class="parentCateItem"
                  v-model="cateValue"
                  :options="cateList"
                  :props="cateProps"
                  @change="parentCateChange"
                  clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    created() {
      this.getCateList()
    },
    name: "Cate",
    data() {
      return {
        /* 树形分类结构的列定义 */
        columns: [
          { label: '分类名称', prop: 'cat_name', width:'400px' },
          { label: '是否有效', type: 'template', template: 'isok'},
          { label: '排序', type: 'template', template: 'order'},
          { label: '操作', type: 'template', template: 'opt', width:'200px'}
        ],
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        cateList: [],
        total: 0,
        addCateDialogVisible: false,
        /* 请求来的分类列表 */
        cateList: [],
        /* 父级分类级联属性 */
        cateProps: {
          expandTrigger: 'click',
          checkStrictly: true,
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        /* 级联分类选择值 */
        cateValue: [],
        /* 添加分类表单 */
        addCateForm: {
          cat_name: '',
          //父分类id
          cat_pid: 0,
          //分类等级
          cat_level: 0
        },
        /* 添加分类表单验证规则 */
        addCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        }

      }
    },
    methods: {
      /* 获取分类列表 */
      async getCateList() {
        const {data: res} = await this.$http.get('categories', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('get cateList fail')
        }
        this.cateList = res.data.result
        this.total = res.data.total
      },
      handleSizeChange(newSize) {
       this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      /* 点击添加分类按钮事件 */
      async addCateDialog() {
        const {data: res} = await this.$http.get('categories',{ params: { type:2 }})
        if (res.meta.status !== 200) return this.$message.error('get categories list fail')
        this.cateList = res.data
        this.addCateDialogVisible = true
      },
      /* 选择父级分类改变事件 */
      parentCateChange() {
        if (this.cateValue.length > 0){
          this.addCateForm.cat_pid = this.cateValue[this.cateValue.length - 1]
          this.addCateForm.cat_level = this.cateValue.length
        }else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      /* 添加分类 */
      addCate() {
        this.$refs.addCateFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.post('categories', this.addCateForm)
          if(res.meta.status !== 201) {
            return this.$message.error('add category fail')
          }
          this.$message.success('添加分类成功')
          this.addCateDialogVisible = false
          this.getCateList()
        })
      },
      /* 关闭添加分类 */
      addCateClosed() {
        this.$refs.addCateFormRef.resetFields()
        this.cateValue = []
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }

    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }

  .parentCateItem {
    width: 100%;
  }
</style>
