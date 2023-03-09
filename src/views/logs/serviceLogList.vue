<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="operator" size="small" class="filter-item el-input el-input--medium" style="width: 200px;margin: 0px 5px 0px 0px;" placeholder="请输入操作员名称" @keyup.enter.native="getServiceLogList" />
      <el-select v-model="logType" size="small" placeholder="请选择日志分类" style="width: 200px;margin: 0px 5px 0px 5px;">
        <el-option label="全部" value="ALL" />
        <el-option label="Schema管理" value="1" />
        <el-option label="用户管理" value="2" />
        <el-option label="角色管理" value="3" />
        <el-option label="角色权限配置" value="4" />
        <el-option label="用户权限配置" value="5" />
      </el-select>
      <el-select v-model="operateType" size="small" placeholder="请选择操作类型" style="width: 200px;margin: 0px 5px 0px 5px;">
        <el-option label="全部" value="ALL" />
        <el-option label="查询" value="0" />
        <el-option label="新增" value="1" />
        <el-option label="修改" value="2" />
        <el-option label="删除" value="3" />
      </el-select>
      <el-select v-model="operateState" size="small" placeholder="请选择操作状态" style="width: 200px;margin: 0px 5px 0px 5px;">
        <el-option label="全部" value="ALL" />
        <el-option label="成功" value="0" />
        <el-option label="失败" value="1" />
      </el-select>
      <label style="width: 200px; margin: 0px 0px 0px 5px;font-size: 14px;font-weight: inherit;color: #606266;">操作时间:</label>
      <el-date-picker id="startdata" v-model="startTime" type="datetime" size="small" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :editable="false" style="width: 200px;margin: 0px 0px 0px 3px;" placeholder="开始时间" class="dateinput" />
      <label style="width: 200px;margin: 0px 2px 0px 2px;">-</label>
      <el-date-picker id="startdata" v-model="endTime" type="datetime" size="small" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" :editable="false" placeholder="结束时间" class="dateinput" />
      <el-button class="el-button--small search-btn" type="primary" @click="sarchServiceLogList">
        <i class="el-icon-search" />
        <span>搜索</span>
      </el-button>
      <el-button class="el-button--small" type="primary" @click="clearResarch">
        <i class="el-icon-refresh" />
        <span>重置</span>
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="serviceLogList" element-loading-text="Loading" :row-class-name="tableRowClassName" style="margin-top:10px" :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}">
      <el-table-column label="操作时间" width="200" align="left">
        <template slot-scope="scope">{{ scope.row.logTime }}</template>
      </el-table-column>
      <el-table-column label="操作员" width="200" align="left">
        <template slot-scope="scope">{{ scope.row.operator }}</template>
      </el-table-column>
      <el-table-column label="日志分类" width="200">
        <template slot-scope="scope">{{ getLogType(scope.row.logType) }}</template>
      </el-table-column>
      <el-table-column label="操作类型" width="200">
        <template slot-scope="scope">{{ getOperateType(scope.row.operateType) }}</template>
      </el-table-column>
      <el-table-column label="操作内容" align="left">
        <template slot-scope="scope">{{ scope.row.logContent }}</template>
      </el-table-column>
      <el-table-column label="操作状态" width="150" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.operateState === '0'" style="color:green;">成功</span>
          <span v-else style="color:red;">失败</span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="pager.total > 0"
      ref="pagelist"
      class="center"
      :current-page.sync="pager.pageNo"
      :page-size="pager.pageSize"
      :page-sizes="[5, 10, 15, 20, 30, 50, 100]"
      layout="total, sizes, prev, pager, next"
      :total="pager.total"
      style="text-align: center;margin-top: 10px;"
      @size-change="sizeChange"
      @current-change="currentChange"
    />
  </div>
</template>

<script>
import { getServiceLogList } from "@/api/api";
import { Message } from "element-ui";

export default {
  data() {
    return {
      listLoading: true,
      operator: "",
      logType: "",
      operateType: "",
      operateState: "",
      startTime: "",
      endTime: "",
      pager: {
        total: 0,
        pageNo: 1,
        pageSize: 10
      },
      serviceLogList: []
    };
  },
  created() {
    this.getServiceLogList();
  },
  methods: {
    /** 跳转页数 */
    currentChange() {
      this.getServiceLogList();
    },
    /** 选择每页显示条数 */
    sizeChange(size) {
      this.pager.pageNo = 1;
      this.pager.pageSize = size;
      this.getServiceLogList();
    },
    /** 获取serviceLog列表数据 */
    getServiceLogList() {
      if (this.startTime != "" && this.endTime != "") {
        let startTime = Date.parse(this.startTime);
        let endTime = Date.parse(this.endTime);
        if (startTime > endTime) {
          Message({
            message: "开始时间不能大于结束时间",
            type: "error",
            duration: 5 * 1000
          });
          return false;
        }
      }

      this.listLoading = true;
      let params = {
        operator: this.operator,
        logType: this.logType,
        operateType: this.operateType,
        operateState: this.operateState,
        startTime: this.startTime,
        endTime: this.endTime,
        pageNo: this.pager.pageNo,
        pageSize: this.pager.pageSize
      };
      let that = this;
      getServiceLogList(params).then(response => {
        that.serviceLogList = response.data.pageRecode;
        that.pager.pageNo = response.data
          ? +response.data.page
          : this.pager.pageNo;
        that.pager.pageSize = response.data
          ? +response.data.limit
          : this.pager.pageSize;
        that.pager.total = response.data ? +response.data.total : 0;
        that.listLoading = false;
      });
    },
    /** 重置查询条件 */
    sarchServiceLogList() {
      this.pager.pageNo = 1;
      this.getServiceLogList();
    },
    /** 重置查询条件 */
    clearResarch() {
      this.operator = "";
      this.logType = "";
      this.operateType = "";
      this.operateState = "";
      this.startTime = "";
      this.endTime = "";

      this.pager.pageNo = 1;
      this.getServiceLogList();
    },
    /** table行色差 */
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 0) {
        return "row-greyed";
      }
      return "";
    },
    getLogType(logType) {
      switch (logType) {
        case "1":
          return "Schema管理";
        case "2":
          return "用户管理";
        case "3":
          return "角色管理";
        case "4":
          return "角色权限配置";
        default:
          return "用户权限配置";
      }
    },
    getOperateType(operateType) {
      switch (operateType) {
        case "0":
          return "查询";
        case "1":
          return "新增";
        case "2":
          return "修改";
        default:
          return "删除";
      }
    },
    getOperateState(operateState) {
      switch (operateState) {
        case "0":
          return "成功";
        default:
          return "失败";
      }
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
</style>
