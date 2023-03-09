<template>
  <div
    id="topSqlMonitor"
    ref="topSqlMonitor"
  >
    <label style="margin: 5px;line-height: 30px;color: #464646;font-size: large;">TOPSQL</label>
    <el-table
      v-loading="listLoading"
      :data="topSqlList"
      element-loading-text="Loading"
      :row-class-name="tableRowClassName"
      style="margin-top:10px"
      :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}"
    >
      <el-table-column
        label="STime"
        width="200"
      >
        <template slot-scope="scope">{{ formatDate(scope.row.STime) }}</template>
      </el-table-column>
      <el-table-column label="stx_id">
        <template slot-scope="scope">{{ scope.row.stx_id }}</template>
      </el-table-column>
      <el-table-column label="USER_NAME">
        <template slot-scope="scope">{{ scope.row.user_name }}</template>
      </el-table-column>
      <el-table-column label="MEMORY_ACQUIRED_MB">
        <template slot-scope="scope">{{ scope.row.memory_acquired }}</template>
      </el-table-column>
      <el-table-column label="REQUEST_DURATION">
        <template slot-scope="scope">{{ scope.row.request_duration }}</template>
      </el-table-column>
      <el-table-column label="CPU_CYCLES_MS">
        <template slot-scope="scope">{{ scope.row.cpu_cycles_ms }}</template>
      </el-table-column>
      <el-table-column
        label="THREAD_COUNT"
        width="150"
      >
        <template slot-scope="scope">{{ scope.row.thread_count }}</template>
      </el-table-column>
      <el-table-column
        label="IO_mb"
        width="100"
      >
        <template slot-scope="scope">{{ scope.row.io_mb }}</template>
      </el-table-column>
      <el-table-column label="SQL">
        <template slot-scope="scope">{{ scope.row.sql }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getTopSqlMonitor } from "@/api/api";
import { formatDate } from "@/utils/util";

export default {
  data() {
    return {
      listLoading: true,
      topSqlList: []
    };
  },

  created() {
  },
  mounted() {
    this.getTopSqlMonitor();
  },
  methods: {
    /** 获取serviceLog列表数据 */
    getTopSqlMonitor() {
      this.listLoading = true;
      let that = this;
      getTopSqlMonitor({}).then(response => {
        that.topSqlList = response.data.pageRecode;
        that.listLoading = false;
      });
    },
    /** table行色差 */
    tableRowClassName({ rowIndex }) {
      if (rowIndex % 2 === 0) {
        return "row-greyed";
      }
      return "";
    },
    formatDate(time) {
      let date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  }
};
</script>

<style scoped>
#topSqlMonitor {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
}
</style>