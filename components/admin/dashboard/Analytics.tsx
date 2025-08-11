"use client";

import React, { useState, useEffect } from 'react'

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        trains: 0,
        users: 0
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            const response = await fetch("/api/admin/analytics",{
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
                }
            });
            const data = await response.json();
            setAnalytics(data);
        };
        fetchAnalytics();
    }, []);
  return (
    <div>
        <h1>Analytics</h1>
        <p>Trains: {analytics.trains}</p>
        <p>Users: {analytics.users}</p>
    </div>
  )
}

export default Analytics