import { Divider, PageHeader, Table, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { getContacts } from '../services/contactservice';

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
];

const {Title} = Typography;

export default function Contacts() {
    const [contacts, setContacts] = useState([])
    useEffect( () => {
        getContacts().then(res => setContacts(res)).catch(err => console.log(err))
    }, [] )

    return (
        <div>
            <Title level={3}>
                Contacts
            </Title>
            <Divider />
            <Table dataSource={contacts} columns={columns} />;
        </div>
    )
}
