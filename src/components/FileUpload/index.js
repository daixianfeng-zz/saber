import React, { Component } from 'react';
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Upload, Icon, Button, message } from 'antd';

import request from '../../utils/request';
import { apiError } from '../../utils/common';
import oss from '../../utils/oss';

class FileUpload extends Component {
    static contextTypes = {
        store: PropTypes.object.isRequired,
    }
    render() {
        const { store } = this.context;
        const dispatch = store.dispatch;
        const { location } = this.props;
        let newFile = {
            oid: 0,
        };
        if(location.query && location.query.oid){
            newFile = {
                ...newFile,
                oid: location.query.oid,
            };
        }
        const customRequest = ({
            file,
        }) => {
            const uploadToOss = (signData) => {
                oss.upload(dispatch, file, signData)
            };
            request.send({
                url: '/storage/file/edit/upload.json',
                method: 'POST',
                body: {
                    ...newFile,
                    filename: file.name,
                },
            }).then((res) => {
                if(!apiError(res)){
                    const signData = {
                        OSSAccessKeyId: res.data.accessid,
                        callbackBody: res.data.callbackBody,
                        callbackUrl: res.data.callbackUrl,
                        dir: res.data.dir,
                        expire: res.data.expire,
                        policy: res.data.policy,
                        signature: res.data.signature,
                        poidName: res.data.poidName,
                        poid: res.data.poid,
                        realName: res.data.realName,
                    };
                    uploadToOss(signData);
                }else{
                    message.error(res.message);
                }
            }).catch(() => {

            });
        };
        const defaultProps = {
            name: 'file',
            action: '',
            data: {},
            headers: {},
            customRequest,
            onStart: () => {},
            onProgress: () => {},
            onSuccess: () => {},
            onError: () => {},
        };
        const props = Object.assign(defaultProps, this.props);
        return (
            <div style={{'display': 'inline-flex'}}>
                <Upload {...props}>
                    <Button type="primary">
                        <Icon type="upload" />上传
                    </Button>
                </Upload>
            </div>
        );
    }
}
export default connect((state)=>{ return { location: state.router.location } })(FileUpload)