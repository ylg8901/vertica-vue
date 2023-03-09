<template>
  <div
    id="locksMonitor"
    ref="locksMonitor"
  >
    <label style="margin: 5px;line-height: 30px;color: #464646;font-size: large;">锁资源使用情况监控</label>
    <div
      style="text-align: center; margin-top: 35px; font-size: x-large;font-weight: 700;cursor: pointer;"
      @click="openPoolLockDialog"
    >
      <div style="width: 33%;float: left;">
        <span>X 锁</span><br>
        <span style="font-size: xx-large; line-height: 100px;">{{ x_lock }}</span>
      </div>
      <div style="width: 33%;float: left;">
        <span>O 锁</span><br>
        <span style="font-size: xx-large; line-height: 100px;">{{ o_lock }}</span>
      </div>
      <div style="width: 33%;float: left;">
        <span>I 锁</span><br>
        <span style="font-size: xx-large; line-height: 100px;">{{ i_lock }}</span>
      </div>
    </div>
    <!-- 锁资源使用详情弹出窗口 -->
    <div
      v-if="poolLockDialogState"
      class="wmassageMask"
      @click="closePoolLockDialog"
    >
      <el-dialog
        id="poolLockDialog"
        v-dialogDrag
        class="editboxd"
        :modal="false"
        width="65%" 
        :lock-scroll="false"
        :close-on-click-modal="false"
        :visible.sync="poolLockDialogMessageShow"
        @close="poolLockDialogState=false"
      >
        <div
          slot="title"
          class="headers"
        >
          <u style="text-decoration: none;">
            <b style="color:#3a8ee6;">锁资源使用详情</b>
          </u>
        </div>
        <el-table
          ref="poolLockListTable"
          v-loading="listLoading"
          style="line-height: 0px;"
          max-height="350px"
          :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}"
          :data="poolLockList"
          element-loading-text="Loading"
          :row-class-name="tableRowClassName"
        >
          <el-table-column label="对象名称">
            <template slot-scope="scope">{{ scope.row.objectName }}</template>
          </el-table-column>
          <el-table-column label="事务号">
            <template slot-scope="scope">{{ scope.row.transactionID }}</template>
          </el-table-column>
          <el-table-column label="资源池名称">
            <template slot-scope="scope">{{ scope.row.poolName }}</template>
          </el-table-column>
          <el-table-column label="锁类型">
            <template slot-scope="scope">{{ scope.row.lockMode }}</template>
          </el-table-column>
          <el-table-column label="锁申请时间">
            <template slot-scope="scope">{{ scope.row.requestTS }}</template>
          </el-table-column>
          <el-table-column label="锁授予时间">
            <template slot-scope="scope">{{ scope.row.grantTS }}</template>
          </el-table-column>
          <el-table-column label="进入资源池排队时间">
            <template slot-scope="scope">{{ scope.row.qEntryTS }}</template>
          </el-table-column>
        </el-table>
        <div style="text-align: center;margin-top: 20px;">
          <el-button @click="poolLockDialogState=false">关闭</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getLocksMonitor, getLocksDetailInfo } from "@/api/api";

export default {
  data() {
    return {
      x_lock: 0,
      o_lock: 0,
      i_lock: 0,
      poolLockList: [],
      poolLockDialogState: false,
      poolLockDialogMessageShow: false
    };
  },

  created() {},
  mounted() {
    this.getLocksMonitor();
  },
  methods: {
    /** 获取会话使用情况监控 */
    getLocksMonitor() {
      this.listLoading = true;
      let that = this;
      getLocksMonitor({}).then(response => {
        let lockMonitorArry = [];
        lockMonitorArry = response.data;
        lockMonitorArry.forEach((res) => {
          if (res.lock_mode === 'X') {
            that.x_lock = res.count
          } else if (res.lock_mode === 'O') {
            that.o_lock = res.count
          } else if (res.lock_mode === 'I') {
            that.i_lock = res.count
          }
        })
      });
    },
    /** 打开故障节点详情窗口 */
    openPoolLockDialog() {
      this.poolLockDialogState = true;
      this.poolLockDialogMessageShow = true;
      this.getPoolLockDetail();
    },
    /** 获取故障节点详情 */
    getPoolLockDetail(){
      this.listLoading = true;
      let that = this;
      getLocksDetailInfo({}).then(response => {
        that.poolLockList = response.data;
        that.listLoading = false;
      });
    },
    /** 关闭故障节点详情窗口 */
    closePoolLockDialog(event) {
      let dom = document.getElementById("poolLockDialog");
      if (dom) {
        if (!dom.contains(event.target)) {
          // 这句是说如果我们点击到了id为child以外的区域
          this.poolLockDialogState = false;
          this.poolLockDialogMessageShow = false;
        }
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
#locksMonitor {
  width: calc(25% - 10px);
  height: 200px;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
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
//全局换行
.el-table {
  .cell {
    white-space: pre-wrap;
  }
}
.el-table .row-greyed {
  background-color: #fafafa;
}
</style>