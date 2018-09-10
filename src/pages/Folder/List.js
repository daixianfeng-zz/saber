import React, { Component, Fragment } from 'react';
import qs from 'querystring';
import moment from 'moment';
import { Table, Row, Col, Card, Form, Input, Button, DatePicker, Modal, message, Icon, Breadcrumb, Tooltip } from 'antd';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { push, replace } from 'connected-react-router'
import FileUpload from '../../components/FileUpload';
import Uploading from '../../components/Uploading';
import RemoveTips from '../../components/RemoveTips';
import { calcSize, limitLength } from '../../utils/format';

import './List.less';

const FormItem = Form.Item;
const getValue = obj =>
    Object.keys(obj)
        .map(key => obj[key])
        .join(',');

const CreateForm = Form.create()(props => {
    const { modalVisible, form, handleAdd, handleModalVisible } = props;
    const okHandle = () => {
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            form.resetFields();
            handleAdd(fieldsValue);
        });
    };
    const closeHandle =() =>{
        form.resetFields();
    }
    return (
        <Modal
            title="新建文件夹"
            visible={modalVisible}
            onOk={okHandle}
            onCancel={() => handleModalVisible()}
            afterClose={closeHandle}
        >
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="文件夹名">
                {form.getFieldDecorator('dirname', {
                    rules: [{ required: true }],
                })(<Input placeholder="请输入" />)}
            </FormItem>
        </Modal>
    );
});
const RenameForm = Form.create()(props => {
    const { modalVisibleRename, form, handleRename, handleModalRename } = props;
    const okHandle = () => {
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            form.resetFields();
            handleRename(fieldsValue);
        });
    };
    const closeHandle =() =>{
      form.resetFields();
    }
    return (
        <Modal
            title="重命名"
            visible={modalVisibleRename}
            onOk={okHandle}
            onCancel={() => handleModalRename()}
            afterClose={closeHandle}
        >
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="新名称">
                {form.getFieldDecorator('filename', {
                    rules: [{ required: true }],
                })(<Input placeholder="请输入" />)}
            </FormItem>
        </Modal>
    );
});

const uploads = {};
class List extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }
    constructor() {
        super();
        this.state = {
            modalVisible: false,
            modalVisibleRename:false,
            selectedRows: [],
            formValues: {},
            visible: false,
            singleSelectedRows: [],
        };
    }

    componentDidMount() {
        const { dispatch } = this.context.store;
        const { location } = this.props;
        dispatch({
            type: 'FOLDER_FETCH',
            payload : location.query ,
        });
        dispatch({
            type: 'UPLOADING_FETCH',
        });
    }
    handleModalVisible = flag => {
        this.setState({
            modalVisible: !!flag,
        });
    };
    handleModalRename = (flag, record) => {
        if (record && record.oid){
            this.setState({
                modalVisibleRename: !!flag,
                singleSelectedRows: record,
            });
        } else {
            this.setState({
                modalVisibleRename: !!flag,
            });
        }
    };

    handleStandardTableChange = (pagination, filtersArg, sorter) => {
        const { dispatch } = this.context.store;
        const { location } = this.props;
        const { formValues } = this.state;
        const oid = location.query ? location.query.oid||0 : 0;
        const filters = Object.keys(filtersArg).reduce((obj, key) => {
            const newObj = { ...obj };
            newObj[key] = getValue(filtersArg[key]);
            return newObj;
        }, {});
        const params = {
            page: pagination.current,
            pageSize: pagination.pageSize,
            oid,
            ...formValues,
            ...filters,
        };
        if (sorter.field) {
            params.sorter = `${sorter.field}_${sorter.order}`;
        }

        dispatch({
            type: 'FOLDER_FETCH',
            payload: params,
        });
    };
    handleSelectRows = rows => {
        this.setState({
            selectedRows: rows,
        });
    };
    // 重置
    handleFormReset = () => {
        const { form } = this.props;
        const { dispatch } = this.context.store;
        form.resetFields();
        this.setState({
            formValues: {},
        });
        dispatch({
            type: 'rule/fetch',
            payload: {},
        });
    };

    // 重命名
    handleRename = fields => {
        const { singleSelectedRows } = this.state;
        const { dispatch } = this.context.store;
        if(singleSelectedRows.oid) {
            dispatch({
                type: 'FOLDER_RENAME',
                payload: {
                    filename: fields.filename,
                    oid : singleSelectedRows.oid,
                },
                callback: () => {
                    if(!this.props.folder.errorInfo){
                        message.success('重命名成功');
                        this.setState({
                            modalVisibleRename: false,
                        });
                        dispatch({
                            type: 'folder/refresh',
                            payload : null,
                        });
                    }else{
                        message.error(this.props.folder.errorInfo.message || '重命名失败');
                    }
                },
            });
        }
    };
    // 下载
    handleDownload = (record) =>{
        if (record && record.oid && record.url){
            window.open(record.url);
        }
    }
    // 删除

    showModal () {
        const { selectedRows } = this.state;
        if (selectedRows.length === 0) return;
        this.setState({
            visible: true,
        });
    }
    handleCancel (){
      this.setState({
        visible: false,
      });
    }
    handleMenuClick = () => {
        const { dispatch } = this.context.store;
        const { selectedRows} = this.state;
        this.handleCancel();
        dispatch({
            type: 'FOLDER_REMOVE',
            payload: {
                oid: selectedRows.map(row => row.oid).join(','),
            },
            callback: () => {
                if(!this.props.folder.errorInfo){
                    message.success('删除成功');
                    this.setState({
                        selectedRows: [],
                    });
                    dispatch({
                        type: 'FOLDER_REFRESH',
                        payload : null,
                    });
                }else{
                    message.error(this.props.folder.errorInfo.message || '删除失败');
                }
            },
        });
    };
    //  查询
    handleSearch = e => {
        e.preventDefault();
        const { form } = this.props;
        const { dispatch } = this.context.store;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            this.setState({
              formValues: {
                startTime: fieldsValue.startTime ? fieldsValue.startTime.format('YYYY-MM-DD'): "",
                endTime: fieldsValue.endTime ? fieldsValue.endTime.format('YYYY-MM-DD') : "",
                filename: fieldsValue.filename ? fieldsValue.filename :'',
              },
            })
            dispatch(push('/folder/search?'+qs.stringify({
                    startTime: fieldsValue.startTime ? fieldsValue.startTime.format('YYYY-MM-DD'): "",
                    endTime: fieldsValue.endTime ? fieldsValue.endTime.format('YYYY-MM-DD') : "",
                    filename: fieldsValue.filename ? fieldsValue.filename :'',
                })
            ));
        });
    };

    // 添加
    handleAdd = fields => {
      const { dispatch } = this.context.store;
      const { location } = this.props;
      // const { page, pageSize } =this.state;
      let newFolder = {
        oid: 0,
        dirname: fields.dirname,
      };
      if(location.query && location.query.oid){
        newFolder = {
            ...newFolder,
            oid: location.query.oid,
        };
      }
      dispatch({
          type: 'FOLDER_ADD',
          payload: newFolder,
            callback:() =>{
                if(!this.props.folder.errorInfo){
                    message.success('添加成功');
                    this.setState({
                        modalVisible: false,
                    });
                    dispatch({
                        type: 'folder/refresh',
                        payload : null,
                    });
                }else{
                    message.error(this.props.folder.errorInfo.message || '添加失败');
                }
            },
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
        const { dispatch } = this.context.store;
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
        const { dispatch } = this.context.store;
        if (record.uid) {
            dispatch({
                type: 'UPLOADING_RESTART',
                payload: {
                    uid: record.uid,
                },
            });
        }
    };

    clickBtn = (record) => {
        const { dispatch } = this.context.store;
        dispatch(replace({
            pathname: 'folder/list',
            query: {
                oid: record.oid,
            },
        }));
        dispatch({
            type: 'FOLDER_FETCH',
            payload : {
                oid: record.oid,
            },
        });
    }
    renderAdvancedForm() {
        const { form: { getFieldDecorator }, folder: { data: { pFolder } } ,user} = this.props;
        const {visible} = this.state;
        const itemRender = (route) => {
            return route.breadcrumbName;
        }
        let rootName = (<strong>当前位置：文件夹 / </strong>);
        if(user && user.role){
            switch(user.role){
                case 'ROLE_CAPITAL': rootName = (<strong>当前位置：资金 / </strong>);break;
                case 'ROLE_ASSET': rootName = (<strong>当前位置：资产 / </strong>);break;
                default: break;
            }
        }
        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row type="flex" justify="start">
                    <FormItem label="名称" style={{ marginRight: 8 }}>
                        {getFieldDecorator('filename')(<Input placeholder="" />)}
                    </FormItem>
                    <FormItem label="上传时间" style={{ marginRight: 8 }}>
                    {getFieldDecorator('startTime')(
                        <DatePicker style={{ width: '100%' }} placeholder="开始时间" />
                    )}
                    </FormItem>
                    <FormItem label="至">
                    {getFieldDecorator('endTime')(
                        <DatePicker style={{ width: '100%' }} placeholder="结束时间" />
                    )}
                    </FormItem>
                    <Button type="primary" shape="circle" icon="search" htmlType="submit" style={{ marginLeft: 8 }} title="查询" />
                    <Button type="primary" shape="circle" icon="reload" onClick={this.handleFormReset} style={{ marginLeft: 8 }} title="重置" />
                </Row>
                <Row type="flex" justify="space-between" style={{paddingTop: 8,paddingBottom:8, paddingRight: 0}}>
                    <Col>
                        <Row type="flex" justify="start">
                            { rootName }
                            <Breadcrumb routes={pFolder} itemRender={itemRender} style={{marginLeft:8}} />
                        </Row>
                    </Col>
                    <Col>
                        {
                          user && user.role === 'ROLE_CAPITAL' ?
                          ('')
                          :
                          (<Row type="flex" justify="end"><Button icon="folder-add" type="primary" style={{ marginLeft: 8}} onClick={() => this.handleModalVisible(true)}> 新建文件夹</Button><FileUpload {...uploads} style={{ marginLeft: 8 }} location={this.props.location} /><RemoveTips style={{ marginLeft: 8 }}  removeClick={this.handleMenuClick} showModal={this.showModal.bind(this)} handleCancel={this.handleCancel.bind(this)} visible={visible} /></Row>)
                        }
                    </Col>
                </Row>
            </Form>
        );
    }

    renderForm() {
        return this.renderAdvancedForm();
    }
    render() {
        const { folder: { data: {dataList, page, perPage, totalSum} }, /*loading,*/ uploading: {list,tips} ,user} = this.props;
        const { selectedRows, modalVisible,modalVisibleRename } = this.state;
        const data = {
            list: dataList,
            pagination: {
                current: page,
                pageSize: perPage,
                total: Math.max(page*perPage-perPage+1, totalSum),
            },
        }
        const columns = [
            {
                title: '文件名',
                dataIndex: 'filename',
                render:(text, record) => {
                    if (record.type === 2 || record.type === 3 ) {
                        return (
                            <Tooltip placement="bottomRight" title={record.showname||text} overlayStyle={{wordWrap: 'break-word'}}>
                                <span className="curPointer" onClick={this.clickBtn.bind(this, record)}><Icon type="folder" /> {limitLength(record.showname||text)} </span>
                            </Tooltip>
                        );
                    }
                    return (
                        <Tooltip placement="bottomRight" title={text} overlayStyle={{wordWrap: 'break-word'}}>
                            <span className="curPointer"><Icon type="file-text" />{limitLength(text)}</span>
                        </Tooltip>
                    );
                },
            },
            {
                title: '大小',
                dataIndex: 'size',
                // render: val => `${val}`,
                render:(text,record) => {
                    if(record.size === 0) {
                        return  `— —`
                    }
                    return calcSize(record.size);
                },
            },
            {
                title: '上传时间',
                dataIndex: 'createTime',
                sorter: false,
                render: val => <span>{val?moment(val).format('YYYY-MM-DD HH:mm:ss'):''}</span>,
            },
            {
                title: '文件位置',
                dataIndex: 'pName',
            },
            {
                title:'',
                width: 200,
                render: (text, record) => {
                    if (record.type === 2 ){
                      return (
                        <Fragment>
                          {
                            user && user.role === 'ROLE_CAPITAL' ?
                            ('')
                            :
                            (<Button type="primary" key="remove" size="small" className="btnRight" onClick={() => this.handleModalRename(true,record)}>重命名</Button>)
                          }
                        </Fragment>
                      )
                    }else if(record.type === 1){
                      return (
                        <Fragment>
                          <Button style={{ marginRight: 8 }} type="primary" size="small" onClick={() => this.handleDownload(record)}>下载</Button>
                          {
                            user && user.role === 'ROLE_CAPITAL' ?
                            ('')
                            :
                            (<Button type="primary" key="remove" size="small"  className="btnRight" onClick={() => this.handleModalRename(true,record)}>重命名</Button>)
                          }
                        </Fragment>
                      )
                    }
                },
            },

        ];

        const parentMethods = {
            handleAdd: this.handleAdd,
            handleModalVisible: this.handleModalVisible,
        };
        const RenameMethods = {
            handleRename: this.handleRename,
            handleModalRename: this.handleModalRename,
        };
        return (
            <div>
                <Card bordered={false}>
                    <div className="tableList">
                        <div className="tableListForm">{this.renderForm()}</div>
                        <Table
                            selectedRows={selectedRows}
                            // loading={loading}
                            dataSource={data.list}
                            pagination={data.pagination}
                            columns={columns}
                            onSelectRow={this.handleSelectRows}
                            onChange={this.handleStandardTableChange}
                        />
                    </div>
                </Card>
                <CreateForm {...parentMethods} modalVisible={modalVisible} />
                <RenameForm {...RenameMethods} modalVisibleRename={modalVisibleRename} />
                {
                  user && user.role === 'ROLE_CAPITAL' ?
                  ('')
                  :
                  (<Uploading data={list} tips={tips} handleRemove={this.handleRemove.bind(this)} handlePause={this.handlePause.bind(this)} handleAresh={this.handleAresh.bind(this)} />)
                }
            </div>
        );
    }
}

export default connect((state)=>{
    return Object.assign(
        {location: {query: qs.parse(state.router.location.search.replace(/^\?/,'')), ...state.router.location}},
        // ...state,    
        {folder: state.folder},
        {uploading: state.uploading},
        {user: state.user},
        // {loading: state.loading.models.folder},
    )
})(Form.create()(List));
