import React from 'react'
import { connect } from 'react-redux'
import { Link } from "react-router-dom";
import { Menu, Icon } from 'antd';

const SubMenu = Menu.SubMenu;

class LeftMenu extends React.Component {

    render () {
        const { user } = this.props;
        return (
            <Menu mode="inline">
                <SubMenu key="sub1" title={<span><Icon type="folder" /><span>文件夹</span></span>}>
                    <Menu.Item key="1"><Link to="/folder/list">文件列表</Link></Menu.Item>
                </SubMenu>
                {
                    user && user.role && user.role.indexOf(['ROLE_ADMIN', 'ROLE_CAPITAL']) !== -1  ?
                    (
                        <SubMenu key="sub2" title={<span><Icon type="cloud" /><span>传输列表</span></span>}>
                            <Menu.Item key="1"><Link to="/transmission/uploading">正在上传</Link></Menu.Item>
                            <Menu.Item key="2"><Link to="/transmission/uploaded">已上传</Link></Menu.Item>
                        </SubMenu>
                    )
                    :
                    ('')
                }
            </Menu>
        )
    }
}

export default connect((state)=>{
    return { user: state.user } 
})(LeftMenu)