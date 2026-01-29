import React, { useState } from 'react';
import {

    ReadOutlined,
    FileDoneOutlined,
    CreditCardOutlined,
    MonitorOutlined,
    ContactsOutlined,
    RightOutlined
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

    getItem('Employee', 'emp0', <ContactsOutlined />, [
        getItem(<NavLink to="/payroll/employee/manage">Manage Employees</NavLink>, 'emp1'),
        getItem(<NavLink to="/payroll/employee/add">Employee Types</NavLink>, 'emp2'),
        getItem(<NavLink to="/payroll/employee/designations">Designation</NavLink>, 'emp3'),
    ]),
    getItem('Salary', 'sal0', <CreditCardOutlined />, [
        getItem(<NavLink to="/payroll/salary/salary-type">Salary Types</NavLink>, 'sal1'),
        getItem(<NavLink to="/payroll/salary/bank-salary-list">Bank Salary List</NavLink>, 'sal2'),
        getItem(<NavLink to="/payroll/salary/create-salary">Create Salary </NavLink>, 'sal3'),
        getItem(<NavLink to="/payroll/salary/increase/decrease-salary">Increase Decrease Salary </NavLink>, 'sal4'),
    ]),
    getItem('Reports', 'rep0', <FileDoneOutlined />, [
        getItem(<NavLink to="/payroll/reports/view-reports">View Reports</NavLink>, 'rep1'),
        getItem(<NavLink to="/payroll/reports/zero-reports">Zero Reports</NavLink>, 'rep2'),
        getItem(<NavLink to="/payroll/reports/summary-sheet">Summary Sheet</NavLink>, 'rep3'),
    ]),
    getItem('Arrear / Leave', 'arr0', <ReadOutlined />, [
        getItem(<NavLink to="/payroll/ArrearLeave/AddArrears">Arrear / Leave Deduction</NavLink>, 'arr1'),
        getItem(<NavLink to="/payroll/ArrearLeave/mange-leave">Manage Leaves</NavLink>, 'arr2'),
    ]),
    getItem('Deductions', 'ded0', <MonitorOutlined />, [
        getItem(<NavLink to="/payroll/Deductions/manage-loan-deduction">Manage Loan Deductions</NavLink>, 'ded2'),
        getItem(<NavLink to="/payroll/Deductions/manage-other-deduction">Manage Other Deductions</NavLink>, 'ded4'),
    ]),

];
const PayrollMenu = () => {

    return (
        <Menu id='ant-sidemenu' defaultSelectedKeys={['0']} mode="inline" items={items} />
    );
};
export default PayrollMenu;