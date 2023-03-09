<template>
  <div
    id="sessionsMonitor"
    ref="sessionsMonitor"
  />
</template>

<script>
import { getSessionsMonitor } from "@/api/api";
import shuaxin from "@/assets/images/shuaxin.png";
export default {
  data() {
    return {
      myChart: null
    };
  },

  created() {
  },
  mounted() {
    this.getSessionsMonitor();
  },
  methods: {
    /** 获取会话使用情况监控 */
    getSessionsMonitor() {
      this.listLoading = true;
      let that = this;
      getSessionsMonitor({}).then(response => {
        let nodeNameTmp = [];
        nodeNameTmp = response.data.nodeName
        let seriesDataTmp = [];
        nodeNameTmp.forEach((res,index) => {
          let dataTmp = { value: response.data.allCnt[index], name: res };
          seriesDataTmp.push(dataTmp);
        })
        let option = {
          title: {
            text: "节点会话使用监控"
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
              myTool: { // 自定义方法 配置   我这是为了实现 饼图切换为柱状图
                  show: true,
                  title: '数据刷新',
                  icon: "image://" + shuaxin + "",
                  onclick: function (){
                    that.myChart.clear();
                    that.getSessionsMonitor();
                  }
              }
            }
          },
          tooltip: {
            trigger: 'item'
          },
          legend: {
            data: nodeNameTmp,
            top: 'bottom'
          },
          series: [
            {
              name: '节点名称及会话数量',
              type: 'pie',
              radius: '70%',
              data: seriesDataTmp,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        }
        that.myChart = that.$echarts.init(that.$refs.sessionsMonitor);
        //设置echarts对象的option属性
        that.myChart.setOption(option);
        that.listLoading = false;
        setTimeout(function (){
          //监听
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
#sessionsMonitor {
  width: calc(25% - 10px);
  height: 410px;
  border-radius: 5px;
  border: 1px solid #dcdfe6;
  background: #ffffff;
}
</style>