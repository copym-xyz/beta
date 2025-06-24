import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
    blockedUsers: 0
  });

  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          email: 'admin@blockchain.com',
          firstName: 'Admin',
          lastName: 'User',
          userType: 'ADMIN',
          isActive: true,
          createdAt: '2024-01-15',
          lastLogin: '2024-06-22'
        },
        {
          id: 2,
          email: 'john.doe@company.com',
          firstName: 'John',
          lastName: 'Doe',
          userType: 'ISSUER',
          isActive: true,
          createdAt: '2024-02-10',
          lastLogin: '2024-06-21'
        },
        {
          id: 3,
          email: 'jane.smith@investor.com',
          firstName: 'Jane',
          lastName: 'Smith',
          userType: 'INVESTOR',
          isActive: true,
          createdAt: '2024-03-05',
          lastLogin: '2024-06-20'
        },
        {
          id: 4,
          email: 'mike.wilson@blockchain.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          userType: 'ADMIN',
          isActive: false,
          createdAt: '2024-01-20',
          lastLogin: '2024-05-15'
        }
      ]);

      setStats({
        totalUsers: 4,
        adminUsers: 2,
        activeUsers: 3,
        blockedUsers: 1
      });
      setMounted(true);
    }, 300);
  }, []);

  const handleMenuOpen = (event, user) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5
    });
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleViewUser = (user) => {
    console.log('Navigate to user:', user.id);
    handleMenuClose();
  };

  const handleUserRowClick = (user) => {
    console.log('Navigate to user:', user.id);
  };

  const getRoleConfig = (role) => {
    const configs = {
      ADMIN: {
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: '#f093fb',
        bgColor: 'rgba(240, 147, 251, 0.2)'
      },
      ISSUER: {
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#667eea',
        bgColor: 'rgba(102, 126, 234, 0.2)'
      },
      INVESTOR: {
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: '#4facfe',
        bgColor: 'rgba(79, 172, 254, 0.2)'
      }
    };
    return configs[role] || configs.INVESTOR;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const statsData = [
    { 
      key: 'total', 
      value: stats.totalUsers, 
      label: 'Total Users', 
      icon: '👥',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      key: 'admin', 
      value: stats.adminUsers, 
      label: 'Admin Users', 
      icon: '🛡️',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      key: 'active', 
      value: stats.activeUsers, 
      label: 'Active Users', 
      icon: '📈',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    { 
      key: 'blocked', 
      value: stats.blockedUsers, 
      label: 'Blocked Users', 
      icon: '🚫',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    }
  ];

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      background: `
        linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%),
        radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.15) 0%, transparent 50%)
      `,
      minHeight: '100vh',
      padding: '24px',
      position: 'relative',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* Header Section */}
      <div style={{
        marginBottom: '32px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 1
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: '"Playfair Display", serif',
          letterSpacing: '-0.02em'
        }}>
          User Management
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '1.1rem',
          margin: 0,
          fontWeight: 400
        }}>
          Manage system users, roles, and permissions with enterprise-grade controls
        </p>
      </div>

      {/* Premium Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
        position: 'relative',
        zIndex: 1
      }}>
        {statsData.map((stat, index) => (
          <div
            key={stat.key}
            style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '20px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: `${index * 150}ms`,
              animation: `float 6s ease-in-out infinite ${Math.random() * 2}s`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px -15px rgba(102, 126, 234, 0.3)';
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              transition: 'left 0.5s ease',
              pointerEvents: 'none'
            }} />
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '8px',
                  lineHeight: 1
                }}>
                  {stat.value}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
              </div>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                transition: 'all 0.3s ease'
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Users Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        overflow: 'hidden',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 400ms',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Section Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            fontFamily: '"Playfair Display", serif'
          }}>
            System Users
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px 12px 44px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  width: '280px',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.5)',
                pointerEvents: 'none'
              }}>
                🔍
              </div>
            </div>
            

          </div>
        </div>

        {/* Users Table */}
        <div style={{ padding: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px',
              gap: '16px',
              padding: '20px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div>User</div>
              <div>Email</div>
              <div>Role</div>
              <div>Status</div>
              <div>Created</div>
              <div>Last Login</div>
              <div style={{ textAlign: 'center' }}>Actions</div>
            </div>

            {/* Table Body */}
            {filteredUsers.map((user, index) => {
              const roleConfig = getRoleConfig(user.userType);
              return (
                <div
                  key={user.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 80px',
                    gap: '16px',
                    padding: '20px 24px',
                    borderBottom: index < filteredUsers.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transitionDelay: `${600 + index * 100}ms`,
                    alignItems: 'center'
                  }}
                  onClick={() => handleUserRowClick(user)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  
                  {/* User Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: roleConfig.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                      <div style={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '1rem',
                        marginBottom: '4px'
                      }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.8rem'
                      }}>
                        ID: {user.id}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem'
                  }}>
                    {user.email}
                  </div>

                  {/* Role Badge */}
                  <div>
                    <span style={{
                      background: roleConfig.bgColor,
                      color: roleConfig.color,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      border: `1px solid ${roleConfig.color}30`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {user.userType === 'ADMIN' && '👑'}
                      {user.userType === 'ISSUER' && '🏢'}
                      {user.userType === 'INVESTOR' && '👤'}
                      {user.userType}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span style={{
                      background: user.isActive ? 'rgba(79, 172, 254, 0.2)' : 'rgba(255, 154, 158, 0.2)',
                      color: user.isActive ? '#4facfe' : '#ff9a9e',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      border: `1px solid ${user.isActive ? '#4facfe' : '#ff9a9e'}30`
                    }}>
                      {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem'
                  }}>
                    {formatDate(user.createdAt)}
                  </div>

                  {/* Last Login */}
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem'
                  }}>
                    {formatDate(user.lastLogin)}
                  </div>

                  {/* Actions */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={(e) => handleMenuOpen(e, user)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        fontSize: '1.2rem',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#667eea';
                        e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.target.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                        e.target.style.background = 'none';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Premium Action Menu */}
      {anchorEl && (
        <div
          style={{
            position: 'fixed',
            left: menuPosition.x - 100,
            top: menuPosition.y,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '8px',
            zIndex: 1000,
            minWidth: '200px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {[
            { icon: '👁️', label: 'View Profile', action: () => handleViewUser(selectedUser) },
            { icon: '✏️', label: 'Edit User', action: () => handleViewUser(selectedUser) },
            { icon: '👑', label: 'Change Role', action: handleMenuClose },
            { icon: selectedUser?.isActive ? '🚫' : '✅', label: selectedUser?.isActive ? 'Block User' : 'Activate User', action: handleMenuClose },
            { icon: '🗑️', label: 'Delete User', action: handleMenuClose, danger: true }
          ].map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                color: item.danger ? '#ff9a9e' : 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = item.danger ? 'rgba(255, 154, 158, 0.1)' : 'rgba(102, 126, 234, 0.2)';
                e.target.style.color = item.danger ? '#ff9a9e' : '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = item.danger ? '#ff9a9e' : 'rgba(255, 255, 255, 0.9)';
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close menu */}
      {anchorEl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={handleMenuClose}
        />
      )}



      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap');
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          input::placeholder, select {
            color: rgba(255, 255, 255, 0.5);
          }
          
          input:focus, select:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.3) !important;
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
          }
        `}
      </style>
    </div>
  );
};

export default UserManagement;