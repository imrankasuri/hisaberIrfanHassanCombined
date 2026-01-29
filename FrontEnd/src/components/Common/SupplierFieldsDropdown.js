import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Input, Select, Space, Row, Col, Form, message } from 'antd';
import axios from 'axios';
import Config from '../../Config';
let index = 0;
const SupplierFieldsDropdown = () => {
    const AccessKey = localStorage.getItem("AccessKey");
    const UserID = localStorage.getItem("ID");
    const FYear = localStorage.getItem("DefaultFYear");
    const CompanyID = localStorage.getItem("CompanyID");

    useEffect(() => {
        GetField1DropdownData()
        GetField2DropdownData()
        GetField3DropdownData()
        GetField4DropdownData()
    }, [CompanyID])


    const [FieldOneItems, setFieldOneItems] = useState([]);
    const [FieldOneName, setFieldOneName] = useState('');
    const [input1Error, setInput1Error] = useState(false);

    const GetField1DropdownData = async () => {
        try {
            const response = await axios.get(
                Config.base_url +
                `DropdownData/GetDropdownData/${CompanyID}?Type=Field1`,
                {
                    headers: {
                        Authorization: `Bearer ${AccessKey}`,
                    },
                }
            );
            if (response.data.status_code === 1) {
                setFieldOneItems(response.data.dropdownData);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const onFieldOneNameChange = (event) => {
        setFieldOneName(event.target.value);
        setInput1Error(false);
    };
    const addFieldOneItem = async (e) => {
        e.preventDefault();
        if (!FieldOneName.trim()) {
            setInput2Error(true);
            message.error('Field 1 Name is required.');
            return;
        }
        const data = {
            name: FieldOneName,
            type: "Field1",
            isActive: true,
            isDeleted: false,
            companyID: CompanyID,
            shortName: ""
        };

        const response = await axios.get(
            Config.base_url +
            `DropdownData/GetDropdownDataByName/${CompanyID}?Type=Field1&name=${FieldOneName}`,
            {
                headers: {
                    Authorization: `Bearer ${AccessKey}`,
                },
            }
        );

        const length = response.data.dropdownData.length;
        if (length > 0) {
            message.error("Field 1 Already Added");
            return;
        }

        try {
            const response = await axios.post(
                Config.base_url + `DropdownData/AddDropdownData`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${AccessKey}`,
                    },
                }
            );
            if (response.data.status_code === 1) {
                GetField1DropdownData();
                setFieldOneName('');
            }
        } catch (error) {
            console.error(error);
        }
    };


    const [FieldTwoItems, setFieldTwoItems] = useState([]);
    const [FieldTwoName, setFieldTwoName] = useState('');
    const [input2Error, setInput2Error] = useState(false);

    const GetField2DropdownData = async () => {
        try {
            const response = await axios.get(
                Config.base_url +
                `DropdownData/GetDropdownData/${CompanyID}?Type=Field1`,
                {
                    headers: {
                        Authorization: `Bearer ${AccessKey}`,
                    },
                }
            );
            if (response.data.status_code === 1) {
                setFieldTwoItems(response.data.dropdownData);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const onFieldTwoNameChange = (event) => {
        setFieldTwoName(event.target.value);
        setInput2Error(false);
    };
    const addFieldTwoItem = async (e) => {
        e.preventDefault();
        if (!FieldTwoName.trim()) {
            setInput2Error(true);
            message.error('Field 2 Name is required.');
            return;
        }
        const data = {
            name: FieldTwoName,
            type: "Field1",
            isActive: true,
            isDeleted: false,
            companyID: CompanyID,
            shortName: ""
        };

        const response = await axios.get(
            Config.base_url +
            `DropdownData/GetDropdownDataByName/${CompanyID}?Type=Field1&name=${FieldTwoName}`,
            {
                headers: {
                    Authorization: `Bearer ${AccessKey}`,
                },
            }
        );

        const length = response.data.dropdownData.length;
        if (length > 0) {
            message.error("Field 2 Already Added");
            return;
        }

        try {
            const response = await axios.post(
                Config.base_url + `DropdownData/AddDropdownData`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${AccessKey}`,
                    },
                }
            );
            if (response.data.status_code === 1) {
                GetField2DropdownData();
                setFieldTwoName('');
            }
        } catch (error) {
            console.error(error);
        }
    };


    const [FieldThreeItems, setFieldThreeItems] = useState([]);
    const [FieldThreeName, setFieldThreeName] = useState('');
    const [input3Error, setInput3Error] = useState(false);

    const onFieldThreeNameChange = (e) => {
        setFieldThreeName(e.target.value);
        setInput3Error(false);
    };
    const GetField3DropdownData = async () => {
        try {
            const response = await axios.get(
                Config.base_url +
                `DropdownData/GetDropdownData/${CompanyID}?Type=Field1`,
                {
                    headers: {
                        Authorization: `Bearer ${AccessKey}`,
                    },
                }
            );
            if (response.data.status_code === 1) {
                setFieldThreeItems(response.data.dropdownData);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const addFieldThreeItem = async (e) => {
        e.preventDefault();
        if (!FieldThreeName.trim()) {
            setInput3Error(true);
            message.error('Field 3 Name is required.');
            return;
        }
        const data = {
            name: FieldThreeName,
            type: "Field1",
            isActive: true,
            isDeleted: false,
            companyID: CompanyID,
            shortName: ""
        };

        const response = await axios.get(
            Config.base_url +
            `DropdownData/GetDropdownDataByName/${CompanyID}?Type=Field1&name=${FieldThreeName}`,
            {
                headers: {
                    Authorization: `Bearer ${AccessKey}`,
                },
            }
        );

        const length = response.data.dropdownData.length;
        if (length > 0) {
            message.error("Field3 Already Added");
            return;
        }

        try {
            const response = await axios.post(
                Config.base_url + `DropdownData/AddDropdownData`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${AccessKey}`,
                    },
                }
            );
            if (response.data.status_code === 1) {
                GetField3DropdownData();
                setFieldThreeName('');
            }
        } catch (error) {
            console.error(error);
        }
    };


    const [FieldFourItems, setFieldFourItems] = useState([]);
    const [FieldFourName, setFieldFourName] = useState('');
    const [input4Error, setInput4Error] = useState(false);

    const onFieldFourNameChange = (e) => {
        setFieldFourName(e.target.value);
        setInput4Error(false);
    };
    const GetField4DropdownData = async () => {
        try {
            const response = await axios.get(
                Config.base_url +
                `DropdownData/GetDropdownData/${CompanyID}?Type=Field1`,
                {
                    headers: {
                        Authorization: `Bearer ${AccessKey}`,
                    },
                }
            );
            if (response.data.status_code === 1) {
                setFieldFourItems(response.data.dropdownData);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const addFieldFourItem = async (e) => {
        e.preventDefault();
        if (!FieldFourName.trim()) {
            setInput4Error(true);
            message.error('Field 4 Name is required.');
            return;
        }
        const data = {
            name: FieldFourName,
            type: "Field1",
            isActive: true,
            isDeleted: false,
            companyID: CompanyID,
            shortName: ""
        };

        const response = await axios.get(
            Config.base_url +
            `DropdownData/GetDropdownDataByName/${CompanyID}?Type=Field1&name=${FieldFourName}`,
            {
                headers: {
                    Authorization: `Bearer ${AccessKey}`,
                },
            }
        );

        const length = response.data.dropdownData.length;
        if (length > 0) {
            message.error("Field 4 Already Added");
            return;
        }

        try {
            const response = await axios.post(
                Config.base_url + `DropdownData/AddDropdownData`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${AccessKey}`,
                    },
                }
            );
            if (response.data.status_code === 1) {
                GetField4DropdownData();
                setFieldFourName('');
            }
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <>
            <Form.Item name='field1' label='Field 1'>
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
                                    value={FieldOneName}
                                    onChange={onFieldOneNameChange}
                                    status={input1Error ? 'error' : ''}
                                />
                                <Button type="text" icon={<PlusOutlined />}
                                    onClick={addFieldOneItem}
                                >
                                    Add Field
                                </Button>
                            </Space>
                        </>
                    )}
                    options={FieldOneItems.map((fieldoneitem) => ({
                        label: fieldoneitem.name,
                        value: fieldoneitem.name,
                    }))}
                />
            </Form.Item>
            <Form.Item name='field2' label='Field 2'>
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
                                    value={FieldTwoName}
                                    onChange={onFieldTwoNameChange}
                                    status={input2Error ? 'error' : ''}
                                />
                                <Button type="text" icon={<PlusOutlined />} onClick={addFieldTwoItem}>
                                    Add Field
                                </Button>
                            </Space>
                        </>
                    )}
                    options={FieldTwoItems.map((fieldTwoitem) => ({
                        label: fieldTwoitem.name,
                        value: fieldTwoitem.name,
                    }))}
                />
            </Form.Item>
            <Form.Item name='field3' label='Field 3'>
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
                                    value={FieldThreeName}
                                    onChange={onFieldThreeNameChange}
                                    status={input3Error ? 'error' : ''}
                                // You can add an additional validation message if required
                                />
                                <Button type="text" icon={<PlusOutlined />} onClick={addFieldThreeItem}>
                                    Add Field
                                </Button>
                            </Space>
                        </>
                    )}
                    options={FieldThreeItems.map((fieldThreeitem) => ({
                        label: fieldThreeitem.name,
                        value: fieldThreeitem.name,
                    }))}
                />
            </Form.Item>
            <Form.Item name='field4' label='Field 4'>
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
                                    value={FieldFourName}
                                    onChange={onFieldFourNameChange}
                                    status={input4Error ? 'error' : ''}
                                />
                                <Button type="text" icon={<PlusOutlined />}
                                    onClick={addFieldFourItem}
                                >
                                    Add Field
                                </Button>
                            </Space>
                        </>
                    )}
                    options={FieldFourItems.map((fieldFouritem) => ({
                        label: fieldFouritem.name,
                        value: fieldFouritem.name,
                    }))}
                />
            </Form.Item>
        </>
    );
};
export default SupplierFieldsDropdown