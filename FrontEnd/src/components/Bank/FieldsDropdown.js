import React, { useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Select, Space, Row, Col, Form } from 'antd';
let index = 0;
const FieldsDropdown = () => {
    const [FieldOneItems, setFieldOneItems] = useState([]);
    const [FieldOneName, setFieldOneName] = useState('');
    const FieldOneRef = useRef(null);
    const onFieldOneNameChange = (event) => {
        setFieldOneName(event.target.value);
    };
    const addFieldOneItem = (e) => {
        e.preventDefault();
        setFieldOneItems([...FieldOneItems, FieldOneName]);
        setFieldOneName('');
        setTimeout(() => {
            FieldOneRef.current?.focus();
        }, 0);
    };
    const [FieldTwoItems, setFieldTwoItems] = useState([]);
    const [FieldTwoName, setFieldTwoName] = useState('');
    const FieldTwoRef = useRef(null);
    const onFieldTwoNameChange = (event) => {
        setFieldTwoName(event.target.value);
    };
    const addFieldTwoItem = (e) => {
        e.preventDefault();
        setFieldTwoItems([...FieldTwoItems, FieldTwoName]);
        setFieldTwoName('');
        setTimeout(() => {
            FieldTwoRef.current?.focus();
        }, 0);
    };
    const [FieldThreeItems, setFieldThreeItems] = useState([]);
    const [FieldThreeName, setFieldThreeName] = useState('');
    const FieldThreeRef = useRef(null);
    const onFieldThreeNameChange = (event) => {
        setFieldThreeName(event.target.value);
    };
    const addFieldThreeItem = (e) => {
        e.preventDefault();
        setFieldThreeItems([...FieldThreeItems, FieldThreeName]);
        setFieldThreeName('');
        setTimeout(() => {
            FieldThreeRef.current?.focus();
        }, 0);
    };
    const [FieldFourItems, setFieldFourItems] = useState([]);
    const [FieldFourName, setFieldFourName] = useState('');
    const FieldFourRef = useRef(null);
    const onFieldFourNameChange = (event) => {
        setFieldFourName(event.target.value);
    };
    const addFieldFourItem = (e) => {
        e.preventDefault();
        setFieldFourItems([...FieldFourItems, FieldFourName]);
        setFieldFourName('');
        setTimeout(() => {
            FieldFourRef.current?.focus();
        }, 0);
    };
    return (
        <>
            <Form.Item name='Field1' label='Select Fields'>
                <Select
                    style={{
                        width: '100%',
                    }}
                    placeholder="Select Field 1"
                    dropdownRender={(menufieldone) => (
                        <>
                            {menufieldone}
                            <Divider
                                style={{
                                    margin: '8px 0',
                                }}
                            />
                            <Space
                                style={{
                                    padding: '0 8px 4px',
                                }}
                            >
                                <Input
                                    placeholder="Enter Name"
                                    ref={FieldOneRef}
                                    value={FieldOneName}
                                    onChange={onFieldOneNameChange}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                <Button type="text" icon={<PlusOutlined />} onClick={addFieldOneItem}>
                                    Add Field
                                </Button>
                            </Space>
                        </>
                    )}
                    options={FieldOneItems.map((fieldoneitem) => ({
                        label: fieldoneitem,
                        value: fieldoneitem,
                    }))}
                />
            </Form.Item>
            <Form.Item name='Field2'>
                <Select
                    style={{
                        width: '100%',
                    }}
                    placeholder="Select Field 2"
                    dropdownRender={(menufieldTwo) => (
                        <>
                            {menufieldTwo}
                            <Divider
                                style={{
                                    margin: '8px 0',
                                }}
                            />
                            <Space
                                style={{
                                    padding: '0 8px 4px',
                                }}
                            >
                                <Input
                                    placeholder="Enter Name"
                                    ref={FieldTwoRef}
                                    value={FieldTwoName}
                                    onChange={onFieldTwoNameChange}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                <Button type="text" icon={<PlusOutlined />} onClick={addFieldTwoItem}>
                                    Add Field
                                </Button>
                            </Space>
                        </>
                    )}
                    options={FieldTwoItems.map((fieldTwoitem) => ({
                        label: fieldTwoitem,
                        value: fieldTwoitem,
                    }))}
                />
            </Form.Item>
            <Form.Item name='Field3'>
                <Select
                    style={{
                        width: '100%',
                    }}
                    placeholder="Select Field 3"
                    dropdownRender={(menufieldThree) => (
                        <>
                            {menufieldThree}
                            <Divider
                                style={{
                                    margin: '8px 0',
                                }}
                            />
                            <Space
                                style={{
                                    padding: '0 8px 4px',
                                }}
                            >
                                <Input
                                    placeholder="Enter Name"
                                    ref={FieldThreeRef}
                                    value={FieldThreeName}
                                    onChange={onFieldThreeNameChange}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                <Button type="text" icon={<PlusOutlined />} onClick={addFieldThreeItem}>
                                    Add Field
                                </Button>
                            </Space>
                        </>
                    )}
                    options={FieldThreeItems.map((fieldThreeitem) => ({
                        label: fieldThreeitem,
                        value: fieldThreeitem,
                    }))}
                />
            </Form.Item>
            <Form.Item name='Field4'>
                <Select
                    style={{
                        width: '100%',
                    }}
                    placeholder="Select Field 4"
                    dropdownRender={(menufieldFour) => (
                        <>
                            {menufieldFour}
                            <Divider
                                style={{
                                    margin: '8px 0',
                                }}
                            />
                            <Space
                                style={{
                                    padding: '0 8px 4px',
                                }}
                            >
                                <Input
                                    placeholder="Enter Name"
                                    ref={FieldFourRef}
                                    value={FieldFourName}
                                    onChange={onFieldFourNameChange}
                                    onKeyDown={(e) => e.stopPropagation()}
                                />
                                <Button type="text" icon={<PlusOutlined />} onClick={addFieldFourItem}>
                                    Add Field
                                </Button>
                            </Space>
                        </>
                    )}
                    options={FieldFourItems.map((fieldFouritem) => ({
                        label: fieldFouritem,
                        value: fieldFouritem,
                    }))}
                />
            </Form.Item>
        </>
    );
};
export default FieldsDropdown