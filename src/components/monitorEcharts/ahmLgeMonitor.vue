<template>
  <div
    id="ahmLgeMonitor"
    ref="ahmLgeMonitor"
  />
</template>

<script>
import { getAhmLgeMonitor } from "@/api/api";
import shuaxin from "@/assets/images/shuaxin.png";

export default {
  data() {
    return {
      myChart: null
    };
  },

  created() {},
  mounted() {
    this.getAhmLgeMonitor();
    // let myChart = this.$echarts.init(document.getElementById("ahmLgeMonitor"));
    // //设置echarts对象的option属性
    // myChart.setOption(this.option);
  },
  methods: {
    /** 获取会话使用情况监控 */
    getAhmLgeMonitor() {
      this.listLoading = true;
      let that = this;
      getAhmLgeMonitor({}).then(response => {
        let dsArry = [];    
        let ahmArry = [];    
        let lgeArry = [];
        dsArry = response.data.statisTime;
        // dsArry.forEach((res,index) => {
        //   dsArry[index] = that.formatDate(res);
        // })
        ahmArry = response.data.ahm
        lgeArry = response.data.lge
        let option = {
          title: {
            text: "AHM推进情况、LGE监控"
          },
          tooltip: {
            trigger: "axis"
          },
          legend: {
            data: ["AHM推进情况", "LGE监控"]
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
                    that.getAhmLgeMonitor();
                  }
              }
            }
          },
          calculable: true,
          xAxis: [
            {
              type: "category",
              data: dsArry
            }
          ],
          yAxis: [
            {
              type: "value"
            }
          ],
          series: [
            {
              name: "AHM推进情况",
              type: "bar",
              barGap: 0,
              data: ahmArry,
              markPoint: {
                data: [
                  { type: "max", name: "Max" }
                ]
              }
            },
            {
              name: "LGE监控",
              type: "bar",
              data: lgeArry,
              markPoint: {
                data: [
                  { type: "max", name: "Max" }
                  // { name: "Max", value: 182.2, xAxis: 7, yAxis: 183 }
                ]
              }
            }
          ]
        }
        that.myChart = that.$echarts.init(that.$refs.ahmLgeMonitor);
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
#ahmLgeMonitor {
  width: 75%;
  height: 200px;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
}
</style>