<style>
  .query-form-btn {
    font-size: 0;
  }

  .query-form-btn > * {
    margin-right: .5rem;
  }
</style>
<template>
  <Row>
    <Form ref="localForm" :model="conditions" inline v-if="hasQuery">
      <slot name="before"/>
      <FormItem label="id" prop="id" :label-width="30" style="width: 14rem" v-if="queryById">
        <Input v-model="conditions.id" placeholder="输入查询的Id"/>
      </FormItem>
      <slot name="afterId"/>
      <FormItem label="状态" prop="status" :label-width="40" v-if="queryByStatus">
        <Select v-model="conditions.status" :value="0" style="width: 4.5rem;">
          <Option v-for="item in entityStatus" :value="item.status" :key="item.name">
            {{ item.name }}
          </Option>
        </Select>
      </FormItem>
      <slot name="afterStatus"/>
      <FormItem label="按创建时间查询" :label-width="100" v-if="queryByCreateTime">
        <Row>
          <Col span="11">
          <FormItem prop="createTimeStarted">
            <DatePicker v-model="conditions.createTimeStarted" type="datetime"
                        placeholder="起始时间"></DatePicker>
          </FormItem>
          </Col>
          <Col span="2" style="text-align: center">
          -</Col>
          <Col span="11">
          <FormItem prop="createTimeEnd">
            <DatePicker v-model="conditions.createTimeEnd" type="datetime"
                        placeholder="结束时间"></DatePicker>
          </FormItem>
          </Col>
        </Row>
      </FormItem>
      <slot name="afterCreateTime"/>
      <FormItem label="按更新时间查询" :label-width="100" v-if="queryByUpdateTime">
        <Row>
          <Col span="11">
          <FormItem prop="updateTimeStarted">
            <DatePicker v-model="conditions.updateTimeStarted" type="datetime"
                        placeholder="起始时间"></DatePicker>
          </FormItem>
          </Col>
          <Col span="2" style="text-align: center">
          -</Col>
          <Col span="11">
          <FormItem prop="updateTimeEnd">
            <DatePicker v-model="conditions.updateTimeEnd" type="datetime"
                        placeholder="结束时间"></DatePicker>
          </FormItem>
          </Col>
        </Row>
      </FormItem>
      <slot name="after"/>
    </Form>
    <Row v-if="hasQuery" class="query-form-btn" style="margin-bottom: 1rem;">
      <Button type="primary" @click="query">查询</Button>
      <Button type="primary" @click="reset">重置</Button>
      <slot name="btn"/>
    </Row>
  </Row>
</template>

<script>
  import BasicComponent from "@/tiny/components/basis/basic_component";

  export default {
    name: "QueryForm",
    extends: BasicComponent,
    props: {
      queryById: {
        type: Boolean,
        default: true,
        required: false
      },
      queryByStatus: {
        type: Boolean,
        default: true,
        required: false
      },
      queryByCreateTime: {
        type: Boolean,
        default: true,
        required: false
      },
      queryByUpdateTime: {
        type: Boolean,
        default: true,
        required: false
      }
    },
    computed: {
      hasQuery() {
        return this.queryById || this.queryByStatus || this.queryByCreateTime || this.queryByUpdateTime;
      }
    },
    data() {
      return {
        conditions: {
          id: "",
          status: "",
          createTimeStarted: "",
          createTimeEnd: "",
          updateTimeStarted: "",
          updateTimeEnd: ""
        }
      };
    },
    methods: {
      getConditions() {
        let conditions = this.conditions,
          copier = Object.create( null );

        if ( conditions.id ) {
          copier[ "id" ] = conditions.id;
        }

        if ( conditions.status ) {
          copier[ "status" ] = conditions.status;
        }

        if ( conditions.createTimeStarted instanceof Date ) {
          copier[ "createTimeStarted" ] = conditions.createTimeStarted.getTime();
        }

        if ( conditions.createTimeEnd instanceof Date ) {
          copier[ "createTimeEnd" ] = conditions.createTimeEnd.getTime();
        }

        if ( conditions.updateTimeStarted instanceof Date ) {
          copier[ "updateTimeStarted" ] = conditions.updateTimeStarted.getTime();
        }

        if ( conditions.updateTimeEnd instanceof Date ) {
          copier[ "updateTimeEnd" ] = conditions.updateTimeEnd.getTime();
        }

        return copier;
      },
      init( conditions ) {
        if ( !conditions ) {
          return;
        }

        let localConditions = this.conditions;
        if ( conditions.id ) {
          localConditions.id = conditions.id;
        }

        if ( conditions.status ) {
          localConditions.status = conditions.status;
        }

        if ( conditions.createTimeStarted instanceof Number ) {
          localConditions.createTimeStarted = new Date( conditions.createTimeStarted );
        }

        if ( conditions.createTimeEnd instanceof Number ) {
          localConditions.createTimeEnd = new Date( conditions.createTimeEnd );
        }

        if ( conditions.updateTimeStarted instanceof Date ) {
          localConditions.updateTimeStarted = new Date( conditions.updateTimeStarted );
        }

        if ( conditions.updateTimeEnd instanceof Date ) {
          localConditions.updateTimeEnd = new Date( conditions.updateTimeEnd );
        }
      },
      reset() {
        this.$refs[ "localForm" ].resetFields();
        this.$emit( "on-reset" );
      },
      query() {
        this.$emit( "on-query", this.getConditions() )
      }
    }
  };
</script>