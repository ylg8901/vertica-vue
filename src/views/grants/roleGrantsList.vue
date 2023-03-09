<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-tabs v-model="grantsActive" type="card" @tab-click="selectedGrantsTab">
        <el-tab-pane label="SCHEMA权限" name="schema" />
        <el-tab-pane label="外部函数权限" name="external" />
      </el-tabs>
    </div>

    <!-- 角色schema权限面板 -->
    <div v-if="grantsActive === 'schema'">
      <el-input
        v-model="searchObjectName"
        class="filter-item el-input el-input--medium"
        style="width: 300px;"
        placeholder="请输入角色名称或用户名称"
        @keyup.enter.native="getSchemaGrantsList"
      />
      <el-button class="el-button--medium search-btn" type="primary" @click="getSchemaGrantsList">
        <i class="el-icon-search" />
        <span>搜索</span>
      </el-button>
      <el-button class="el-button--medium" type="primary" @click="selectedGrantsTab">
        <i class="el-icon-refresh" />
        <span>刷新</span>
      </el-button>
      <el-button class="el-button--medium" type="primary" style="float: right" @click="openSchemaGrantsDialog">
        <i class="el-icon-plus" />
        <span>创建SCHEMA权限</span>
      </el-button>
      <el-table ref="schemaGrantsListTable" v-loading="listLoading" style="margin-top: 10px"
                :header-cell-style="{'background-color': '#93A3AD', color: '#FFFFFF' }" :data="schemaGrantsList"
                element-loading-text="Loading" :row-class-name="tableRowClassName"
      >
        <el-table-column align="center" label="ID" width="300" style="background-color: #000000">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="角色名称" width="150" align="left">
          <template slot-scope="scope">{{ scope.row.objectName }}</template>
        </el-table-column>
        <el-table-column label="包含用户" width="200" align="left">
          <template slot-scope="scope">
            <span v-for="(username, n) in scope.row.assigendusersDisplay.split(',')" :key="n">
              <span v-if="username.includes('(未绑定实例)')" style="color: red">{{ username }}</span>
              <span v-else>{{ username }}</span>
              <br>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="SCHEMA授权详情" align="left">
          <template slot-scope="scope">
            <span>{{ scope.row.unauthorized.replace(/,/g, ", ").replace(/;/g, "\n") }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_at" label="操作" width="200">
          <template slot-scope="scope">
            <el-button class="el-button--small" type="primary" @click="openEditSchemaGrantsDialog(scope.row)">
              <i class="el-icon-edit" />
              <span>修改</span>
            </el-button>
            <el-button class="el-button--small" type="danger" @click="deleteSchemaGrants(scope.row)">
              <i class="el-icon-delete" />
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 创建和修改角色SCHEMA权限息弹出窗口 -->
      <div v-if="schemaGrantsFormState" class="wmassageMask" @click="closeSchemaGrantsDialog">
        <el-dialog id="schemaGrantsInfoDialog" v-dialogDrag class="editboxd" :modal="false" width="50%"
                   :lock-scroll="false" :close-on-click-modal="false" :visible.sync="schemaGrantsMessageShow"
                   @close="schemaGrantsFormState = false"
        >
          <div slot="title" class="headers">
            <u style="text-decoration: none">
              <b style="color: #3a8ee6">SCHEMA权限信息</b>
            </u>
          </div>
          <el-form ref="schemaGrantsForm" :model="schemaGrantsForm" :rules="schemaGrantsRules" label-width="120px"
                   label-position="right"
          >
            <el-input v-model="schemaGrantsForm.id" type="hidden" />
            <el-form-item label="角色名称" prop="objectName">
              <el-select v-if="schemaGrantsForm.id === ''" v-model="schemaGrantsForm.objectName"
                         placeholder="请选择角色名称" style="width: 100%"
              >
                <el-option v-for="(item, n) in roleList" :key="n" :label="item.rolename" :value="item.rolename"
                           @click.native="selectedRoleName(item)"
                />
              </el-select>
              <span v-else>{{ schemaGrantsForm.objectName }}</span>
            </el-form-item>
            <el-form-item label="包含用户">
              <span v-for="(username, n) in schemaGrantsForm.assigendusersDisplay.split(',')" :key="n">
                <span v-if="username.includes('(未绑定实例)')" style="color: red">{{ username }}</span>
                <span v-else>{{ username }}</span>
                <span v-if=" n < schemaGrantsForm.assigendusersDisplay.split(',').length - 1 ">,</span>
              </span>
            </el-form-item>
            <el-form-item label="schema权限">
              <el-table ref="schemaListTable" v-loading="getSchemaListLoading" style="line-height: 0px"
                        max-height="350px" :header-cell-style="{'background-color': '#93A3AD', color: '#FFFFFF',}" 
                        :data="schemaList" element-loading-text="Loading" :row-class-name="tableRowClassName"
              >
                <el-table-column label="schema名称" width="150">
                  <template slot-scope="scope">
                    {{ scope.row.schemaname }}
                  </template>
                </el-table-column>
                <el-table-column label="权限配置">
                  <template slot-scope="scope">
                    <el-checkbox v-model="scope.row.checkAllGrants" :indeterminate="scope.row.isIndeterminate"
                                 @change="handleCheckAllChange(scope.row)"
                    >ALL</el-checkbox>
                    <el-checkbox-group v-model="scope.row.checkGrantsList" @change="handleChangeChecked(scope.row)">
                      <el-checkbox v-for="(grant, optionIndex) in grantsList" :key="optionIndex" :label="grant">{{ grant }}</el-checkbox>
                    </el-checkbox-group>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <div style="text-align: center">
              <el-button v-if="schemaGrantsForm.id === ''" type="primary" @click="createSchemaGrants">创建</el-button>
              <el-button v-else type="primary" @click="updateSchemaGrants">修改</el-button>
              <el-button @click="schemaGrantsFormState = false">取消</el-button>
            </div>
          </el-form>
        </el-dialog>
      </div>
    </div>

    <!--******************************************************************************** 外部函数 ***************************************************************************-->
    <!-- 角色外部函数权限面板 -->
    <div v-if="grantsActive === 'external'">
      <el-input
        v-model="searchObjectName"
        class="filter-item el-input el-input--medium"
        style="width: 300px;"
        placeholder="请输入用户名称或角色名称"
        @keyup.enter.native="getExternalGrantsList"
      />
      <el-button class="el-button--medium search-btn" type="primary" @click="getExternalGrantsList">
        <i class="el-icon-search" />
        <span>搜索</span>
      </el-button>
      <el-button class="el-button--medium" type="primary" @click="selectedGrantsTab">
        <i class="el-icon-refresh" />
        <span>刷新</span>
      </el-button>
      <el-button class="el-button--medium" type="primary" style="float: right" @click="openExternalGrantsDialog">
        <i class="el-icon-plus" />
        <span>创建外部函数权限</span>
      </el-button>
      <el-table ref="externalGrantsListTable" v-loading="listLoading" style="margin-top: 10px"
                :header-cell-style="{'background-color': '#93A3AD', color: '#FFFFFF' }" :data="externalGrantsList"
                element-loading-text="Loading" :row-class-name="tableRowClassName"
      >
        <el-table-column align="center" label="ID" width="300" style="background-color: #000000">
          <template slot-scope="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="角色名称" width="250" align="left">
          <template slot-scope="scope">{{ scope.row.objectName }}</template>
        </el-table-column>
        <el-table-column label="包含用户" width="300" align="left">
          <template slot-scope="scope">
            <span v-for="(username, n) in scope.row.assigendusersDisplay.split(',')" :key="n">
              <span v-if="username.includes('(未绑定实例)')" style="color: red">{{ username }}</span>
              <span v-else>{{ username }}</span>
              <br>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="权限描述" align="left">
          <template slot-scope="scope">
            <span>{{ scope.row.privilegesDescription.replace(/;/g, "\n") }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_at" label="操作" width="200">
          <template slot-scope="scope">
            <el-button class="el-button--small" type="primary" @click="openEditExternalGrantsDialog(scope.row)">
              <i class="el-icon-edit" />
              <span>修改</span>
            </el-button>
            <el-button class="el-button--small" type="danger" @click="deleteExternalGrants(scope.row)">
              <i class="el-icon-delete" />
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 创建和修改角色外部函数权限息弹出窗口 -->
      <div v-if="externalGrantsFormState" class="wmassageMask" @click="closeExternalGrantsDialog">
        <el-dialog id="externalGrantsInfoDialog" v-dialogDrag class="editboxd" :modal="false" width="50%"
                   :lock-scroll="false" :close-on-click-modal="false"
                   :visible.sync="externalGrantsMessageShow" @close="externalGrantsFormState = false"
        >
          <div slot="title" class="headers">
            <u style="text-decoration: none">
              <b style="color: #3a8ee6">外部函数权限信息</b>
            </u>
          </div>
          <el-form ref="externalGrantsForm" :model="externalGrantsForm" :rules="externalGrantsRules" label-width="120px" label-position="right">
            <el-input v-model="externalGrantsForm.id" type="hidden" />
            <el-form-item label="角色名称" prop="objectName">
              <el-select v-if="externalGrantsForm.id === ''" v-model="externalGrantsForm.objectName" placeholder="请选择角色名称" style="width: 100%">
                <el-option v-for="(item, n) in roleList" :key="n" :label="item.rolename" :value="item.rolename" @click.native="selectedExternalRoleName(item)" />
              </el-select>
              <span v-else>{{ externalGrantsForm.objectName }}</span>
            </el-form-item>
            <el-form-item label="包含用户">
              <span v-for="(username, n) in externalGrantsForm.assigendusersDisplay.split(',')" :key="n">
                <span v-if="username.includes('(未绑定实例)')" style="color: red">{{ username }}</span>
                <span v-else>{{ username }}</span>
                <span v-if=" n < externalGrantsForm.assigendusersDisplay.split(',').length - 1 ">,</span>
              </span>
            </el-form-item>
            <el-form-item label="角色外函数">
              <el-table ref="externalListTable" v-loading="getExternalListLoading" style="line-height: 0px"
                        max-height="350px" :header-cell-style="{'background-color': '#93A3AD', color: '#FFFFFF', }" 
                        :data="externalList" element-loading-text="Loading" :row-class-name="tableRowClassName"
                        @selection-change="selectionRoleChange"
              >
                <el-table-column type="selection" width="50" />
                <el-table-column label="外部函数">
                  <template slot-scope="scope">
                    <span>{{ scope.row.procedure_name }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <div style="text-align: center">
              <el-button v-if="externalGrantsForm.id === ''" type="primary" @click="createExternalGrants">创建
              </el-button>
              <el-button v-else type="primary" @click="updateExternalGrants">修改</el-button>
              <el-button @click="externalGrantsFormState = false">取消</el-button>
            </div>
          </el-form>
        </el-dialog>
      </div>
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
  getSchemaList,
  getRoleList,
  getSchemaGrantsList,
  createSchemaGrants,
  updateSchemaGrants,
  deleteSchemaGrants,
  getVsProceduresList,
  getExternalGrantsList,
  createExternalGrants,
  updateExternalGrants,
  deleteExternalGrants,
} from "@/api/api";
import { MessageBox, Message } from "element-ui";

//权限项目 INSERT, SELECT, UPDATE, DELETE, ALTER, REFERENCES, DROP, USAGE, CREATE, TRUNCATE
const grantsOptions = [
  "INSERT",
  "SELECT",
  "UPDATE",
  "DELETE",
  "ALTER",
  "REFERENCES",
  "DROP",
  "USAGE",
  "CREATE",
  "TRUNCATE",
];
export default {
  data() {
    return {
      searchObjectName: "",
      listLoading: false,
      getSchemaListLoading: false,
      getExternalListLoading: false,
      loading: false,
      grantsActive: "schema",
      roleList: [],
      schemaList: [],
      grantsList: grantsOptions,
      schemaGrantsList: [],
      schemaGrantsFormState: false,
      schemaGrantsMessageShow: false,
      schemaGrantsForm: {
        id: "",
        objectName: "",
        objectType: "ROLE",
        assigendusers: "",
        assigendusersDisplay: "",
        unauthorized: "", // schema授权信息
        readonly: "",
        readwrite: "",
        fullauthority: "",
      },
      schemaGrantsRules: {
        objectName: [
          { required: true, trigger: "change", message: "请选择角色名称" },
        ],
      },

      externalGrantsList: [],
      externalGrantsFormState: false,
      externalGrantsMessageShow: false,
      selectedExternals: [],
      multipleExternalSelection: null,
      externalGrantsForm: {
        id: "",
        objectName: "",
        objectType: "ROLE",
        assigendusers: "",
        assigendusersDisplay: "",
        privilegesDescription: "",
      },
      externalGrantsRules: {
        objectName: [
          { required: true, trigger: "change", message: "请选择角色名称" },
        ],
      },
      externalList: [],
    };
  },
  created() {
    this.getSchemaGrantsList();
  },
  methods: {
    /** tab页切换事件 */
    selectedGrantsTab() {
      this.searchObjectName = "";
      if (this.grantsActive === "schema") {
        this.getSchemaGrantsList();
      } else if (this.grantsActive === "external") {
        this.getExternalGrantsList();
      }
      this.getRoleList();
    },
    /** 获取角色schema权限列表数据 */
    getSchemaGrantsList() {
      this.listLoading = true;
      let that = this;
      getUserList({ username: "" }).then((response) => {
        let userList = response.data;
        let params = {
          objectName: that.searchObjectName,
          objectType: "ROLE",
        };
        getSchemaGrantsList(params).then((response) => {
          response.data.forEach((res) => {
            res.assigendusersDisplay = res.assigendusers;
            let assigendusersTemp = [];
            res.assigendusersDisplay
              .split(",")
              .forEach((assigenduserTemp) => {
                userList.forEach((userInfo) => {
                  if (
                    userInfo.username === assigenduserTemp &&
                    userInfo.userstate === "0"
                  ) {
                    assigenduserTemp = assigenduserTemp + "(未绑定实例)";
                  }
                });
                assigendusersTemp.push(assigenduserTemp);
              });
            res.assigendusersDisplay = assigendusersTemp.join(",");
          });
          this.$nextTick(() => {
            that.schemaGrantsList = response.data;
            that.listLoading = false;
          });
        });
      });
    },
    /** 获取角色列表数据 */
    getRoleList() {
      let params = {
        rolename: "",
      };
      let that = this;
      getRoleList(params).then((response) => {
        that.roleList = response.data;
      });
    },
    /** 获得最终创建或者修改的权限实际信息 */
    getNewSchemaGrantsForm(schemaGrantsForm) {
      // schema授权配置信息组合
      let unauthorized = [];
      this.schemaList.forEach((res) => {
        if (res.checkGrantsList.length > 0) {
          let schemaGrants =
            res.schemaname + "：" + res.checkGrantsList.join(",");
          unauthorized.push(schemaGrants);
        }
      });
      schemaGrantsForm.unauthorized = unauthorized.join(";");
      return schemaGrantsForm;
    },
    /** 创建角色schema权限数据 */
    createSchemaGrants() {
      this.$refs.schemaGrantsForm.validate((valid) => {
        if (valid) {
          this.schemaGrantsForm = this.getNewSchemaGrantsForm(
            this.schemaGrantsForm
          );
          if (this.schemaGrantsForm.unauthorized === "") {
            Message({
              message: "请选择分配给角色的schema权限！！！",
              type: "error",
              duration: 5 * 1000,
            });
            return false;
          }
          console.log(this.schemaGrantsForm);
          this.loading = true;
          createSchemaGrants(this.schemaGrantsForm)
            .then((response) => {
              if (response.code == 20000) {
                this.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000,
                });
                this.schemaGrantsFormState = false;
                this.schemaGrantsMessageShow = false;
                this.getSchemaGrantsList();
              }
            })
            .catch(() => {
              console.log("角色schema权限创建失败!!");
              this.loading = false;
            });
        } else {
          console.log("表单填写有误!!");
          return false;
        }
      });
    },
    /** 修改角色schema权限数据 */
    updateSchemaGrants() {
      this.$refs.schemaGrantsForm.validate((valid) => {
        if (valid) {
          this.schemaGrantsForm = this.getNewSchemaGrantsForm(
            this.schemaGrantsForm
          );
          if (this.schemaGrantsForm.unauthorized === "") {
            Message({
              message: "请为角色分配有效的schema权限！！！",
              type: "error",
              duration: 5 * 1000,
            });
            return false;
          }
          console.log(this.schemaGrantsForm);
          this.loading = true;
          updateSchemaGrants(this.schemaGrantsForm)
            .then((response) => {
              if (response.code == 20000) {
                this.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000,
                });
                this.schemaGrantsFormState = false;
                this.schemaGrantsMessageShow = false;
                this.getSchemaGrantsList();
              }
            })
            .catch(() => {
              console.log("角色schema权限修改失败!!");
              this.loading = false;
            });
        } else {
          console.log("表单填写有误!!");
          return false;
        }
      });
    },
    /** 删除角色schema权限数据 */
    deleteSchemaGrants(row) {
      // to re-login
      MessageBox.confirm("确定要删除当前角色SCHEMA权限么？", "警告提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.listLoading = true;
        let params = {
          grantsId: row.id,
          objectName: row.objectName,
          objectType: row.objectType,
          assigendusers: row.assigendusers,
          unauthorized: row.unauthorized,
          readonly: row.readonly,
          readwrite: row.readwrite,
          fullauthority: row.fullauthority,
        };
        deleteSchemaGrants(params)
          .then((response) => {
            if (response.code == 20000) {
              this.loading = false;
              Message({
                message: response.msg,
                type: "success",
                duration: 5 * 1000,
              });
              this.getSchemaGrantsList();
            }
          })
          .catch(() => {
            console.log("删除角色SCHEMA权限失败!!");
            this.listLoading = false;
          });
      });
    },
    /** 角色称选中事件 */
    selectedRoleName(roleInfo) {
      this.schemaGrantsForm.assigendusers = roleInfo.assigendusers;
      this.getSchemaListLoading = true;
      let that = this;
      getUserList({ username: "" }).then((response) => {
        let userList = response.data;
        let assigendusersTemp = [];
        roleInfo.assigendusers.split(",").forEach((assigenduserTemp) => {
          userList.forEach((userInfo) => {
            if (
              userInfo.username === assigenduserTemp &&
              userInfo.userstate === "0"
            ) {
              assigenduserTemp = assigenduserTemp + "(未绑定实例)";
            }
          });
          assigendusersTemp.push(assigenduserTemp);
        });
        that.schemaGrantsForm.assigendusersDisplay =
          assigendusersTemp.join(",");
      });

      let params = {
        schemaname: "",
      };
      this.schemaList = [];
      getSchemaList(params).then((response) => {
        response.data.forEach((res) => {
          res.checkAllGrants = false;
          res.checkGrantsList = [];
          res.isIndeterminate = false;
          that.schemaList.push(res);
        });
        that.getSchemaListLoading = false;
      });
    },
    /** schema授权全选操作 */
    handleCheckAllChange(schemaInfo) {
      if (schemaInfo.checkAllGrants) {
        schemaInfo.checkAllGrants = true;
        schemaInfo.checkGrantsList = this.grantsList;
        schemaInfo.isIndeterminate = false;
      } else {
        schemaInfo.checkAllGrants = false;
        schemaInfo.checkGrantsList = [];
      }
      console.log(
        "schema授权全选操作-------------------------" +
        schemaInfo.checkGrantsList
      );
    },
    /** schema授权单选操作 */
    handleChangeChecked(schemaInfo) {
      let checkedCount = schemaInfo.checkGrantsList.length;
      schemaInfo.checkAllGrants = checkedCount === this.grantsList.length;
      schemaInfo.isIndeterminate =
        checkedCount > 0 && checkedCount < this.grantsList.length;
      console.log(
        "schema授权单选操作:::::::::::::::::::::::::" +
        schemaInfo.checkGrantsList
      );
    },
    /** 打开创建角色schema权限窗口 */
    openSchemaGrantsDialog() {
      this.getRoleList();
      this.schemaGrantsFormState = true;
      this.schemaGrantsMessageShow = true;
      this.clearSchemaGrantsDialog();
    },
    /** 打开修改角色schema权限窗口 */
    openEditSchemaGrantsDialog(row) {
      // let unauthorized, readonly, readwrite, fullauthority = [];
      this.schemaGrantsFormState = true;
      this.schemaGrantsMessageShow = true;
      this.schemaGrantsForm.id = row.id;
      this.schemaGrantsForm.objectName = row.objectName;
      this.schemaGrantsForm.objectType = row.objectType;
      this.schemaGrantsForm.assigendusers = row.assigendusers;
      this.schemaGrantsForm.unauthorized = row.unauthorized;
      this.schemaGrantsForm.assigendusersDisplay = row.assigendusersDisplay;

      this.getSchemaListLoading = true;
      let that = this;
      let params = {
        schemaname: "",
      };
      // schema授权信息
      this.schemaList = [];
      let schemaGrants = row.unauthorized.split(";");
      getSchemaList(params).then((response) => {
        response.data.forEach((scRes) => {
          scRes.checkAllGrants = false;
          scRes.checkGrantsList = [];
          scRes.isIndeterminate = false;
          schemaGrants.forEach((unRes) => {
            if (scRes.schemaname === unRes.split("：")[0]) {
              if (
                unRes.split("：")[1].split(",").length ===
                that.grantsList.length
              ) {
                scRes.checkAllGrants = true;
                scRes.checkGrantsList = that.grantsList;
              } else {
                scRes.checkAllGrants = false;
                scRes.checkGrantsList = unRes.split("：")[1].split(",");
                scRes.isIndeterminate = true;
              }
            }
          });
          that.schemaList.push(scRes);
        });
        that.getSchemaListLoading = false;
      });
    },
    /** 关闭创建角色schema权限窗口窗口 */
    closeSchemaGrantsDialog(event) {
      let dom = document.getElementById("schemaGrantsInfoDialog");
      if (dom) {
        if (!dom.contains(event.target)) {
          // 这句是说如果我们点击到了id为child以外的区域
          this.schemaGrantsFormState = false;
          this.schemaGrantsMessageShow = false;
        }
      }
    },
    /** 清空创建表单数据 */
    clearSchemaGrantsDialog() {
      this.schemaGrantsForm.id = "";
      this.schemaGrantsForm.objectName = "";
      (this.schemaGrantsForm.objectType = "ROLE"),
        (this.schemaGrantsForm.assigendusers = "");
      this.schemaGrantsForm.assigendusersDisplay = "";
      this.schemaGrantsForm.unauthorized = "";
      this.schemaGrantsForm.readonly = "";
      this.schemaGrantsForm.readwrite = "";
      this.schemaGrantsForm.fullauthority = "";
      this.schemaList = [];
      this.$nextTick(() => {
        this.$refs["schemaGrantsForm"].resetFields();
      });
    },
    /******************************************************************************** 外部函数 ***************************************************************************/
    /** 获取角色外部函数权限列表数据 */
    getExternalGrantsList() {
      this.listLoading = true;
      let that = this;
      getUserList({ username: "" }).then((response) => {
        let userList = response.data;
        let params = {
          objectName: that.searchObjectName,
          objectType: "ROLE",
        };
        getExternalGrantsList(params).then((response) => {
          response.data.forEach((res) => {
            res.assigendusersDisplay = res.assigendusers;
            let assigendusersTemp = [];
            res.assigendusersDisplay
              .split(",")
              .forEach((assigenduserTemp) => {
                userList.forEach((userInfo) => {
                  if (
                    userInfo.username === assigenduserTemp &&
                    userInfo.userstate === "0"
                  ) {
                    assigenduserTemp = assigenduserTemp + "(未绑定实例)";
                  }
                });
                assigendusersTemp.push(assigenduserTemp);
              });
            res.assigendusersDisplay = assigendusersTemp.join(",");
          });
          this.$nextTick(() => {
            that.externalGrantsList = response.data;
            that.listLoading = false;
          });
        });
      });
    },
    /** 创建角色外部函数权限数据 */
    createExternalGrants() {
      this.$refs.externalGrantsForm.validate((valid) => {
        if (valid) {
          this.externalGrantsForm.privilegesDescription =
            this.selectedExternals.join(",");
          if (this.externalGrantsForm.privilegesDescription === "") {
            Message({
              message: "请选择分配给角色的外部函数权限！！！",
              type: "error",
              duration: 5 * 1000,
            });
            return false;
          }
          // this.externalGrantsForm = this.getNewExternalGrantsForm(this.externalGrantsForm);
          console.log(this.externalGrantsForm);
          this.loading = true;
          createExternalGrants(this.externalGrantsForm)
            .then((response) => {
              if (response.code == 20000) {
                this.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000,
                });
                this.externalGrantsFormState = false;
                this.externalGrantsMessageShow = false;
                this.getExternalGrantsList();
              }
            })
            .catch(() => {
              console.log("角色外部函数权限创建失败!!");
              this.loading = false;
            });
        } else {
          console.log("表单填写有误!!");
          return false;
        }
      });
    },
    /** 修改角色外部函数权限数据 */
    updateExternalGrants() {
      this.$refs.externalGrantsForm.validate((valid) => {
        if (valid) {
          this.externalGrantsForm.privilegesDescription =
            this.selectedExternals.join(",");
          if (this.externalGrantsForm.privilegesDescription === "") {
            Message({
              message: "请为角色分配有效的外部函数权限！！！",
              type: "error",
              duration: 5 * 1000,
            });
            return false;
          }
          console.log(this.externalGrantsForm);
          this.loading = true;
          updateExternalGrants(this.externalGrantsForm)
            .then((response) => {
              if (response.code == 20000) {
                this.loading = false;
                Message({
                  message: response.msg,
                  type: "success",
                  duration: 5 * 1000,
                });
                this.externalGrantsFormState = false;
                this.externalGrantsMessageShow = false;
                this.getExternalGrantsList();
              }
            })
            .catch(() => {
              console.log("角色外部函数权限修改失败!!");
              this.loading = false;
            });
        } else {
          console.log("表单填写有误!!");
          return false;
        }
      });
    },
    /** 删除角色external权限数据 */
    deleteExternalGrants(row) {
      // to re-login
      MessageBox.confirm("确定要删除当前角色外部函数权限么？", "警告提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.listLoading = true;
        let params = {
          grantsId: row.id,
          objectName: row.objectName,
          objectType: row.objectType,
        };
        deleteExternalGrants(params)
          .then((response) => {
            if (response.code == 20000) {
              this.loading = false;
              Message({
                message: response.msg,
                type: "success",
                duration: 5 * 1000,
              });
              this.getExternalGrantsList();
            }
          })
          .catch(() => {
            console.log("删除角色外部函数失败!!");
            this.listLoading = false;
          });
      });
    },
    /** 角色称选中事件 */
    selectedExternalRoleName(roleInfo) {
      this.externalGrantsForm.assigendusers = roleInfo.assigendusers;
      this.getExternalListLoading = true;
      let that = this;
      getUserList({ username: "" }).then((response) => {
        let userList = response.data;
        let assigendusersTemp = [];
        roleInfo.assigendusers.split(",").forEach((assigenduserTemp) => {
          userList.forEach((userInfo) => {
            if (
              userInfo.username === assigenduserTemp &&
              userInfo.userstate === "0"
            ) {
              assigenduserTemp = assigenduserTemp + "(未绑定实例)";
            }
          });
          assigendusersTemp.push(assigenduserTemp);
        });
        that.externalGrantsForm.assigendusersDisplay =
          assigendusersTemp.join(",");
      });

      getVsProceduresList({}).then((response) => {
        that.externalList = response.data;
        that.getExternalListLoading = false;
      });
    },
    /** 打开创建角色外部函数权限窗口 */
    openExternalGrantsDialog() {
      this.getRoleList();
      this.externalGrantsFormState = true;
      this.externalGrantsMessageShow = true;
      this.clearExternalGrantsDialog();
    },
    /** 打开修改角色外部函数权限窗口 */
    openEditExternalGrantsDialog(row) {
      // let unauthorized, readonly, readwrite, fullauthority = [];
      this.externalGrantsFormState = true;
      this.externalGrantsMessageShow = true;
      this.externalGrantsForm.id = row.id;
      this.externalGrantsForm.objectName = row.objectName;
      this.externalGrantsForm.objectType = row.objectType;
      this.externalGrantsForm.assigendusers = row.assigendusers;
      this.externalGrantsForm.privilegesDescription = row.privilegesDescription;
      this.externalGrantsForm.assigendusersDisplay = row.assigendusersDisplay;

      this.getExternalListLoading = true;
      let that = this;
      getVsProceduresList({}).then((response) => {
        that.externalList = response.data;
        that.$nextTick(() => {
          let privilegesDescription = that.externalGrantsForm.privilegesDescription.split(";");
          for (let i = 0; i < that.externalList.length; i++) {
            that.$refs.externalListTable.toggleRowSelection(
              that.externalList[i],
              false
            );
            privilegesDescription.forEach((element) => {
              if (element === that.externalList[i].procedure_name) {
                that.$refs.externalListTable.toggleRowSelection(
                  that.externalList[i],
                  true
                );
              }
            });
          }
          that.getExternalListLoading = false;
        });
      });
    },
    /** 关闭创建角色外部函数权限窗口窗口 */
    closeExternalGrantsDialog(event) {
      let dom = document.getElementById("externalGrantsInfoDialog");
      if (dom) {
        if (!dom.contains(event.target)) {
          // 这句是说如果我们点击到了id为child以外的区域
          this.externalGrantsFormState = false;
          this.externalGrantsMessageShow = false;
        }
      }
    },
    /** 清空创建表单数据 */
    clearExternalGrantsDialog() {
      this.externalGrantsForm.id = "";
      this.externalGrantsForm.objectName = "";
      (this.externalGrantsForm.objectType = "ROLE"),
        (this.externalGrantsForm.assigendusers = "");
      this.externalGrantsForm.assigendusersDisplay = "";
      this.externalGrantsForm.privilegesDescription = "";
      this.externalList = [];
      this.$nextTick(() => {
        this.$refs["externalGrantsForm"].resetFields();
      });
    },
    selectionRoleChange(row) {
      console.log(row);
      this.multipleExternalSelection = row;
      this.selectedExternals = this.multipleExternalSelection.map(function (
        item
      ) {
        let multipleExternal = item["procedure_name"] + "@@@@@" + item["grant_sql"] + "@@@@@" + item["revoke_sql"];
        multipleExternal = multipleExternal.replace(/,/g, "&&&&&");
        return multipleExternal;
      });
      console.log("选中的外部函数数组：" + this.selectedExternals);
    },
    /**
     * 条件判断，当前行多选框是否禁用
     * @param 列表数据
     * @returns true/不禁用 false/禁用
     */
    checkSelectable(row) {
      if (row.userstate === "0") {
        //禁用不可选行
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
    },
  },
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
