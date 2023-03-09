<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="rolename"
        class="filter-item el-input el-input--medium"
        style="width: 300px;"
        placeholder="请输入角色名称或用户名称"
        @keyup.enter.native="getRoleList"
      />
      <el-button class="el-button--medium search-btn" type="primary" @click="getRoleList">
        <i class="el-icon-search" />
        <span>搜索</span>
      </el-button>
      <el-button class="el-button--medium" type="primary" @click="refreshRoleList">
        <i class="el-icon-refresh" />
        <span>刷新</span>
      </el-button>
      <!-- <el-button class="el-button--medium" @click="rolename=''">重置</el-button> -->
      <div style="float: right;">
        <el-button class="el-button--medium" type="primary" @click="openAllotRoleToUserDialog">
          <i class="el-icon-edit" />
          <span>用户分配角色</span>
        </el-button>
        <el-button class="el-button--medium" type="primary" @click="openRoleDialog">
          <i class="el-icon-plus" />
          <span>创建角色</span>
        </el-button>
      </div>
    </div>
    <el-table
      ref="roleListTable"
      v-loading="listLoading"
      style="margin-top:10px"
      :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}"
      :data="roleList"
      element-loading-text="Loading"
      :row-class-name="tableRowClassName"
      @selection-change="checkSelectable"
    >
      <el-table-column align="center" label="ID" width="300" style="background-color:#000000;">
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column label="角色名称" width="250" align="left">
        <template slot-scope="scope">{{ scope.row.rolename }}</template>
      </el-table-column>
      <el-table-column label="包含用户" width="300" align="left">
        <template slot-scope="scope">
          <span v-for="(username, n) in scope.row.assigendusersDisplay.split(',')" :key="n">
            <span v-if="username.includes('(未绑定实例)')" style="color:red;">{{ username }}</span>
            <span v-else>{{ username }}</span><br>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="角色描述" align="left">
        <template slot-scope="scope">{{ scope.row.remarks }}</template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作" width="200">
        <template slot-scope="scope">
          <el-button class="el-button--small" type="primary" @click="openEditRoleDialog(scope.row)">
            <i class="el-icon-edit" />
            <span>修改</span>
          </el-button>
          <el-button class="el-button--small" type="danger" @click="deleteRole(scope.row)">
            <i class="el-icon-delete" />
            <span>删除</span>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 创建和修改角色信息弹出窗口 -->
    <div v-if="roleFormState" class="wmassageMask" @click="closeCompanyMask">
      <el-dialog
        id="roleInfoDialog"
        v-dialogDrag
        class="editboxd"
        :modal="false"
        width="50%"
        :lock-scroll="false"
        :close-on-click-modal="false"
        :visible.sync="companeMessageShow"
        @close="roleFormState=false"
      >
        <div slot="title" class="headers">
          <u style="text-decoration: none;">
            <b style="color:#3a8ee6;">角色信息</b>
          </u>
        </div>
        <el-form
          ref="roleForm"
          :model="roleForm"
          label-width="120px"
          :rules="roleRules"
          label-position="right"
        >
          <el-input ref="roleId" v-model="roleForm.id" type="hidden" />
          <el-form-item label="角色名称" prop="rolename">
            <el-input
              v-if="roleForm.id === ''"
              ref="rolename"
              v-model="roleForm.rolename"
              placeholder="请填写角色名称，必须以_role结尾"
            />
            <el-input v-else ref="rolename" v-model="roleForm.rolename" disabled="disabled" />
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input ref="remarks" v-model="roleForm.remarks" placeholder="请填写角色描述" />
          </el-form-item>
          <el-form-item label="分配用户">
            <el-table
              ref="userListTable"
              v-loading="addOrEditListLoading"
              style="line-height: 0px;"
              max-height="350px"
              :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}"
              :data="userList"
              element-loading-text="Loading"
              :row-class-name="tableRowClassName"
              @selection-change="selectionChange"
              @row-click="handleCurrentUserChange"
            >
              <el-table-column type="selection" width="50" :selectable="checkSelectable" />
              <el-table-column label="用户名称" width="250">
                <template slot-scope="scope">{{ scope.row.username }}</template>
              </el-table-column>
              <el-table-column label="资源名称" align="left">
                <template slot-scope="scope">{{ scope.row.resourcepool }}</template>
              </el-table-column>
              <el-table-column class-name="status-col" label="用户状态" align="center" width="150">
                <template slot-scope="scope">
                  <span v-if="scope.row.userstate === '0'" style="color: red;">未绑定实例</span>
                  <span v-else-if="scope.row.userstate === '1'" style="color: green;">已启用</span>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <div style="text-align: center;">
            <el-button v-if="roleForm.id === ''" type="primary" @click="createRole">创建</el-button>
            <el-button v-else type="primary" @click="updateRole">修改</el-button>
            <el-button @click="roleFormState=false">取消</el-button>
          </div>
        </el-form>
      </el-dialog>
    </div>

    <!-- 用户分配角色信息弹出窗口 -->
    <div v-if="allotRoleToUserFormState" class="wmassageMask" @click="closeAllotRoleToUserMask">
      <el-dialog
        id="allotRoleToUserDialog"
        v-dialogDrag
        class="editboxd"
        :modal="false"
        width="50%"
        :lock-scroll="false"
        :close-on-click-modal="false"
        :visible.sync="allotRoleToUserMessageShow"
        @close="allotRoleToUserFormState=false"
      >
        <div slot="title" class="headers">
          <u style="text-decoration: none;">
            <b style="color:#3a8ee6;">用户分配角色</b>
          </u>
        </div>
        <el-form
          ref="allotRoleToUserForm"
          :model="allotRoleToUserForm"
          label-width="120px"
          :rules="allotRoleToUserRules"
          label-position="right"
        >
          <el-form-item label="用户名称" prop="username">
            <el-select
              ref="userId"
              v-model="allotRoleToUserForm.username"
              placeholder="请选择需要分配角色的用户"
              style="width: 100%;"
            >
              <el-option
                v-for="(item,n) in userList"
                :key="n"
                :label="item.username + (item.userstate === '0' ? '(未绑定实例)' : '(已启用)')"
                :value="item.username"
                :style="(item.userstate === '0' ? 'color:red' : '')"
                @click.native="selectedUsername(item)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="用户状态">
            <span v-if="allotRoleToUserForm.userstate === '0'" style="color:red;">未绑定实例</span>
            <span v-if="allotRoleToUserForm.userstate === '1'" style="color: green;">已启用</span>
          </el-form-item>
          <el-form-item label="分配角色">
            <el-table
              ref="allotRoleToUserTable"
              v-loading="grandUserToRoleListLoading"
              style="line-height: 0px;"
              max-height="350px"
              :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}"
              :data="grandUserToRoleList"
              element-loading-text="Loading"
              :row-class-name="tableRowClassName"
              @selection-change="selectionRoleChange"
              @row-click="handleCurrentRoleChange"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column label="角色名称" width="250">
                <template slot-scope="scope">{{ scope.row.rolename }}</template>
              </el-table-column>
              <el-table-column label="包含用户" width="250" align="left">
                <template slot-scope="scope">
                  <span v-for="(username, n) in scope.row.assigendusersDisplay.split(',')" :key="n">
                    <span v-if="username.includes('(未绑定实例)')" style="color:red;">{{ username }}</span>
                    <span v-else>{{ username }}</span><br>
                  </span>
                </template>
                <!-- <span slot-scope="scope">{{ scope.row.assigendusers.replace(/,/g, '\n') }}</span> -->
              </el-table-column>
              <el-table-column class-name="status-col" label="角色描述" align="left">
                <template slot-scope="scope">{{ scope.row.remarks }}</template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <div style="text-align: center;">
            <el-button type="primary" @click="allotRoleToUser">分配</el-button>
            <el-button @click="allotRoleToUserFormState=false">取消</el-button>
          </div>
        </el-form>
      </el-dialog>
    </div>
    <div v-show="loading" class="loadingWmassageMask">
      <div v-show="loading" class="el-loading-mask" style>
        <div class="el-loading-spinner">
          <svg viewBox="25 25 50 50" class="circular">
            <circle cx="50" cy="50" r="20" fill="none" class="path" />
          </svg>
          <p class="el-loading-text">Loading</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getUserList,
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  allotRoleToUser
} from "@/api/api";
import { MessageBox, Message } from "element-ui";

export default {
  data() {
    return {
      listLoading: false,
      addOrEditListLoading: false,
      grandUserToRoleListLoading: false,
      loading: false,
      rolename: "",
      roleList: [],
      userList: [],
      grandUserToRoleList: [],
      selectedUsers: [],
      multipleSelection: [],
      selectedRoles: [],
      multipleRoleSelection: [],
      roleFormState: false,
      companeMessageShow: false,
      roleForm: {
        id: "",
        rolename: "",
        assigendusers: "",
        remarks: ""
      },
      roleRules: {
        rolename: [
          { required: true, trigger: "blur", message: "请填写角色名称" }
        ]
      },

      allotRoleToUserFormState: false,
      allotRoleToUserMessageShow: false,
      allotRoleToUserForm: {
        username: "",
        userstate: "",
        roleIds: ""
      },
      allotRoleToUserRules: {
        username: [
          {
            required: true,
            trigger: "change",
            message: "请选择需要分配角色的用户"
          }
        ]
      }
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    /** 获取user列表数据 */
    getUserList() {
      this.addOrEditListLoading = true;
      let params = {
        username: ""
      };
      let that = this;
      getUserList(params).then(response => {
        that.userList = response.data;
        that.addOrEditListLoading = false;
      });
    },
    /** 刷新role列表数据 */
    refreshRoleList() {
      this.rolename = "";
      this.roleList = [];
      this.getRoleList();
    },
    /** 获取role列表数据 */
    getRoleList() {
      this.listLoading = true;
      let that = this;
      getUserList({ username: "" }).then(response => {
        that.userList = response.data;
        let params = {
          rolename: this.rolename
        };
        getRoleList(params).then(response => {
          response.data.forEach((res) => {
            res.assigendusersDisplay = res.assigendusers;
            let assigendusersTemp = [];
            res.assigendusersDisplay.split(",").forEach((assigenduserTemp) => {
              that.userList.forEach((userInfo) => {
                if (userInfo.username === assigenduserTemp && userInfo.userstate === "0") {
                  assigenduserTemp = assigenduserTemp + "(未绑定实例)";
                }
              });
              assigendusersTemp.push(assigenduserTemp);
            });
            res.assigendusersDisplay = assigendusersTemp.join(",");
          });
          this.$nextTick(() => {
            that.roleList = response.data;
            that.listLoading = false;
          });
        });
      });
    },
    /** 创建role */
    createRole() {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          if (!this.roleForm.rolename.endsWith("_role")){
            Message({
              message: "角色名称必须以 _role 结尾！",
              type: "error",
              duration: 5 * 1000
            });
            return false;
          }
          this.loading = true;
          this.roleForm.assigendusers = this.selectedUsers.join(",");
          let params = {
            rolename: this.roleForm.rolename,
            assigendusers: this.roleForm.assigendusers,
            remarks: this.roleForm.remarks
          };
          createRole(params)
            .then(response => {
              if (response.code == 20000) {
                this.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000
                });
                this.roleFormState = false;
                this.companeMessageShow = false;
                this.getRoleList();
              }
            })
            .catch(() => {
              console.log("角色创建失败!!");
              this.loading = false;
            });
        } else {
          console.log("角色表单填写有误!!");
          return false;
        }
      });
    },
    /** 修改role */
    updateRole() {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.roleForm.assigendusers = this.selectedUsers.join(",");
          // if(this.roleForm.assigendusers === ""){
          //   Message({
          //     message: "请选择给角色分配的用户！",
          //     type: "error",
          //     duration: 5 * 1000
          //   });
          //   return false;
          // }
          let params = {
            id: this.roleForm.id,
            rolename: this.roleForm.rolename,
            assigendusers: this.roleForm.assigendusers,
            remarks: this.roleForm.remarks
          };
          updateRole(params)
            .then(response => {
              if (response.code == 20000) {
                this.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000
                });
                this.roleFormState = false;
                this.companeMessageShow = false;
                this.getRoleList();
              }
            })
            .catch(() => {
              console.log("角色修改失败!!");
              this.loading = false;
            });
        } else {
          console.log("角色表单填写有误!!");
          return false;
        }
      });
    },
    /** 用户分配角色 */
    allotRoleToUser() {
      let that = this;
      this.$refs.allotRoleToUserForm.validate(valid => {
        if (valid) {
          that.allotRoleToUserForm.roleIds = that.selectedRoles.join(",");
          if (that.allotRoleToUserForm.userstate === "0") {
            Message({
              message: "当前用户未绑定实例需要先虚拟订购相关实例才能分配角色！",
              type: "error",
              duration: 5 * 1000
            });
            return false;
          }
          // if(that.allotRoleToUserForm.roleIds === ""){
          //   Message({
          //     message: "请选择给用户分配的角色！",
          //     type: "error",
          //     duration: 5 * 1000
          //   });
          //   return false;
          // }
          that.loading = true;
          let params = {
            username: that.allotRoleToUserForm.username,
            roleIds: that.allotRoleToUserForm.roleIds
          };
          allotRoleToUser(params)
            .then(response => {
              if (response.code == 20000) {
                that.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000
                });
                that.allotRoleToUserFormState = false;
                that.allotRoleToUserMessageShow = false;
                that.getRoleList();
              }
            })
            .catch(() => {
              console.log("用户分配角色失败!!");
              that.loading = false;
            });
        } else {
          console.log("分配角色表单填写有误!!");
          return false;
        }
      });
    },
    /** 删除role */
    deleteRole(row) {
      // to re-login
      MessageBox.confirm("确定要删除当前角色么？", "警告提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.listLoading = true;
        let params = {
          roleId: row.id,
          rolename: row.rolename,
          assigendusers: row.assigendusers
        };
        deleteRole(params)
          .then(response => {
            if (response.code == 20000) {
              this.loading = false;
              Message({
                message: response.msg,
                type: "success",
                duration: 5 * 1000
              });
              this.getRoleList();
            }
          })
          .catch(() => {
            console.log("删除角色失败!!");
            this.listLoading = false;
          });
      });
    },
    /** 用户名称选中事件 */
    selectedUsername(userInfo) {
      this.grandUserToRoleList = [];
      this.allotRoleToUserForm.userstate = userInfo.userstate;
      if (userInfo.userstate === "0") {
        Message({
          message: "当前用户未绑定实例需要先虚拟订购相关实例才能分配角色！",
          type: "error",
          duration: 5 * 1000
        });
        return false;
      } else {
        this.grandUserToRoleListLoading = true;
        let params = {
          rolename: ""
        };
        let that = this;
        getRoleList(params).then(response => {
          response.data.forEach((res) => {
            res.assigendusersDisplay = res.assigendusers;
            let assigendusersTemp = [];
            res.assigendusersDisplay.split(",").forEach((assigenduserTemp) => {
              that.userList.forEach((userInfo) => {
                if (userInfo.username === assigenduserTemp && userInfo.userstate === "0") {
                  assigenduserTemp = assigenduserTemp + "(未绑定实例)";
                }
              });
              assigendusersTemp.push(assigenduserTemp);
            });
            res.assigendusersDisplay = assigendusersTemp.join(",");
            that.grandUserToRoleList.push(res);
          });

          this.$nextTick(() => {
            for (let i = 0; i < that.grandUserToRoleList.length; i++) {
              let assigendusers = that.grandUserToRoleList[i].assigendusers.split(",");
              assigendusers.forEach(element => {
                if (element === that.allotRoleToUserForm.username) {
                  that.$refs.allotRoleToUserTable.toggleRowSelection(that.grandUserToRoleList[i], true);
                }
              });
            }
            this.grandUserToRoleListLoading = false;
          });
        });
      }
    },
    /** 打开创建role窗口 */
    openRoleDialog() {
      this.roleFormState = true;
      this.companeMessageShow = true;
      this.clearRoleDialog();
      this.getUserList();
    },
    /** 打开用户分配角色窗口窗口 */
    openAllotRoleToUserDialog() {
      this.allotRoleToUserFormState = true;
      this.allotRoleToUserMessageShow = true;
      this.clearAllotRoleDialog();
      this.getUserList();
      this.grandUserToRoleList = [];
    },
    /** 打开角色修改窗口 */
    openEditRoleDialog(row) {
      this.roleFormState = true;
      this.companeMessageShow = true;
      this.roleForm.id = row.id;
      this.roleForm.rolename = row.rolename;
      this.roleForm.assigendusers = row.assigendusers;
      this.roleForm.remarks = row.remarks;

      this.addOrEditListLoading = true;
      let params = {
        username: ""
      };
      let that = this;
      getUserList(params).then(response => {
        that.userList = response.data;
        this.$nextTick(() => {
          let assigendusers = that.roleForm.assigendusers.split(",");
          for (let i = 0; i < that.userList.length; i++) {
            assigendusers.forEach(element => {
              if (element === that.userList[i].username) {
                that.$refs.userListTable.toggleRowSelection(
                  that.userList[i],
                  true
                );
              }
            });
          }
          this.addOrEditListLoading = false;
        });
      });
    },
    /** 关闭创建role窗口 */
    closeCompanyMask(event) {
      let dom = document.getElementById("roleInfoDialog");
      if (dom) {
        if (!dom.contains(event.target)) {
          // 这句是说如果我们点击到了id为child以外的区域
          this.roleFormState = false;
          this.companeMessageShow = false;
        }
      }
    },
    /** 关闭用户分配角色窗口 */
    closeAllotRoleToUserMask(event) {
      let dom = document.getElementById("allotRoleToUserDialog");
      if (dom) {
        if (!dom.contains(event.target)) {
          // 这句是说如果我们点击到了id为child以外的区域
          this.allotRoleToUserFormState = false;
          this.allotRoleToUserMessageShow = false;
        }
      }
    },
    /** 清空创建表单数据 */
    clearRoleDialog() {
      this.roleForm.id = "";
      this.roleForm.rolename = "";
      this.roleForm.assigendusers = "";
      this.roleForm.remarks = "";
      this.$nextTick(() => {
        this.$refs["roleForm"].resetFields();
      });
    },
    /** 清空分配角色表单数据 */
    clearAllotRoleDialog() {
      this.allotRoleToUserForm.username = "";
      this.allotRoleToUserForm.roleIds = "";
      this.$nextTick(() => {
        this.$refs["allotRoleToUserForm"].resetFields();
      });
    },
    /**
     * 新增修改角色用户列表的行 点击事件
     * @param row 行数据
     * @description 当某一行被点击时会触发该事件
     */
     handleCurrentUserChange(row) {
      // 如果用户时未绑定实例则不允许选择
      if (!this.checkSelectable(row)) {
        return false;
      }
      // 是否是已选中的行
      var same = false;
      if (this.multipleSelection.length > 0) {
        for (var i = 0; i < this.multipleSelection.length; i++) {
          if (this.multipleSelection[i].id == row.id) {
            same = true;
            this.removeByValue(this.multipleSelection, row);
            break;
          }
        }
        if (same == true) {
          this.$refs.userListTable.toggleRowSelection(row, false);
        } else {
          this.$refs.userListTable.toggleRowSelection(row, true);
        }
      } else {
        // 首次点击直接选中 设置true
        this.$refs.userListTable.toggleRowSelection(row, true);
      }
      this.selectedUsers = this.multipleSelection.map(function(item) {
        return item["username"];
      });
    },
    selectionChange(row) {
      console.log(row);
      this.multipleSelection = row;
      this.selectedUsers = this.multipleSelection.map(function(item) {
        return item["username"];
      });
      console.log("选中的用户数组：" + this.selectedUsers);
    },
    /**
     * 用户分配角色的角色列表行 点击事件
     * @param row 行数据
     * @description 当某一行被点击时会触发该事件
     */
     handleCurrentRoleChange(row) {
      // 是否是已选中的行
      var same = false;
      if (this.multipleRoleSelection.length > 0) {
        for (var i = 0; i < this.multipleRoleSelection.length; i++) {
          if (this.multipleRoleSelection[i].id == row.id) {
            same = true;
            this.removeByValue(this.multipleRoleSelection, row);
            break;
          }
        }
        if (same == true) {
          this.$refs.allotRoleToUserTable.toggleRowSelection(row, false);
        } else {
          this.$refs.allotRoleToUserTable.toggleRowSelection(row, true);
        }
      } else {
        // 首次点击直接选中 设置true
        this.$refs.allotRoleToUserTable.toggleRowSelection(row, true);
      }
      this.selectedRoles = this.multipleRoleSelection.map(function(item) {
        return item["id"];
      });
    },
    selectionRoleChange(row) {
      console.log(row);
      this.multipleRoleSelection = row;
      this.selectedRoles = this.multipleRoleSelection.map(function(item) {
        return item["id"];
      });
      console.log("选中的角色数组：" + this.selectedRoles);
    },
    /**
     * % tag 1 取消选中
     * @param arr 已选中行id 数组
     * @param val 当前选中行id
     * @description 取消选中
     */
    removeByValue(arr, val) {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] == val) {
          arr.splice(i, 1);
          break;
        }
      }
    },
    /**
     * 条件判断，当前行多选框是否禁用
     * @param 列表数据
     * @returns true/不禁用 false/禁用
     */
    checkSelectable(row) {
      // 禁用不可选行
      if (row.userstate === "0") {
        return false;
      } else {
        return true;
      }
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
.search-btn:focus,
.search-btn:hover {
  background: #f9b741;
  border-color: #f9b741;
  color: #fff;
}
//或者全局换行
::v-deep .el-table {
  .cell {
    white-space: pre-wrap;
  }
}
::v-deep .el-table .row-greyed {
  background-color: #fafafa;
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
    background-color: rgba(255, 255, 255, 0.5);
    margin: 0;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    -webkit-transition: opacity 0.3s;
    transition: opacity 0.3s;
  }
}
</style>
