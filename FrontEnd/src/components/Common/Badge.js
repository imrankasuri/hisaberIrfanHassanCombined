import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge, Button } from 'antd';

const BadgeComponent = (props) => {
    return (
        <>
            <NavLink to={props.link}>

                <Badge count={props.count}>

                    <Button type="dashed">
                        Incomplete {props.text}
                    </Button>
                </Badge>
            </NavLink>
        </>
    );
};

export default BadgeComponent;
