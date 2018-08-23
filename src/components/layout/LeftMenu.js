import React from 'react'
import { Menu, Icon } from 'antd';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class LeftMenu extends React.Component {
    render () {
        return (
            <Menu mode="inline">
                <SubMenu key="sub1" title={<span><Icon type="mail" /><span>第一组</span></span>}>
                    <MenuItemGroup key="g1" title="第一项">
                        <Menu.Item key="1">第一条</Menu.Item>
                        <Menu.Item key="2">第二条</Menu.Item>
                    </MenuItemGroup>
                </SubMenu>
                <SubMenu key="sub2" title="第二组">
                    <Menu.Item key="3">第三条</Menu.Item>
                    <Menu.Item key="4">第四条</Menu.Item>
                </SubMenu>
            </Menu>
        )
    }
}

export default LeftMenu