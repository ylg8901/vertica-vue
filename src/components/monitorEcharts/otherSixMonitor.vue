<template>
  <div
    id="otherSixMonitor"
    ref="otherSixMonitor"
  />
</template>

<script>
import { getOtherSixMonitor } from "@/api/api";
import shuaxin from "@/assets/images/shuaxin.png";

export default {
  data() {
    return {
      myChart: null
    };
  },

  created() {},
  mounted() {
    this.getOtherSixMonitor();
    // let myChart = this.$echarts.init(document.getElementById("otherSixMonitor"));
    // //设置echarts对象的option属性
    // myChart.setOption(this.option);
  },
  methods: {
    /** 获取会话使用情况监控 */
    getOtherSixMonitor() {
      this.listLoading = true;
      let that = this;
      getOtherSixMonitor({}).then(response => {
        let statisTimeArry = [];
        let tooManyPartitionArry = [];
        let tooManyProjectionArry = [];
        let unsegmentAllNodesArry = [];   
        let dVmore100MBArry = [];  
        let tooManyROSArry = [];  
        let skewedDataArry = [];
        statisTimeArry = response.data.statisTime;
        // if (statisTimeArry.length > 0) {
        //   statisTimeArry.forEach((res,index) => {
        //     statisTimeArry[index] = that.formatDate(res);
        //   })
        // }
        tooManyPartitionArry = response.data.tooManyPartition;
        tooManyProjectionArry = response.data.tooManyProjection;
        unsegmentAllNodesArry = response.data.unsegmentAllNodes;
        dVmore100MBArry = response.data.dVmore100MB;
        tooManyROSArry = response.data.tooManyROS;
        skewedDataArry = response.data.skewedData;
        let option = {
          title: {
            text: "最近一周其他指标数据监控"
          },
          tooltip: {
            trigger: "axis"
          },
          legend: {
            data: ["TooManyPartition", "TooManyProjection", "UnsegmentAllNodes", "DVmore100MB", "TooManyROS", "SkewedData"]
          },
          grid: {
            left: "3%",
            right: "3%",
            bottom: "3%",
            containLabel: true
          },
          toolbox: {
            show: true,
            feature: {
              // magicType: { show: true, type: ["line", "bar"] },
              // restore: { show: true },
              // saveAsImage: { show: true },
              myTool: { // 自定义方法 配置   我这是为了实现 饼图切换为柱状图
                  show: true,
                  title: '数据刷新',
                  icon: "image://" + shuaxin + "",
                  onclick: function (){
                    that.myChart.clear();
                    that.getOtherSixMonitor();
                  }
              }
            }
          },
          calculable: true,
          xAxis: [
            {
              type: "category",
              data: statisTimeArry
            }
          ],
          yAxis: [
            {
              type: "value"
            }
          ],
          series: [
            {
              name: "TooManyPartition",
              type: "bar",
              barGap: 0,
              data: tooManyPartitionArry,
              markPoint: {
                data: [
                  { type: "max", name: "Max" }
                ]
              }
            },
            {
              name: "TooManyProjection",
              type: "bar",
              data: tooManyProjectionArry,
              markPoint: {
                data: [
                  { type: "max", name: "Max" }
                ]
              }
            },
            {
              name: "UnsegmentAllNodes",
              type: "bar",
              data: unsegmentAllNodesArry,
              markPoint: {
                data: [
                  { type: "max", name: "Max" }
                ]
              }
            },
            {
              name: "DVmore100MB",
              type: "bar",
              data: dVmore100MBArry,
              markPoint: {
                data: [
                  { type: "max", name: "Max" }
                ]
              }
            },
            {
              name: "TooManyROS",
              type: "bar",
              data: tooManyROSArry,
              markPoint: {
                data: [
                  { type: "max", name: "Max" }
                ]
              }
            },
            {
              name: "SkewedData",
              type: "bar",
              data: skewedDataArry,
              markPoint: {
                data: [
                  { type: "max", name: "Max" }
                ]
              }
            }
          ]
        }
        that.myChart = that.$echarts.init(that.$refs.otherSixMonitor);
        //设置echarts对象的option属性
        that.myChart.setOption(option);
        that.listLoading = false;
        setTimeout(function (){
          window.addEventListener("resize",function(){
            that.myChart.resize();
          })
        },200)
      });
    }
  }
};
</script>

<style scoped>
#otherSixMonitor {
  width: 100%;
  height: 400px;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
}
</style>