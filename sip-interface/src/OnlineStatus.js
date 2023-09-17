import { Avatar, Badge, Typography } from 'antd'
import React from 'react'

const statuses = {
    registered: "#87d068",
}

export default function OnlineStatus({status, title}) {
  return (
    <Badge offset={[10, 5]} dot count={<Avatar style={{backgroundColor:statuses[status]}} size={12} shape="circle" />}>
        <Typography.Title level={3}>
        {title}
        </Typography.Title>
    </Badge>
  )
}
