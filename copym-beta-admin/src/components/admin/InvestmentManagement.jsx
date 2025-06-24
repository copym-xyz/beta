import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    Button,
    Menu,
    MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const InvestorDirectory = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('All Investors');
    const open = Boolean(anchorEl);

    const investors = [
        { id: 1, name: 'John Smith', kycStatus: 'Verified', investments: 3, portfolioValue: '$250,000', assets: 'BTC, ETH, SOL', lastActivity: '2023-11-15' },
        { id: 2, name: 'Sarah Johnson', kycStatus: 'Pending KYC', investments: 1, portfolioValue: '$75,000', assets: 'BTC', lastActivity: '2023-11-10' },
        { id: 3, name: 'Michael Brown', kycStatus: 'Active', investments: 5, portfolioValue: '$520,000', assets: 'ETH, USDT, BNB', lastActivity: '2023-11-18' },
        { id: 4, name: 'Emma Wilson', kycStatus: 'Inactive', investments: 0, portfolioValue: '$0', assets: '-', lastActivity: '2023-09-22' },
        { id: 5, name: 'Robert Davis', kycStatus: 'Verified', investments: 7, portfolioValue: '$1,250,000', assets: 'BTC, ETH, SOL, MATIC', lastActivity: '2023-11-20' },
    ];

    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    };

    const handleFilterSelect = (filter) => {
        setSelectedFilter(filter);
        handleFilterClose();
    };

    const filteredInvestors = investors.filter(investor => {
        if (selectedFilter === 'All Investors') return true;
        return investor.kycStatus === selectedFilter;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Investor Directory
                </Typography>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField 
                        placeholder="Search investors..."
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 250 }}
                    />

                    <Box sx={{ position: 'relative' }}>
                        <Button 
                            variant="outlined"
                            endIcon={<KeyboardArrowDownIcon />}
                            onClick={handleFilterClick}
                            sx={{
                                minWidth: 150,
                                justifyContent: 'space-between',
                                borderColor: '#1976d2',
                                color: '#1976d2'
                            }}
                        >
                            {selectedFilter}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleFilterClose}
                            MenuListProps={{
                                'aria-labelledby': 'filter-button',
                            }}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem 
                                onClick={() => handleFilterSelect('All Investors')}
                                selected={selectedFilter === 'All Investors'}
                            >
                                All Investors
                            </MenuItem>
                            <MenuItem 
                                onClick={() => handleFilterSelect('Active')}
                                selected={selectedFilter === 'Active'}
                            >
                                Active
                            </MenuItem>
                            <MenuItem 
                                onClick={() => handleFilterSelect('Pending KYC')}
                                selected={selectedFilter === 'Pending KYC'}
                            >
                                Pending KYC
                            </MenuItem>
                            <MenuItem 
                                onClick={() => handleFilterSelect('Verified')}
                                selected={selectedFilter === 'Verified'}
                            >
                                Verified
                            </MenuItem>
                            <MenuItem 
                                onClick={() => handleFilterSelect('Inactive')}
                                selected={selectedFilter === 'Inactive'}
                            >
                                Inactive
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Investor</TableCell>
                            <TableCell>KYC Status</TableCell>
                            <TableCell>Investments</TableCell>
                            <TableCell>Portfolio Value</TableCell>
                            <TableCell>Assets</TableCell>
                            <TableCell>Last Activity</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInvestors.map((investor) => (
                            <TableRow key={investor.id}>
                                <TableCell>{investor.name}</TableCell>
                                <TableCell>{investor.kycStatus}</TableCell>
                                <TableCell>{investor.investments}</TableCell>
                                <TableCell>{investor.portfolioValue}</TableCell>
                                <TableCell>{investor.assets}</TableCell>
                                <TableCell>{investor.lastActivity}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined">View</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default InvestorDirectory;