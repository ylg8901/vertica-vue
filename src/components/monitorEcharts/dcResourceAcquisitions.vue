<template>
  <div
    id="dcResourceAcquisitions"
    ref="dcResourceAcquisitions"
  />
</template>

<script>
import { getDcResourceAcquisitions } from "@/api/api";
import shuaxin from "@/assets/images/shuaxin.png";

export default {
  data() {
    return {
      myChart: null
    };
  },

  created() {},
  mounted() {
    this.getDcResourceAcquisitions();
    // let myChart = this.$echarts.init(document.getElementById("dcResourceAcquisitions"));
    // //设置echarts对象的option属性
    // myChart.setOption(this.option);
  },
  methods: {
    /** 获取资源排队时长情况监控 */
    getDcResourceAcquisitions() {
      this.listLoading = true;
      let that = this;
      getDcResourceAcquisitions({}).then(response => {
        let dcResourceAcquisitionsList = [];
        let poolNameArry = [];
        let statisTimeArry = [];
        let showDataArry = [];

        dcResourceAcquisitionsList = response.data;
        dcResourceAcquisitionsList.forEach((res,index) => {
          poolNameArry.push(res.poolName);
          
          statisTimeArry = dcResourceAcquisitionsList[index].statisTime;
          // statisTimeArry.forEach((res,index) => {
          //   statisTimeArry[index]  = that.formatDate(res);
          // })
          let averageWaitArry = [];
          averageWaitArry = res.averageWait;

          let averageWait = {
            name: res.poolName,
            type: "line",
            // stack: "Total",
            data: averageWaitArry,
            markPoint: {
              data: [
                { type: "max", name: "Max" }
              ]
            }
          }
          showDataArry.push(averageWait);
        })

        let option = {
          title: {
            text: "资源排队时长监控"
          },
          tooltip: {
            trigger: "axis"
          },
          legend: {
            top: 20,
            type: 'scroll',
            orient: 'horizontal', // vertical
            data: poolNameArry
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
                    that.getDcResourceAcquisitions();
                  }
              }
            }
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: statisTimeArry
          },
          yAxis: {
            type: "value"
          },
          series: showDataArry
        }
        that.myChart = that.$echarts.init(that.$refs.dcResourceAcquisitions);
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
#dcResourceAcquisitions {
  width: 75%;
  height: 200px;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
}
</style>