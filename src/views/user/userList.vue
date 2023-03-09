<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="username"
        class="filter-item el-input el-input--medium"
        style="width: 300px;"
        placeholder="请输入用户名称"
        @keyup.enter.native="getUserList"
      />
      <el-button
        class="el-button--medium search-btn"
        type="primary"
        @click="getUserList"
      >
        <i class="el-icon-search" />
        <span>搜索</span>
      </el-button>
      <el-button
        class="el-button--medium"
        type="primary"
        @click="refreshUserList"
      >
        <i class="el-icon-refresh" />
        <span>刷新</span>
      </el-button>
      <div
        hidden
        style="float: right;"
      >
        <el-button
          class="el-button--medium"
          type="primary"
          @click="openUserDialog"
        >
          <i class="el-icon-plus" />
          <span>创建用户</span>
        </el-button>
      </div>
    </div>
    <el-table 
      ref="userListTable" 
      v-loading="listLoading"
      style="margin-top:10px" 
      :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}" 
      :data="userList" 
      element-loading-text="Loading" 
      :row-class-name="tableRowClassName" 
      @selection-change="checkSelectable"
    >
      <!-- <el-table-column type="selection" width="50"/> -->
      <el-table-column
        align="center"
        label="ID"
        width="300"
        style="background-color:#000000;"
      >
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column
        label="用户名称"
        width="200"
      >
        <template slot-scope="scope">{{ scope.row.username }}</template>
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
        class-name="status-col"
        label="用户状态"
        width="150"
        align="center"
      >
        <template slot-scope="scope">
          <span
            v-if="scope.row.userstate === '0'"
            style="color: red;"
          >未绑定实例</span>
          <span
            v-else-if="scope.row.userstate === '1'"
            style="color: green;"
          >已启用</span>
        </template>
      </el-table-column>
      <el-table-column 
        v-if="false"
        align="center"
        prop="created_at"
        label="操作"
        width="100"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.userstate === '1'"
            class="el-button--small"
            type="danger"
            @click="deleteUser(scope.row.id, scope.row.username, scope.row.userstate)"
          >
            <i class="el-icon-delete" />
            <span>删除</span>
          </el-button>
          <el-button
            v-else
            :disabled="true"
            class="el-button--small"
            type="danger"
            @click="deleteUser(scope.row.id, scope.row.username, scope.row.userstate)"
          >
            <i class="el-icon-delete" />
            <span>删除</span>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div
      v-if="userFormState"
      class="wmassageMask"
      @click="closeCompanyMask"
    >
      <el-dialog
        id="userInfoDialog"
        v-dialogDrag
        class="editboxd"
        :modal="false"
        width="30%"
        :lock-scroll="false"
        :close-on-click-modal="false"
        :visible.sync="companeMessageShow"
        @close="userFormState=false"
      >
        <div
          slot="title"
          class="headers"
        >
          <u style="text-decoration: none;">
            <b style="color:#3a8ee6;">创建用户</b>
          </u>
        </div>
        <el-form
          ref="userForm"
          :model="userForm"
          label-width="120px"
          :rules="userRules"
          label-position="right"
        >
          <el-form-item
            label="资源池名称"
            prop="resourcepool"
          >
            <el-select
              ref="resourcepool"
              v-model="userForm.resourcepool"
              placeholder="请选择资源池"
              style="width: 100%;"
              @change="changeResourceSelect"
            >
              <el-option
                v-for="(item,n) in poolArry"
                :key="n"
                :label="item.resourcepool + '（' + item.instanceId + '）'"
                :value="item.instanceId + '&&&' + item.resourcepool"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="用户名称"
            prop="username"
          >
            <el-select
              ref="username"
              v-model="selectValue" 
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请填写用户名称"
              style="width: 100%;"
              @change="changeSelect"
            >
              <el-option
                v-if="unCreatedUserList.length > 0"
                key="selectAll"
                label="全部"
                value="selectAll"
              />
              <el-option
                v-for="(item, index) in unCreatedUserList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- <el-input ref="username" v-model="userForm.username" placeholder="请填写用户名称" /> -->
          </el-form-item>
          <div style="text-align: center;">
            <el-button
              type="primary"
              @click="createUser"
            >创建</el-button>
            <el-button @click="userFormState=false">取消</el-button>
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
  getUserList,
  getUnCreatedUserByResource,
  createUser,
  deleteUser
} from "@/api/api";
import { MessageBox, Message } from "element-ui";

export default {
  data() {
    return {
      listLoading: true,
      loading: false,
      username: "",
      userList: null,
      userFormState: false,
      companeMessageShow: false,
      userForm: {
        username: "",
        resourcepool: ""
      },
      userRules: {
        username: [
          { required: true, trigger: "blur", message: "请填写用户名称" }
        ],
        resourcepool: [
          { required: true, trigger: "blur", message: "请选择所属资源池名称" }
        ]
      },
      poolArry: [],
      unCreatedUserList: [],
      selectValue: [],
      selectAll: false
    };
  },
  created() {
    this.getServiceInstances();
    this.getUserList();
  },
  methods: {
    /** 获取实例资源池数据 */
    getServiceInstances() {
      let that = this;
      getServiceInstances().then(response => {
        that.poolArry = response.data;
      });
    },
    /** 刷新用户列表 */
    refreshUserList() {
      this.username = "";
      this.getUserList();
    },
    /** 获取user列表数据 */
    getUserList() {
      this.listLoading = true;
      let params = {
        username: this.username
      };
      let that = this;
      getUserList(params).then(response => {
        that.userList = response.data;
        that.listLoading = false;
      });
    },
    changeResourceSelect(resourcepool){
      let params = {
        resourceName: resourcepool.split("&&&")[1]
      };
      let that = this;
      that.unCreatedUserList = [];
      getUnCreatedUserByResource(params).then(response => {
        let unCreatedUsers = [];
        unCreatedUsers = response.data;
        if (unCreatedUsers.length > 0) {
          response.data.forEach(res => {
            let option = {
              value: res,
              label: res
            }
            that.unCreatedUserList.push(option);
          })
        }
      });
    },
    /** 创建user */
    createUser() {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          this.loading = true;
          let params = {
            username: this.userForm.username,
            instanceId: this.userForm.resourcepool.split("&&&")[0],
            resourcepool: this.userForm.resourcepool.split("&&&")[1]
          };
          createUser(params)
            .then(response => {
              if (response.code == 20000) {
                this.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000
                });
                this.userFormState = false;
                this.companeMessageShow = false;
                this.getUserList();
              }
            })
            .catch(() => {
              console.log("用户创建失败!!");
              this.loading = false;
            });
        } else {
          console.log("用户表单填写有误!!");
          return false;
        }
      });
    },
    /** 删除user */
    deleteUser(userId, username, userstate) {
      // to re-login
      MessageBox.confirm("确定要删除当前用户么？", "警告提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.listLoading = true;
        let params = {
          userId: userId,
          username: username,
          userstate: userstate
        };
        deleteUser(params)
          .then(response => {
            if (response.code == 20000) {
              this.loading = false;
              Message({
                message: response.msg,
                type: "success",
                duration: 5 * 1000
              });
              this.getUserList();
            }
          })
          .catch(() => {
            console.log("删除用户失败!!");
            this.listLoading = false;
          });
      });
    },
    /** 打开创建user窗口 */
    openUserDialog() {
      this.userFormState = true;
      this.companeMessageShow = true;
      this.clearUserDialog();
    },
    /** 关闭创建user窗口 */
    closeCompanyMask(event) {
      let dom = document.getElementById("userInfoDialog");
      if (dom) {
        if (!dom.contains(event.target)) {
          // 这句是说如果我们点击到了id为child以外的区域
          this.userFormState = false;
          this.companeMessageShow = false;
        }
      }
    },
    /** 清空创建表单数据 */
    clearUserDialog() {
      this.userForm.username = "";
      this.userForm.resourcepool = "";
      this.unCreatedUserList = [];
      this.selectValue = [];
      this.$nextTick(()=>{
          this.$refs['userForm'].resetFields();
      })
    },
    checkSelectable (row) {
      console.log(row)
      let multipleSelection = row
      let selectionIds = multipleSelection.map(function(item) {
        return item['id']
      })
      console.log('选中的商品id数组：' + selectionIds)
    },
    changeSelect(value) {
      //  selectAll 为true 的时候，就走全选分支，全选后出现的情况就是取消权限
      if (this.selectAll) {
        this.selectAll = false
        if (value.indexOf('selectAll') > -1) {
          this.selectValue = value.filter(p => p != 'selectAll')
        } else {
          this.selectValue = []
        }
      } else {
        //   是否点击了‘全选’选项
        if (value.indexOf('selectAll') > -1) {
          // 有‘全选’选项，则将‘全部’和其他值放置一块
          const optionsValue = []
          this.unCreatedUserList.forEach(item => {
            optionsValue.push(item.value)
          })
          this.selectValue = ['selectAll', ...optionsValue]
          this.selectAll = true
        } else {
          // 若是勾选选择的长度和提供的选项长度是一样的，则是 ‘全选’
          if (value.length === this.unCreatedUserList.length) {
            const optionsValue = []
            this.unCreatedUserList.forEach(item => {
              optionsValue.push(item.value)
            })
            this.selectValue = ['selectAll', ...optionsValue]
            this.selectAll = true
          } else {
            //   都是单选
            this.selectValue = value
          }
        }
      }
      // 真实的勾选值
      const realSelect = this.selectValue.filter(item => item != 'selectAll')
      console.log('realSelect', realSelect)
      this.userForm.username = realSelect.join(",");
      console.log('userForm.username', this.userForm.username)
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
