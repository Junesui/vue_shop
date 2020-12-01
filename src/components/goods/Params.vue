<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert show-icon title="注意:只能选择第三级分类" type="warning" :closable="false"></el-alert>
      <el-row class="cate-opt">
        <el-col>
          <span>选择商品分类: </span>
          <!--分类级联框区域-->
          <el-cascader
                  v-model="selectedCateKeys"
                  :options="cateList"
                  :props="cateProps"
                  @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab -->
      <el-tabs v-model="activeName" @tab-click="handleTagClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible=true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot:default="slotProps">
                <el-tag closable v-for="(item,index) in slotProps.row.attr_vals"
                        :key="item"
                        @close="handleClose(index,slotProps.row)">{{item}}</el-tag>
                <!--　标签输入框　-->
                <el-input
                        class="input-new-tag"
                        v-if="slotProps.row.inputVisible"
                        v-model="slotProps.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(slotProps.row)"
                        @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <!-- 标签添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="slotProps">
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini"type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible=true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot:default="slotProps">
                <el-tag closable v-for="(item,index) in slotProps.row.attr_vals"
                        :key="item"
                        @close="handleClose(index,slotProps.row)">{{item}}</el-tag>
                <!--　标签输入框　-->
                <el-input
                        class="input-new-tag"
                        v-if="slotProps.row.inputVisible"
                        v-model="slotProps.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(slotProps.row)"
                        @blur="handleInputConfirm(slotProps.row)"
                >
                </el-input>
                <!-- 标签添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot:default="slotProps">
                <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                <el-button size="mini"type="danger" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加动态参数/静态属性对话框 -->
    <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules"
               ref="addFormRef" label-width="100px">
        <el-form-item label="活动名称" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import ElTag from "../../../node_modules/element-ui/packages/tag/src/tag.vue";

  export default {
    components: {ElTag},
    created() {
      this.getCateList()
    },
    name: "Params",
    data() {
      return {
        cateList: [],
        cateProps: {
          expandTrigger: 'click',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        selectedCateKeys: [],
        activeName: 'many',
        manyTableData: [],
        onlyTableData: [],
        addDialogVisible: false,
        addForm: {
          attr_name: ''
        },
        addFormRules: {
        attr_name: [
          {required: true, message: '请输入属性名称', trigger: 'blur' }
        ]
        }
      }
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error('get cateList fail')
        }
        this.cateList = res.data
      },
      async handleChange() {
        this.getParamData()
      },
      handleTagClick() {
        this.getParamData()
      },
      async getParamData() {
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,{ params: { sel:this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error('get category params fail')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          item.inputVisible = false
          item.inputValue = ''
        })
        console.log(res.data);
        if (this.activeName === 'many'){
          this.manyTableData = res.data
        }else {
          this.onlyTableData = res.data
        }
      },
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('add params fail')
          }
          this.$message.success('添加参数成功')
          this.addDialogVisible = false
          this.getParamData()
        })
      },
      async handleInputConfirm(row) {
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        row.attr_vals.push(row.inputValue.trim())
        this.saveArr(row)
        row.inputValue = ''
        row.inputVisible = false
      },
      showInput(row) {
        row.inputVisible = true
        //$nextTick作用:页面元素重新渲染之后再调用回调函数
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleClose(index, row) {
        row.attr_vals.splice(index, 1)
        this.saveArr(row)
      },
      async saveArr(row) {
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
        if (res.meta.status !== 200) {
          return this.$message.error('操作 fail')
        }
        this.$message.success('操作成功')
      }
    },
    computed: {
      isBtnDisable() {
        if (this.selectedCateKeys.length !== 3){
          return true
        }
        return false
      },
      cateId() {
        if (this.selectedCateKeys.length === 3) {
          return this.selectedCateKeys[2]
        }
        return null
      },
      titleText() {
        if(this.activeName === 'many') {
          return '动态参数'
        } else {
          return '静态属性'
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .cate-opt {
    margin: 15px 0;
  }
  .el-tag {
    margin: 3px 5px;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
