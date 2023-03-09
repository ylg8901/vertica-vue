<template>
  <div
    id="resourceQueues"
    ref="resourceQueues"
  />
</template>

<script>
import { getResourceQueues } from "@/api/api";
import shuaxin from "@/assets/images/shuaxin.png";
export default {
  data() {
    return {
      myChart: null
    };
  },
  created() {},
  mounted() {
    this.getResourceQueues();
    // let myChart = this.$echarts.init(document.getElementById("resourceQueues"));
    // //设置echarts对象的option属性
    // myChart.setOption(this.option);
  },
  methods: {
    /** 获取资源排队情况监控 */
    getResourceQueues() {
      this.listLoading = true;
      let that = this;
      getResourceQueues({}).then(response => {
        let resorurceQueuesList = [];
        let poolNameArry = [];
        let statisTimeArry = [];
        let showDataArry = [];

        resorurceQueuesList = response.data;
            
        resorurceQueuesList.forEach((res,index) => {
          poolNameArry.push(res.poolName);
          
          statisTimeArry = resorurceQueuesList[index].statisTime;
          // statisTimeArry.forEach((res,index) => {
          //   statisTimeArry[index]  = that.formatDate(res);
          // })
          let queueCntArry = [];
          queueCntArry = res.queueCnt;

          let queueCnt = {
            name: res.poolName,
            type: "line",
            // stack: "Total",
            areaStyle: {},
            emphasis: {
              focus: "series"
            },
            data: queueCntArry,
            markPoint: {
              data: [
                { type: "max", name: "Max" }
              ]
            }
          }
          showDataArry.push(queueCnt);
        })
        let option = {
          title: {
            text: "资源排队监控"
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross",
              label: {
                backgroundColor: "#6a7985"
              }
            }
          },
          legend: {
            top: 20,
            // right: 30,
            // left: 150,
            type: 'scroll',
            orient: 'horizontal', // vertical, horizontal
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
                    that.getResourceQueues();
                  }
              }
            }
          },
          xAxis: [
            {
              type: "category",
              boundaryGap: false,
              data: statisTimeArry
            }
          ],
          yAxis: [
            {
              type: "value"
            }
          ],
          series: showDataArry
        }
        that.myChart = that.$echarts.init(that.$refs.resourceQueues);
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
#resourceQueues {
  width: 75%;
  height: 200px;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
}
</style>