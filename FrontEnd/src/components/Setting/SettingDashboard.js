import React from 'react'
import { Link } from 'react-router-dom'

const SettingDashboard = () => {
  return (
    <div><Link className='button button-primary' to={`/send-invitation`}>invitation</Link></div>
  )
}

export default SettingDashboard