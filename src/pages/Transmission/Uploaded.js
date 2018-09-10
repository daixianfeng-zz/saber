import React, { Component } from 'react';
import qs from 'querystring';
import moment from 'moment';
import { Row, Card, Form, Input, Button, DatePicker, Table,Tooltip} from 'antd';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import UploadingProgress from '../../components/Uploading';
import { calcSize, limitLength } from '../../utils/format';
import './index.less';

const FormItem = Form.Item;
const getValue = obj =>
    Object.keys(obj)
        .map(key => obj[key])
        .join(',');
class Uploaded extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }
    constructor() {
        super();
        this.state = {
            formValues: {},
        };
    }
    componentWillMount() {
        const { dispatch } = this.context.store;
        dispatch({
            type: 'HISTORY_FETCH',
        });
        dispatch({
            type: 'UPLOADING_FETCH',
        });
    }
    handleSearch = e => {
        e.preventDefault();
        const { dispatch } = this.context.store;
        const { form } = this.props;

        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = {
                filename: fieldsValue.filename,
                startTime: fieldsValue.startTime ? fieldsValue.startTime.format('YYYY-MM-DD'): "",
                endTime: fieldsValue.endTime ? fieldsValue.endTime.format('YYYY-MM-DD') : "",
            };
            this.setState({
                formValues: values,
            });
            dispatch({
                type: 'HISTORY_FETCH',
                payload: values,
            });
        });
    };
    handleStandardTableChange = (pagination, filtersArg, sorter) => {
        const { dispatch } = this.context.store;
        const { formValues } = this.state;
        const filters = Object.keys(filtersArg).reduce((obj, key) => {
            const newObj = { ...obj };
            newObj[key] = getValue(filtersArg[key]);
            return newObj;
        }, {});
        const params = {
            page: pagination.current,
            pageSize: pagination.pageSize,
            ...formValues,
            ...filters,
        };
        if (sorter.field) {
            params.sorter = `${sorter.field}_${sorter.order}`;
        }
        dispatch({
            type: 'HISTORY_FETCH',
            payload: params,
        });
    };
    handleFormReset = () => {
        // 重置
        const { dispatch } = this.context.store;
        const { form } = this.props;
        form.resetFields();
        this.setState({
            formValues: {},
        });
        dispatch({
            type: 'HISTORY_FETCH',
            payload: {},
        });
    };

    handleRemove = (record) => {
        // 删除
        const { dispatch } = this.context.store;
        dispatch({
            type: 'UPLOADING_REMOVE',
            payload: {
                uid: record.uid,
            },
        });
    };
    handlePause = (record) => {
        // 暂停
        const {dispatch} = this.context.store;
        if (record.uid) {
            dispatch({
                type: 'UPLOADING_PAUSE',
                payload: {
                    uid: record.uid,
                },
            });
        }
    };
    handleAresh = (record) => {
      // 重传
      const {dispatch} = this.context.store;
      if (record.uid) {
          dispatch({
              type: 'UPLOADING_RESTART',
              payload: {
                  uid: record.uid,
              },
          });
      }
    };
    renderForm() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row type="flex" justify="start" style={{paddingTop: 8,paddingBottom:8, paddingRight: 0}}>
                    <FormItem label="文件名称" style={{ marginRight: 8 }}>
                        {getFieldDecorator('filename')(<Input placeholder="请输入" />)}
                    </FormItem>
                    <FormItem label="上传时间" style={{ marginRight: 8 }}>
                        {getFieldDecorator('startTime')(
                            <DatePicker style={{ width: '100%' }} placeholder="开始时间" />
                        )}
                    </FormItem>
                    <FormItem label="至" style={{ marginRight: 8 }}>
                        {getFieldDecorator('endTime')(
                            <DatePicker style={{ width: '100%' }} placeholder="结束时间" />
                        )}
                    </FormItem>
                    <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }} shape="circle" icon="search" />
                    <Button type="primary" style={{ marginLeft: 8 }} shape="circle" icon="reload" onClick={this.handleFormReset} />
                </Row>
            </Form>
        );
    }
    render() {
        const { history: { data: { dataList, pagination } }, /*loading,*/ uploading: {list,tips} } = this.props;
        const paginationProps = {
            current: pagination.page,
            total: pagination.totalSum,
            pageSize: pagination.prePage,
            
        }
        const columns = [
            {
                title: '文件名',
                dataIndex: 'filename',
                render: (text) => (
                    <Tooltip placement="bottomRight" title={text} overlayStyle={{wordWrap: 'break-word'}}>
                        <span>{limitLength(text, 10)}</span>
                    </Tooltip>
                ),
            },
            {
                title: '大小',
                dataIndex: 'size',
                render: val => <span>{calcSize(val)}</span>,
            },
            {
                title: '上传时间',
                dataIndex: 'createTime',
                render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
            },
            {
                title: '上传位置',
                dataIndex: 'pName',
            },
            {
                title: '上传者',
                dataIndex: 'uploadUsername',
            },
        ];
        return (
            <div>
                <Card bordered={false}>
                    <div className="tableList">
                        <div className="tableListForm">{this.renderForm()}</div>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={dataList}
                        pagination={paginationProps}
                        onChange={this.handleStandardTableChange}
                        // loading={loading}
                        rowKey='key'
                    />
                </Card>
                <UploadingProgress
                    data={list}
                    tips={tips}
                    handleRemove={this.handleRemove.bind(this)}
                    handlePause={this.handlePause.bind(this)}
                    handleAresh={this.handleAresh.bind(this)}
                />
            </div>
        );
    }
}

export default connect((state)=>{
    return Object.assign(
        {location: {query: qs.parse(state.router.location.search.replace(/^\?/,'')), ...state.router.location}},
        // ...state,
        {history: state.history},
        {uploading: state.uploading},
        {user: state.user},
        // {loading: state.loading.models.folder},
    )
})(Form.create()(Uploaded));