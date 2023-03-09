<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="schemaname"
        class="filter-item el-input el-input--medium"
        style="width: 300px;"
        placeholder="请输入schema名称"
        @keyup.enter.native="getSchemaList"
      />
      <el-button
        class="el-button--medium search-btn"
        type="primary"
        @click="getSchemaList"
      >
        <i class="el-icon-search" />
        <span>搜索</span>
      </el-button>
      <el-button
        class="el-button--medium"
        type="primary"
        @click="refreshSchemaList"
      >
        <i class="el-icon-refresh" />
        <span>刷新</span>
      </el-button>
      <div style="float: right;">
        <el-button
          class="el-button--medium"
          type="primary"
          @click="openSchemaDialog"
        >
          <i class="el-icon-plus" />
          <span>创建schema</span>
        </el-button>
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      style="margin-top:10px"
      :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}"
      :data="schemaList"
      element-loading-text="Loading"
      :row-class-name="tableRowClassName"
    >
      <el-table-column
        align="center"
        label="ID"
        width="300"
        style="background-color:#000000;"
      >
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column
        label="schema名称"
        width="200"
      >
        <template slot-scope="scope">{{ scope.row.schemaname }}</template>
      </el-table-column>
      <el-table-column
        label="实例ID"
        align="left"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.instanceId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="资源池名称"
        align="left"
      >
        <template slot-scope="scope">{{ scope.row.resourcepool }}</template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="created_at"
        label="操作"
        width="100"
      >        
        <template slot-scope="scope">
          <el-button
            class="el-button--small"
            type="danger"
            @click="deleteSchema(scope.row.id, scope.row.schemaname)"
          >
            <i class="el-icon-delete" />
            <span>删除</span>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div
      v-if="schemaFormState"
      class="wmassageMask"
      @click="closeCompanyMask"
    >
      <el-dialog
        id="schemaInfoDialog"
        v-dialogDrag
        class="editboxd"
        :modal="false"
        width="30%"
        :lock-scroll="false"
        :close-on-click-modal="false"
        :visible.sync="companeMessageShow"
        @close="schemaFormState=false"
      >
        <div
          slot="title"
          class="headers"
        >
          <u style="text-decoration: none;">
            <b style="color:#3a8ee6;">创建schema</b>
          </u>
        </div>
        <el-form
          ref="schemaForm"
          :model="schemaForm"
          label-width="120px"
          :rules="schemaRules"
          label-position="right"
        >
          <el-form-item
            label="schema名称"
            prop="schemaname"
          >
            <el-input
              ref="schemaname"
              v-model="schemaForm.schemaname"
              placeholder="请填写schema名称"
            />
          </el-form-item>
          <el-form-item
            label="资源池名称"
            prop="resourcepool"
          >
            <el-select
              ref="resourcepool"
              v-model="schemaForm.resourcepool"
              placeholder="请选择资源池"
              style="width: 100%;"
            >
              <el-option
                v-for="(item,n) in poolArry"
                :key="n"
                :label="item.resourcepool + '（' + item.instanceId + '）'"
                :value="item.instanceId + '&&&' + item.resourcepool"
              />
            </el-select>
          </el-form-item>
          <div style="text-align: center;">
            <el-button
              type="primary"
              @click="createSchema"
            >创建</el-button>
            <el-button @click="schemaFormState=false">取消</el-button>
          </div>
        </el-form>
      </el-dialog>
    </div>
    <div
      v-show="loading"
      class="loadingWmassageMask"
    >
      <div
        v-show="loading"
        class="el-loading-mask"
        style=""
      >
        <div class="el-loading-spinner">
          <svg
            viewBox="25 25 50 50"
            class="circular"
          >
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              class="path"
            />
          </svg>
          <p class="el-loading-text">Loading</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getServiceInstances,
  getSchemaList,
  createSchema,
  deleteSchema
} from "@/api/api";
import { MessageBox, Message } from "element-ui";

export default {
  data() {
    return {
      listLoading: true,
      loading: false,
      schemaname: "",
      schemaList: null,
      schemaFormState: false,
      companeMessageShow: false,
      schemaForm: {
        schemaname: "",
        resourcepool: ""
      },
      schemaRules: {
        schemaname: [
          { required: true, trigger: "blur", message: "请填写schema名称" }
        ],
        resourcepool: [
          { required: true, trigger: "blur", message: "请选择所属资源池名称" }
        ]
      },
      poolArry: []
    };
  },
  created() {
    this.getServiceInstances();
    this.getSchemaList();
  },
  methods: {
    /** 获取实例资源池数据 */
    getServiceInstances() {
      let that = this;
      getServiceInstances().then(response => {
        that.poolArry = response.data;
      });
    },
    /** 刷新schema列表 */
    refreshSchemaList() {
      this.schemaname = "";
      this.getSchemaList();
    },
    /** 获取schema列表数据 */
    getSchemaList() {
      this.listLoading = true;
      let params = {
        schemaname: this.schemaname
      };
      let that = this;
      getSchemaList(params).then(response => {
        that.schemaList = response.data;
        that.listLoading = false;
      });
    },
    /** 创建schema */
    createSchema() {
      this.$refs.schemaForm.validate(valid => {
        if (valid) {
          this.loading = true;
          let params = {
            schemaname: this.schemaForm.schemaname,
            instanceId: this.schemaForm.resourcepool.split("&&&")[0],
            resourcepool: this.schemaForm.resourcepool.split("&&&")[1]
          };
          createSchema(params)
            .then(response => {
              if (response.code == 20000) {
                this.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000
                });
                this.schemaFormState = false;
                this.companeMessageShow = false;
                this.getSchemaList();
              }
            })
            .catch(() => {
              console.log("schema创建失败!!");
              this.loading = false;
            });
        } else {
          console.log("schema 表单填写有误!!");
          return false;
        }
      });
    },
    /** 删除schema */
    deleteSchema(schemaId, schemaname) {
      // to re-login
      MessageBox.confirm("确定要删除当前schema么？", "警告提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.listLoading = true;
        let params = {
          schemaId: schemaId,
          schemaname: schemaname
        };
        deleteSchema(params)
          .then(response => {
            if (response.code == 20000) {
              this.loading = false;
              Message({
                message: response.msg,
                type: "success",
                duration: 5 * 1000
              });
              this.getSchemaList();
            }
          })
          .catch(() => {
            console.log("删除schema失败!!");
            this.listLoading = false;
          });
      });
    },
    /** 打开创建schema窗口 */
    openSchemaDialog() {
      this.schemaFormState = true;
      this.companeMessageShow = true;
      this.clearSchemaDialog();
    },
    /** 关闭创建schema窗口 */
    closeCompanyMask(event) {
      let dom = document.getElementById("schemaInfoDialog");
      if (dom) {
        if (!dom.contains(event.target)) {
          // 这句是说如果我们点击到了id为child以外的区域
          this.schemaFormState = false;
          this.companeMessageShow = false;
        }
      }
    },
    /** 清空创建表单数据 */
    clearSchemaDialog() {
      this.$nextTick(()=>{
          this.$refs['schemaForm'].resetFields();
      })
      this.schemaForm.schemaname = "";
      this.schemaForm.resourcepool = "";
    },
    /** table行色差 */
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 0) {
        return "row-greyed";
      }
      return "";
    }
  }
};
</script>

<style lang="scss" scoped>
//或者全局换行
::v-deep .el-table {
  .cell {
    white-space: pre-wrap;
  }
}
::v-deep .el-table .row-greyed {
  background-color: #fafafa;
}
.line {
  text-align: center;
}
.wmassageMask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2001;
  text-align: left;
}
.wmassageMask .elinput {
  width: 80%;
  position: absolute;
  left: 40%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.wmassageMask .themee {
  width: 80%;
  height: 50px;
  line-height: 50px;
  margin: 0px 0 0 37px;
}
.wmassageMask .themee.elinputt {
  width: 82%;
  padding-left: 8px;
}
.wmassageMask .foott {
  width: 100%;
  position: absolute;
  bottom: 10px;
  text-align: center;
}
.search-btn {
  margin-left: 10px;
  background-color: #ffa300;
  border-color: #ffa300;
}
.search-btn:focus, .search-btn:hover {
  background: #f9b741;
  border-color: #f9b741;
  color: #FFF;
}
.loadingWmassageMask {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100000;
  text-align: left;
  .el-loading-mask {
      position: absolute;
      z-index: 2000;
      background-color: rgba(255,255,255,0.5);
      margin: 0;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      -webkit-transition: opacity .3s;
      transition: opacity .3s;
  }
}
</style>
