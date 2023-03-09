<template>
  <div
    class="app-container"
    style="background: rgb(242, 242, 242);height: calc(100% - 50px);"
  >
    <!-- 获取资源情况监控 -->
    <PoolUseMonitor style="margin-bottom: 10px;float: left;" />
    <!-- 获取节点监控 -->
    <NodesMonitor style="margin-bottom: 10px;margin-left: calc(75% + 10px);" />
    <!-- 获取资源排队监控 -->
    <ResourceQueues style="margin-bottom: 10px;float: left;" />
    <!-- 获取锁监控 -->
    <LocksMonitor style="margin-bottom: 10px;margin-left: calc(75% + 10px);" />
    <!-- 排队时长监控 -->
    <DcResourceAcquisitions style="margin-bottom: 10px;float: left;" />
    <!-- AHM/LGE监控 -->
    <AhmLgeMonitor style="margin-bottom: 10px;float: left;" />
    <!-- 获取会话监控 -->
    <SessionsMonitor style="margin-bottom: 10px;margin-left: calc(75% + 10px);" />
    <!-- 其他监控信息 -->
    <OtherSixMonitor style="margin-bottom: 10px;" />
    <!-- 资源占用top10 -->
    <Top10Sql style="margin-bottom: 10px;" />
  </div>
</template>

<script>
import AhmLgeMonitor from "@/components/monitorEcharts/ahmLgeMonitor";
import PoolUseMonitor from "@/components/monitorEcharts/poolUseMonitor";
import ResourceQueues from "@/components/monitorEcharts/resourceQueues";
import DcResourceAcquisitions from "@/components/monitorEcharts/dcResourceAcquisitions";
import SessionsMonitor from "@/components/monitorEcharts/sessionsMonitor";
import OtherSixMonitor from "@/components/monitorEcharts/otherSixMonitor";
import NodesMonitor from "@/components/monitorEcharts/nodesMonitor";
import LocksMonitor from "@/components/monitorEcharts/locksMonitor";
import Top10Sql from "@/components/monitorEcharts/top10Sql";

export default {
  name: "ServiceWork",
  components: {
    AhmLgeMonitor,
    PoolUseMonitor,
    ResourceQueues,
    DcResourceAcquisitions,
    SessionsMonitor,
    OtherSixMonitor,
    NodesMonitor,
    LocksMonitor,
    Top10Sql
  },
  data() {
    return {};
  },

  created() {
    let url = this.getnewurl();
    window.history.replaceState(null, null, url);
	},
  mounted() {},
  methods: {
    getnewurl() {
      var location = window.location.href;
      let url = location.split("?")[0];
      return url;
    }
  }
};
</script>

<style>
</style>
