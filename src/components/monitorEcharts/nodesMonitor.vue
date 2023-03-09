<template>
  <div
    id="nodesMonitor"
    ref="nodesMonitor"
  >
    <label style="margin: 5px;line-height: 30px;color: #464646;font-size: large;">集群节点状态监控</label>
    <div style="text-align: center; margin-top: 50px; font-size: x-large;font-weight: 700;">
      <div style="width: 25%;float: left;">
        <span>UP</span><br>
        <span style="font-size: xx-large; line-height: 130px;">{{ upNum }}</span>
      </div>
      <div style="width: 43%;float: left;">
        <span>STANDBY</span><br>
        <span style="font-size: xx-large; line-height: 130px;">{{ standbyNum }}</span>
      </div>
      <div
        style="width: 32%;float: left;cursor: pointer;"
        @click="openDownNodeDialog"
      >
        <span>DOWN</span><br>
        <span
          style="font-size: xx-large; line-height: 130px;"
          :style="downNum > 0 ? 'color: red;' : ''"
        >{{ downNum }}</span>
      </div>
    </div>
    <!-- 集群故障节点详情弹出窗口 -->
    <div
      v-if="downNodeDialogState"
      class="wmassageMask"
      @click="closeDownNodeDialog"
    >
      <el-dialog
        id="downNodeDialog"
        v-dialogDrag
        class="editboxd"
        :modal="false"
        width="50%" 
        :lock-scroll="false"
        :close-on-click-modal="false"
        :visible.sync="downNodeDialogMessageShow"
        @close="downNodeDialogState=false"
      >
        <div
          slot="title"
          class="headers"
        >
          <u style="text-decoration: none;">
            <b style="color:#3a8ee6;">集群故障节点详情</b>
          </u>
        </div>
        <el-table
          ref="downNodeListTable"
          v-loading="listLoading"
          style="line-height: 0px;"
          max-height="350px"
          :header-cell-style="{'background-color':'#93A3AD','color':'#FFFFFF'}"
          :data="downNodeList"
          element-loading-text="Loading"
          :row-class-name="tableRowClassName"
        >
          <el-table-column label="节点名称">
            <template slot-scope="scope">{{ scope.row.node_name }}</template>
          </el-table-column>
          <el-table-column label="节点IP">
            <template slot-scope="scope">{{ scope.row.node_address }}</template>
          </el-table-column>
          <el-table-column label="节点状态">
            <template slot-scope="scope">{{ scope.row.node_state }}</template>
          </el-table-column>
          <el-table-column
            label="故障前最后消息"
            width="250"
          >
            <template slot-scope="scope">{{ scope.row.last_msg_from_node_at }}</template>
          </el-table-column>
        </el-table>
        <div style="text-align: center;margin-top: 20px;">
          <el-button @click="downNodeDialogState=false">关闭</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { getNodesMonitor, getNodesDetailInfo } from "@/api/api";

export default {
  data() {
    return {
      upNum: 0,
      standbyNum: 0,
      downNum: 0,
      downNodeList: [],
      downNodeDialogState: false,
      downNodeDialogMessageShow: false
    };
  },

  created() {},
  mounted() {
    this.getNodesMonitor();
  },
  methods: {
    /** 获取会话使用情况监控 */
    getNodesMonitor() {
      this.listLoading = true;
      let that = this;
      getNodesMonitor({}).then(response => {
        let nodeMonitorArry = [];
        nodeMonitorArry = response.data;
        nodeMonitorArry.forEach((res) => {
          if (res.node_state === 'UP') {
            that.upNum = res.node_count
          } else if (res.node_state === 'STANDBY') {
            that.standbyNum = res.node_count
          } else if (res.node_state === 'DOWN') {
            that.downNum = res.node_count
          }
        })
      });
    },
    /** 打开故障节点详情窗口 */
    openDownNodeDialog() {
      this.downNodeDialogState = true;
      this.downNodeDialogMessageShow = true;
      this.getDownNodeDetail();
    },
    /** 获取故障节点详情 */
    getDownNodeDetail(){
      this.listLoading = true;
      let that = this;
      getNodesDetailInfo({}).then(response => {
        that.downNodeList = response.data;
        that.listLoading = false;
      });
    },
    /** 关闭故障节点详情窗口 */
    closeDownNodeDialog(event) {
      let dom = document.getElementById("downNodeDialog");
      if (dom) {
        if (!dom.contains(event.target)) {
          // 这句是说如果我们点击到了id为child以外的区域
          this.downNodeDialogState = false;
          this.downNodeDialogMessageShow = false;
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
#nodesMonitor {
  width: calc(25% - 10px);
  height: 250px;
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