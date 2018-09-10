import React, { Component, Fragment } from 'react';
import qs from 'querystring';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Button, Table, Tooltip } from 'antd';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { toPer, calcSize, limitLength } from '../../utils/format';

const FormItem = Form.Item;
class Uploading extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }
    constructor() {
        super();
        this.state = {
            selectedRows: [],
        };
    }
    componentWillMount() {
        const { dispatch } = this.context.store;
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
            };
            dispatch({
                type: 'UPLOADING_FETCH',
                payload: values,
            });
        });
    };
    handleSelectRows = (key, rows) => {
        this.setState({
            selectedRows: rows,
        });
    };
    handleFormRemove = (record) => {
        // 删除
        const { dispatch } = this.context.store;
        const { selectedRows } = this.state;
        if (record.uid) {
            dispatch({
                type: 'UPLOADING_REMOVE',
                payload: {
                    uid: record.uid,
                },
            });
        }else if (selectedRows.length > 0) {
            dispatch({
                type: 'UPLOADING_REMOVE',
                payload: {
                    uid: selectedRows.map(row => row.uid).join(','),
                },
                callback: () => {
                    this.setState({
                        selectedRows: [],
                    });
                },
            });
        }
    };
    handleFormPause = (record) => {
        // 暂停
        const { dispatch } = this.props;
        const { selectedRows } = this.state;
        if (record.uid) {
            dispatch({
                type: 'UPLOADING_PAUSE',
                payload: {
                    uid: record.uid,
                },
            });
        } else if(selectedRows.length > 0) {
            selectedRows.forEach((v) => {
                dispatch({
                    type: 'UPLOADING_PAUSE',
                    payload: {
                        uid: v.uid,
                    },
                });
            });
        }
    };
    handleFormAresh = (record) => {
        // 重传
        const { dispatch } = this.props;
        const { selectedRows } = this.state;
        if (record.uid) {
            dispatch({
                type: 'UPLOADING_RESTART',
                payload: {
                    uid: record.uid,
                },
            });
        } else if(selectedRows.length > 0) {
            selectedRows.forEach((v) => {
                dispatch({
                    type: 'UPLOADING_RESTART',
                    payload: {
                        uid: v.uid,
                    },
                });
            });
        }
    };
    // 重置
    handleFormReset = () => {
        const { form, dispatch } = this.props;
        form.resetFields();
        dispatch({
            type: 'UPLOADING_FETCH',
            payload: {},
        });
    };
    renderForm() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row type="flex" justify="space-between" style={{paddingTop: 8,paddingBottom:8, paddingRight: 0}}>
                    <Col>
                        <Row type="flex" justify="start">
                            <FormItem label="文件名称" style={{ marginRight: 8 }}>
                                {getFieldDecorator('filename')(<Input />)}
                            </FormItem>
                            <Button type="primary" htmlType="submit" style={{ marginLeft: 8 }} shape="circle" icon="search" />
                            <Button type="primary" style={{ marginLeft: 8 }}  icon="reload" shape="circle"  onClick={this.handleFormReset} title="重置" />
                        </Row>
                    </Col>
                    <Col>
                        <Row type="flex" justify="end">
                            <Button type="primary" onClick={this.handleFormAresh} icon="sync" > 重传 </Button>
                            <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleFormPause} icon="pause"> 暂停 </Button>
                            <Button type="danger" style={{ marginLeft: 8 }} onClick={this.handleFormRemove} icon="delete"> 删除 </Button>
                        </Row>
                    </Col>
                </Row>
            </Form>
        );
    }
    render() {
        let { uploading: { data: { list } } } = this.props;
        list = list.filter((item)=>{
            return item.status !== '成功';
        })
        const { selectedRows } = this.state;
        const rowSelection = {
            selectedRows,
            onChange: this.handleSelectRows,
            getCheckboxProps: record => ({
                disabled: record.disabled,
            }),
        };
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
                dataIndex: 'url',
            },
            {
                title: '状态',
                dataIndex: 'percent',
                render: (text,record) => {
                    if(record.status === '失败' || record.status === '成功' || record.status === '暂停') {
                        return (<span>{record.status}</span>)
                    }
                    return (<span>{toPer(text)}</span>)
                },
            },
            {
                title: '操作',
                render: (text, record) => {
                    return (
                        <Fragment>
                            {
                                record.status === '上传中' ?
                                (<Button shape="circle" icon='pause' size="small" style={{marginRight: 10}} onClick={this.handleFormPause.bind(this, record)} />)
                                :
                                record.status === '失败' || record.status === '暂停' ?
                                (<Button shape="circle" icon='sync' size="small" style={{marginRight: 10}} onClick={this.handleFormAresh.bind(this, record)} />)
                                :
                                ''
                            }
                            <Button shape="circle" icon="close" size="small" onClick={this.handleFormRemove.bind(this, record)} />
                        </Fragment>
                    )
                },
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
                        dataSource={list}
                        rowKey='key'
                        rowSelection={rowSelection}
                        pagination={false}
                    />
                </Card>
            </div>
        );
    }
}
export default connect((state)=>{
    return Object.assign(
        {location: {query: qs.parse(state.router.location.search.replace(/^\?/,'')), ...state.router.location}},
        // ...state,
        {uploading: state.uploading},
        {user: state.user},
        // {loading: state.loading.models.folder},
    )
})(Form.create()(Uploading));
