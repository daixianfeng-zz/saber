import { Modal, Button } from 'antd';
import React from 'react';

export default class RemoveTips extends React.Component {
  state = {
    ModalText: '是否删除文件夹或文件和内容',
    confirmLoading: false,
  }
  render() {
    const { confirmLoading, ModalText } = this.state;
    const {removeClick, showModal, visible ,handleCancel} = this.props;
    return (
      <div style={{'display': 'inline-flex'}}>
        <Button type="danger" onClick={showModal} style={{ marginLeft: 8 }} icon="delete">删除</Button>
        <Modal
          visible={visible}
          onOk={removeClick}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
        >
          <p>{ModalText}</p>
        </Modal>
      </div>
    );
  }
}
