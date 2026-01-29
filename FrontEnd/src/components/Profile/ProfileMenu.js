import React from 'react';
import { Menu} from "antd";
import { LockOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';


function ProfileMenu(props) {


    const items = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: (<NavLink to="/profile">General</NavLink>),
        },
        {
            key: '2',
            icon: <LockOutlined />,
            label: (<NavLink to="/change-password">Change Password</NavLink>),
        },
        // {
        //     key: '3',
        //     icon: <KeyOutlined />,
        //     label: (<NavLink to="/member/change-pin">Change Security Pass</NavLink>),
        // },
    ];

    
    return (
        <>
             <Menu
                        mode="inline"
                        id='ant-sidemenu'
                        //openKeys={openKeys}
                        //onOpenChange={onOpenChange}
                        // style={{
                        //     width: 256,
                        // }}
                        items={items}
                    />
        </>
    );
}

export default ProfileMenu;