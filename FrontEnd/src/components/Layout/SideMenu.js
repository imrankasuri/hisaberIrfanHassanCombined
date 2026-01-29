import React, { useState } from 'react';
import {
    DashboardOutlined,
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { NavLink } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}
const items = [
    getItem(<NavLink to="/dashboard">Dashboard</NavLink>, '0', <DashboardOutlined />),
    getItem('Accounts', '1', <TeamOutlined />, [
        getItem(<NavLink to="/accounts/manage">Manage Accounts</NavLink>, '1.1'),
        getItem(<NavLink to="/voucher/addvoucher">Vouchers</NavLink> , '1.2'),
        getItem('Opening Balances', '1.3'),
        getItem('Trial Level Balance Wise', '1.4'),
        getItem('Trial Level Head Wise', '1.5'),
        getItem('Budget Head Wise', '1.6'),
        getItem('Receipt Payment Account', '1.7'),
    ]),
    getItem('Payroll', '2', <DesktopOutlined />),
    getItem('User', 'sub1', <UserOutlined />),
    getItem('Production', 'sub2', <TeamOutlined />),
    getItem('Sales', '9', <FileOutlined />),
    getItem('Purchase', '10', <FileOutlined />),
    getItem('Security', '11', <FileOutlined />),
];
const SideMenu = () => {
    const [collapsed, setCollapsed] = useState(true);
    return (
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <Menu theme="dark" defaultSelectedKeys={['0']} mode="inline" items={items} />
        </Sider>
    );
};
export default SideMenu;