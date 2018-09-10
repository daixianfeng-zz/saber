import React, { Component, Fragment } from 'react';
import { Button,Table,Tooltip} from 'antd';
import './index.less';
import {calcSize,toPer,limitLength} from '../../utils/format';

export default class UploadingProgress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            flag: false,
            tips: '',
            completeSum: 0,
        };
    }
    componentWillReceiveProps (nextProps) {
        if(nextProps.data && nextProps.data.length > 0) {
            let completeNum = 0;
            let newFlag = this.state.flag;
            nextProps.data.forEach(item => {
                if(item.status === '成功'){
                    completeNum+=1;
                }
            });
            if(nextProps.data.length > this.state.list.length){
                newFlag = true;
            }
            this.setState({
                list: nextProps.data || [],
                tips: nextProps.tips,
                completeSum: completeNum,
                flag: newFlag,
            });
        }else{
            this.setState({
                tips: nextProps.tips,
            });
        }
    }
    showTableList () {
        this.setState({
            flag:true,
        })
    }
    hideTableList () {
        this.setState({
            flag:false,
        })
    }
    render() {
        const { list, flag , tips, completeSum } = this.state;
        const {handleRemove, handlePause, handleAresh } = this.props;
        const columns = [
            {
                title: '文件名称',
                dataIndex: 'filename',
                width: 150,
                render: (text) => (
                    <Tooltip placement="bottomRight" title={text} overlayStyle={{wordWrap: 'break-word'}}>
                        <span>{limitLength(text, 7)}</span>
                    </Tooltip>
                ),
            },
            {
                title: '文件大小',
                dataIndex: 'size',
                width: 100,
                render: val => <span>{calcSize(val)}</span>,
            },
            {
                title: '文件目录',
                dataIndex: 'url',
                align: 'center',
                width: 150,
            },
            {
                title: '状态',
                width: 100,
                dataIndex: 'percent',
                render: (text,record) => {
                    if(record.status === '失败' || record.status === '成功' || record.status === '暂停') {
                        return (<span>{record.status}</span>)
                    }
                    return (<span>{toPer(text)}</span>)
                },
            },
            {
                width: 130,
                render: (text, record) => (
                    <Fragment>
                        {
                            record.status === '上传中' ? 
                            (<Button shape="circle" size="small" icon='pause' style={{marginRight: 10}} onClick={handlePause.bind(this, record)} />)
                            :
                            record.status === '失败' || record.status === '暂停' ? 
                            (<Button shape="circle" size="small" icon='sync' style={{marginRight: 10}} onClick={handleAresh.bind(this, record)} />)
                            :
                            ''
                        }
                        <Button shape="circle" size="small" icon="close" onClick={handleRemove.bind(this,record)} />
                    </Fragment>
                ),
            },
        ]
        return (
            <div className="container">
                {
                    flag && (
                        <div className="tablebox">
                            <header className="header">
                                <span>正在上传（{completeSum}/{list.length}）</span>
                                <Button size="small" icon="down" className="minusBtn" onClick={this.hideTableList.bind(this)} />
                            </header>
                            <Table 
                                dataSource={list}
                                pagination={false}
                                columns={columns}
                                style={{marginBottom: '10px', minHeight: '200px', maxHeight: '400px', overflowY: 'auto'}}
                            />
                        </div>
                    )
                }
                <div className="content">
                    <span>{tips}</span>
                    <Button size="small" icon="up" className="plusBtn" onClick={this.showTableList.bind(this)} />
                </div>
            </div>
        );
    }
}