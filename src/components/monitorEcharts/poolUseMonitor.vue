<template>
  <div
    id="poolUseMonitorMain"
    ref="poolUseMonitorMain"
  >
    <label style="margin: 5px;line-height: 30px;color: #464646;font-size: large;">资源使用情况监控</label>
    <label style="margin: 0px 5px 0px 0px; line-height: 30px; color: rgb(70, 70, 70); float: right; font-size: 14px;">
      平均值：总并发-{{ totalConcurrencyAverage }}, 运行量-{{ runingCountAverage }}, 总内存(GB)-{{ totalMemoryAverage }}, 已使用(GB)-{{ inuseAverage }}
      <span style="margin-left: 50px;font-weight: normal;">显示最近：</span>
      <el-radio-group
        v-model="showTimeLength"
        @change="selectedShowTimeFn"
      >
        <el-radio label="1">24小时</el-radio>
        <el-radio label="2">48小时</el-radio>
        <el-radio label="3">72小时</el-radio>
      </el-radio-group>
    </label>
    <div
      id="poolUseMonitor"
      ref="poolUseMonitor"
    />
  </div>
</template>

<script>
import { getPoolsMonitor } from "@/api/api";
import shuaxin from "@/assets/images/shuaxin.png";

export default {
  data() {
    return {
      myChart: null,
      totalConcurrencyAverage: 0,
      runingCountAverage: 0,
      totalMemoryAverage: 0,
      inuseAverage: 0,
      showTimeLength: "1"
    };
  },

  created() {},
  mounted() {
    this.getPoolsMonitor();
    // let myChart = this.$echarts.init(document.getElementById("poolUseMonitor"));
    // //设置echarts对象的option属性
    // myChart.setOption(this.option);
  },
  methods: {
    selectedShowTimeFn(){
      this.myChart.clear();
      this.getPoolsMonitor();
    },
    /** 获取会话使用情况监控 */
    getPoolsMonitor() {
      this.listLoading = true;
      let params = {
        showTimeLength: this.showTimeLength
      };
      let that = this;
      getPoolsMonitor(params).then(response => {
        let dsArry = [];    
        let totalConcurrencyArry = [];    
        let runingCountArry = [];
        let totalMemoryArry = [];    
        let inuseArry = [];
        dsArry = response.data.statis_time;
        // if (dsArry !== null) {
        //   dsArry.forEach((res,index) => {
        //     dsArry[index] = that.formatDate(res);
        //   })
        // }
        
        totalConcurrencyArry = response.data.total_concurrency;
        if (totalConcurrencyArry !== null) {
          let totalConcurrencySum = 0;
          totalConcurrencyArry.forEach((res) => {
            totalConcurrencySum += res;
          })
          that.totalConcurrencyAverage = parseFloat(totalConcurrencySum / totalConcurrencyArry.length).toFixed(2);
        }
        
        runingCountArry = response.data.runing_count;
        if (runingCountArry !== null) {
          let runingCountSum = 0;
          runingCountArry.forEach((res) => {
            runingCountSum += res;
          })
          that.runingCountAverage = parseFloat(runingCountSum / runingCountArry.length).toFixed(2);
        }

        totalMemoryArry = response.data.total_memory_GB;
        if (totalMemoryArry !== null) {
          let totalMemorySum = 0;
          totalMemoryArry.forEach((res) => {
            totalMemorySum += res;
          })
          that.totalMemoryAverage = parseFloat(totalMemorySum / totalMemoryArry.length).toFixed(2);
        }
        
        inuseArry = response.data.inuse_GB;
        if (inuseArry !== null) {
          let inuseSum = 0;
          inuseArry.forEach((res) => {
            inuseSum += res;
          })
          that.inuseAverage = parseFloat(inuseSum / inuseArry.length).toFixed(2);
        }
        
        let option = {
          // title: {
          //   text: "资源使用情况监控"
          // },
          tooltip: {
            trigger: "axis"
          },
          legend: {
            data: ["总并发", "运行量", "总内存(GB)", "已使用(GB)"]
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
                    that.showTimeLength = "1";
                    that.myChart.clear();
                    that.getPoolsMonitor();
                  }
              }
            }
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: dsArry
          },
          yAxis: {
            type: "value"
          },
          series: [
            {
              name: "总并发",
              type: "line",
              // stack: "Total",
              data: totalConcurrencyArry,
              markPoint: {
                data: [
                  { type: "max", name: "最大值" }
                ]
              }
            },
            {
              name: "运行量",
              type: "line",
              // stack: "Total",
              data: runingCountArry,
              markPoint: {
                data: [
                  { type: "max", name: "最大值" }
                ]
              }
            },
            {
              name: "总内存(GB)",
              type: "line",
              // stack: "Total",
              data: totalMemoryArry,
              markPoint: {
                data: [
                  { type: "max", name: "最大值" }
                ]
              }
            },
            {
              name: "已使用(GB)",
              type: "line",
              // stack: "Total",
              data: inuseArry,
              markPoint: {
                data: [
                  { type: "max", name: "最大值" }
                ]
              }
            }
          ]
        }
        // var chart = echarts.init(dom, 'dark');
        that.myChart = that.$echarts.init(that.$refs.poolUseMonitor);
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
#poolUseMonitorMain {
  width: 75%;
  height: 250px;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
}
#poolUseMonitor {
  /* width: 75%; */
  height: 200px;
  /* border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff; */
}
</style>